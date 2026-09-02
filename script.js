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
  { title: 'Networking', items: 'Packet Tracer, IP addressing' },
  { title: 'Development', items: 'Python, C++, JavaScript, PHP, Flutter, HTML, CSS' },
  { title: 'Data & Cloud', items: 'Supabase, Vercel, Firebase, MySQL, Power BI, Excel, Pandas' },
  { title: 'Workflow', items: 'Git, GitHub, API integration, debugging, testing, prompt engineering' },
  { title: 'AI & Productivity', items: 'ChatGPT, Claude, AI-assisted automation, prompt engineering, GitHub Copilot' },
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
   Contact form — Resend API via /api/send-email
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const successEl = document.getElementById('contact-success');
  const replyToField = document.getElementById('replyto-field');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const payload = {
      name: formData.get('name')?.toString().trim(),
      email: formData.get('email')?.toString().trim(),
      message: formData.get('message')?.toString().trim(),
    };

    // Keep the hidden reply-to field in sync
    if (replyToField) replyToField.value = payload.email || '';

    // Basic client-side guard (server still validates too)
    if (!payload.name || !payload.email || !payload.message) {
      statusEl.textContent = 'Please fill in all fields.';
      statusEl.classList.remove('success');
      statusEl.classList.add('error');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    statusEl.textContent = 'Sending your message...';
    statusEl.classList.remove('success', 'error');

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

      statusEl.textContent = 'Message sent! I\'ll get back to you soon.';
      statusEl.classList.remove('error');
      statusEl.classList.add('success');

      if (successEl) {
        successEl.hidden = false;
        successEl.textContent = `Thanks, ${payload.name} — a confirmation has been sent to ${payload.email}.`;
      }

      form.reset();
    } catch (err) {
      console.error('Contact form error:', err);
      statusEl.textContent = err.message || 'Unable to send your message. Please email directly.';
      statusEl.classList.remove('success');
      statusEl.classList.add('error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Message';
    }
  });
});
