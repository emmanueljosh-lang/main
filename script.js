/* ──────────────────────────────────────────────
   Global DOM refs & utilities
   ────────────────────────────────────────────── */
const year = document.getElementById('year');
const philTimeDisplay = document.getElementById('phil-time');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navBackdrop = document.querySelector('.nav-backdrop');
const navLinks = siteNav ? siteNav.querySelectorAll('a') : [];
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
   Mobile navigation
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

function setNavOpen(open) {
  if (!navToggle || !siteNav) {
    return;
  }

  navToggle.setAttribute('aria-expanded', String(open));
  siteNav.setAttribute('data-open', String(open));
  navBackdrop?.setAttribute('data-open', String(open));
  document.body.classList.toggle('nav-open', open);
  document.body.style.overflow = open ? 'hidden' : '';

  if (open) {
    lastFocused = document.activeElement;
    navLinks[0]?.focus();
    document.addEventListener('keydown', handleNavKeydown);
  } else {
    document.removeEventListener('keydown', handleNavKeydown);
    if (lastFocused) {
      lastFocused.focus();
    }
  }
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    setNavOpen(!isOpen);
  });

  navBackdrop?.addEventListener('click', () => setNavOpen(false));
  navLinks.forEach((link) => link.addEventListener('click', () => setNavOpen(false)));

  window.matchMedia('(min-width:721px)').addEventListener('change', (event) => {
    if (event.matches && navToggle.getAttribute('aria-expanded') === 'true') {
      setNavOpen(false);
    }
  });
}

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
