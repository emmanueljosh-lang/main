/* ──────────────────────────────────────────────
   Contact channels — single source of truth
   Mirrors: const NAV_LINKS / const SKILLS pattern below.
   The phone number lives here ONCE. Every <a data-contact="…">
   in the HTML is a blank intent slot; applyContactLinks() fills in
   the correct href for each channel. Change a number here and every
   tel:/viber: link on the page updates together — this is what
   caught the earlier bug where the contact-info Viber link had
   silently drifted to a tel: href while the social-row Viber link
   correctly used viber://. One source, no drift.
   ────────────────────────────────────────────── */
const CONTACT = {
  // Local dialing format, as written on the page and used for tel:.
  phoneLocal: '09771688613',
  // E.164 format (country code, no leading 0) — what Viber's URL
  // scheme expects. Derived once here rather than hand-encoded
  // wherever a Viber link happens to appear.
  phoneE164: '+639771688613',
};

const CONTACT_HREF_BUILDERS = {
  tel: () => `tel:${CONTACT.phoneLocal}`,
  viber: () => `viber://chat?number=${encodeURIComponent(CONTACT.phoneE164)}`,
};

function applyContactLinks() {
  document.querySelectorAll('[data-contact]').forEach((link) => {
    const buildHref = CONTACT_HREF_BUILDERS[link.dataset.contact];
    if (!buildHref) return; // Unknown channel — leave it alone rather than guess.
    link.href = buildHref();
  });
}

applyContactLinks();

/* ──────────────────────────────────────────────
   Nav data — single source of truth
   Mirrors: const NAV_LINKS = [{ href, label }, …]
   Add a route here — no HTML changes needed.
   ────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
];

/* ──────────────────────────────────────────────
   Global DOM refs & utilities
   ────────────────────────────────────────────── */
const year = document.getElementById('year');
const philTimeDisplay = document.getElementById('phil-time');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navBackdrop = document.querySelector('.nav-backdrop');

/**
 * renderNavLinks() — injects <li><a> nodes from NAV_LINKS.
 * Mirrors: NAV_LINKS.map((link) => <li><a href={link.href}>{link.label}</a></li>)
 * Closing the nav (setNavOpen(false)) is wired after this runs.
 */
function renderNavLinks() {
  if (!siteNav) return;
  const ul = siteNav.querySelector('ul');
  if (!ul) return;
  const fragment = document.createDocumentFragment();
  NAV_LINKS.forEach(({ href, label }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'nav-link';
    a.href = href;
    a.textContent = label;
    li.appendChild(a);
    fragment.appendChild(li);
  });
  ul.appendChild(fragment);
}

renderNavLinks();

/**
 * renderNavToggle() — injects the 3 hamburger bar <span>s into the empty button.
 * The CSS already handles the bars → X animation via aria-expanded.
 * Mirrors: <button> { <span /><span /><span /> } rendered by the component.
 */
function renderNavToggle() {
  if (!navToggle) return;
  for (let i = 0; i < 3; i++) {
    const bar = document.createElement('span');
    bar.setAttribute('aria-hidden', 'true');
    navToggle.appendChild(bar);
  }
}

renderNavToggle();

// Derive navLinks AFTER rendering so it captures the JS-created anchors
const navLinks = siteNav ? siteNav.querySelectorAll('a') : [];

// ── Nav state (single source of truth — mirrors React useState) ──
let navOpen = false;

let lastFocused = null;

if (year) {
  year.textContent = new Date().getFullYear();
}

function getPhilippineTime() {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(new Date());
}

function updatePhilippineTime() {
  if (philTimeDisplay) {
    philTimeDisplay.textContent = `Current time in the Philippines: ${getPhilippineTime()}`;
  }
}

updatePhilippineTime();
setInterval(updatePhilippineTime, 1000);

/* ──────────────────────────────────────────────
   Interactive element touch/click feedback
   ────────────────────────────────────────────── */
const interactiveElements = document.querySelectorAll('.card, .btn, .site-nav a');
interactiveElements.forEach((element) => {
  const activate = () => element.classList.add('is-active');
  const deactivate = () => element.classList.remove('is-active');

  element.addEventListener('touchstart', activate, { passive: true });
  element.addEventListener('touchend', deactivate);
  element.addEventListener('touchcancel', deactivate);
  element.addEventListener('mousedown', activate);
  element.addEventListener('mouseup', deactivate);
  element.addEventListener('mouseleave', deactivate);
});

/* ──────────────────────────────────────────────
   Mobile navigation — state-driven (senior pattern)
   Mirrors: const [navOpen, setNavOpen] = useState(false)
   ────────────────────────────────────────────── */
function handleNavKeydown(event) {
  if (event.key === 'Escape') {
    setNavOpen(false);
    return;
  }

  if (event.key === 'Tab') {
    const focusable = [navToggle, ...Array.from(navLinks)].filter(Boolean);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

/**
 * setNavOpen(next) — declarative state setter.
 * Accepts a boolean OR a functional updater: (prevState) => newState.
 * Mirrors: const [navOpen, setNavOpen] = useState(false)
 *   - setNavOpen(false)         plain boolean
 *   - setNavOpen((o) => !o)     functional updater — always uses latest state
 */
function setNavOpen(next) {
  if (!navToggle || !siteNav) return;

  // Resolve next state — functional updater or plain boolean
  navOpen = typeof next === 'function' ? next(navOpen) : next;

  // Sync DOM to state (like a render() call)
  navToggle.setAttribute('aria-expanded', String(navOpen));
  siteNav.setAttribute('data-open', String(navOpen));
  if (navBackdrop) navBackdrop.setAttribute('data-open', String(navOpen));
  document.body.classList.toggle('nav-open', navOpen);
  document.body.style.overflow = navOpen ? 'hidden' : '';

  if (navOpen) {
    lastFocused = document.activeElement;
    navLinks[0]?.focus();
    document.addEventListener('keydown', handleNavKeydown);
  } else {
    document.removeEventListener('keydown', handleNavKeydown);
    lastFocused?.focus();
  }
}

if (navToggle && siteNav) {
  // Functional updater: (o) => !o — always derives from latest state
  // Mirrors: onClick={() => setNavOpen((o) => !o)}
  navToggle.addEventListener('click', () => setNavOpen((o) => !o));

  // Nav links close the menu (mirrors onClick={() => setNavOpen(false)})
  navLinks.forEach((link) => link.addEventListener('click', () => setNavOpen(false)));

  // Backdrop click closes the menu
  navBackdrop?.addEventListener('click', () => setNavOpen(false));

  // Auto-close when viewport expands past the mobile breakpoint (matches 780px CSS rule)
  window.matchMedia('(min-width: 781px)').addEventListener('change', (event) => {
    if (event.matches && navOpen) setNavOpen(false);
  });
}

/* ──────────────────────────────────────────────
   Skills — declarative data array
   Mirrors: SKILLS.map((s) => <div className="card">…</div>)
   Add / edit a skill here — no HTML changes needed.
   ────────────────────────────────────────────── */
const SKILLS = [
  { title: 'Embedded & IoT', items: 'Arduino, ESP8266, RFID, sensors, Blynk, IoT systems' },
  { title: 'Networking', items: 'Packet Tracer, IP addressing, Basic Network Configuration' },
  { title: 'Development', items: 'Python, C++, JavaScript, PHP, Flutter, HTML, CSS, Node.js, React.js' },
  { title: 'Data & Cloud', items: 'Supabase, Vercel, Firebase, MySQL, Power BI, Excel, Pandas' },
  { title: 'Workflow', items: 'Git, GitHub, API integration, debugging, testing, prompt engineering' },
  { title: 'AI & Productivity', items: 'ChatGPT, Claude, AI-assisted automation, prompt engineering, GitHub Copilot' },
  { title: 'UI/UX & Design', items: 'Dribble, UI/UX Design, responsive design' },
  { title: 'Hardware & Technical Support', items: 'PC compatibility, components, and PC building, Hardware Troubleshooting, OS Installation' },
];

function renderSkills() {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;

  // Build fragment first — single DOM write (no layout thrashing)
  const fragment = document.createDocumentFragment();

  SKILLS.forEach((skill) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>${skill.title}</h3><p>${skill.items}</p>`;
    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

renderSkills();

/* ──────────────────────────────────────────────
   Flip cards (touch devices)
   ────────────────────────────────────────────── */
document.querySelectorAll('.flip-card').forEach((card) => {
  card.addEventListener('click', (event) => {
    if (event.target.closest('a, button, input, textarea, select')) {
      return;
    }

    const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (isTouchDevice) {
      setTimeout(() => {
        card.classList.toggle('is-flipped');
      }, 70);
    }
  });
});

/* ──────────────────────────────────────────────
   Contact form — state-driven (senior pattern)
   Mirrors: const [formState, setFormState] = useState({ status, message, payload })
   ────────────────────────────────────────────── */

// ── DOM refs ──
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
const successEl = document.getElementById('contact-success');
const replyToField = document.getElementById('replyto-field');
const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

// ── Single source of truth ──
// status: 'idle' | 'loading' | 'success' | 'error'
let formState = { status: 'idle', message: '', payload: null };

/**
 * setFormState(next) — declarative state setter.
 * Accepts a plain object OR a functional updater: (prev) => newState.
 * Mirrors: const [formState, setFormState] = useState({ status: 'idle' })
 *   - setFormState({ status: 'loading' })          plain object (merged)
 *   - setFormState((s) => ({ ...s, message: '' })) functional updater
 */
function setFormState(next) {
  // Resolve next state — functional updater or plain object (shallow merge)
  formState = typeof next === 'function'
    ? next(formState)
    : { ...formState, ...next };

  renderForm();  // Sync DOM to state (like a render() call)
}

/**
 * renderForm() — pure DOM sync driven by formState.
 * Never mutate DOM outside this function.
 * Mirrors: useEffect(() => { … }, [formState])
 */
function renderForm() {
  if (!form || !statusEl || !submitBtn) return;

  const { status, message, payload } = formState;

  // ── Submit button state ──
  submitBtn.disabled = status === 'loading';
  submitBtn.textContent = status === 'loading' ? 'Sending…' : 'Send Message';

  // ── Status message ──
  statusEl.textContent = message;
  statusEl.classList.toggle('success', status === 'success');
  statusEl.classList.toggle('error', status === 'error');

  // ── Success detail panel ──
  if (successEl) {
    const show = status === 'success' && Boolean(payload);
    successEl.hidden = !show;
    if (show) {
      successEl.innerHTML = `
        <p class="success-heading">✓ Message delivered</p>
        <dl>
          <dt>Name</dt><dd>${payload.name}</dd>
          <dt>Email</dt><dd>${payload.email}</dd>
          <dt>Sent at</dt><dd>${new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date())}</dd>
        </dl>`;
    }
  }
}

// ── Wire submit event ──
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      name: formData.get('name')?.toString().trim(),
      email: formData.get('email')?.toString().trim(),
      message: formData.get('message')?.toString().trim(),
    };

    // Keep hidden reply-to field in sync
    if (replyToField) replyToField.value = payload.email || '';

    // Client-side guard — server validates too
    if (!payload.name || !payload.email || !payload.message) {
      setFormState({ status: 'error', message: 'Please fill in all fields.' });
      return;
    }

    // Transition → loading
    setFormState({ status: 'loading', message: 'Sending your message…', payload: null });

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      // Transition → success (functional updater merges payload in)
      setFormState((s) => ({
        ...s,
        status: 'success',
        message: `Message sent! I'll get back to you soon.`,
        payload,
      }));

      form.reset();

    } catch (err) {
      console.error('Contact form error:', err);

      // Transition → error
      setFormState({
        status: 'error',
        message: err.message || 'Unable to send. Please email directly.',
        payload: null,
      });
    }
  });
}

// Initialise DOM to match default idle state
renderForm();