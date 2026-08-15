const form = document.getElementById('contact-form');
const FORM_SUBMIT_ENDPOINT = '/api/send-email';
const statusMessage = document.getElementById('form-status');
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

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    setNavOpen(!isOpen);
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavOpen(false));
  });

  const backdrop = document.querySelector('.nav-backdrop');
  backdrop?.addEventListener('click', () => setNavOpen(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setNavOpen(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) {
      setNavOpen(false);
    }
  });
}

const replyToField = document.getElementById('replyto-field');
const emailField = document.querySelector('#contact-form input[name="email"]');
const successDetails = document.getElementById('contact-success');
const submitButton = document.querySelector('#contact-form button[type="submit"]');

const showSuccessDetails = (name, email, message) => {
  if (!successDetails) return;

  successDetails.innerHTML = `
    <p class="success-heading">Message sent successfully!</p>
    <dl>
      <dt>Name</dt>
      <dd>${name}</dd>
      <dt>Email</dt>
      <dd>${email}</dd>
      <dt>Message</dt>
      <dd>${message}</dd>
    </dl>
  `;
  successDetails.hidden = false;
};

const hideSuccessDetails = () => {
  if (!successDetails) return;
  successDetails.hidden = true;
  successDetails.innerHTML = '';
};

if (replyToField && emailField) {
  emailField.addEventListener('input', () => {
    replyToField.value = emailField.value.trim();
  });
}

if (form && statusMessage && submitButton) {
  const setFormStatus = (message, type = 'neutral') => {
    statusMessage.textContent = message;
    statusMessage.classList.toggle('success', type === 'success');
    statusMessage.classList.toggle('error', type === 'error');
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nameValue = form.querySelector('input[name="name"]')?.value.trim() || '';
    const emailValue = form.querySelector('input[name="email"]')?.value.trim() || '';
    const messageValue = form.querySelector('textarea[name="message"]')?.value.trim() || '';

    if (!nameValue || !emailValue || !messageValue) {
      setFormStatus('Please fill out name, email, and message before sending.', 'error');
      return;
    }

    if (replyToField) {
      replyToField.value = emailValue;
    }

    hideSuccessDetails();
    setFormStatus('Sending your message...', 'neutral');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
      const response = await fetch(FORM_SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: nameValue,
          email: emailValue,
          message: messageValue,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const rawBody = await response.text();
      let result = null;

      if (contentType.includes('application/json')) {
        result = JSON.parse(rawBody);
      }

      if (!response.ok) {
        console.error('FormSubmit error status:', response.status, rawBody);
        const message = result?.message || rawBody || 'Submission failed.';
        throw new Error(message);
      }

      if (result && result.success !== 'true' && !result.success) {
        throw new Error(result.message || 'Submission failed.');
      }

      setFormStatus('Message sent successfully — thank you for reaching out! I’ll reply soon.', 'success');
      // Do not display submitted personal details on the page — keep success details hidden for privacy.
      hideSuccessDetails();
      form.reset();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'The message could not be sent right now.';
      setFormStatus(`${message} Please email me directly at ejosh8650@gmail.com.`, 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Message';
    }
  });
}
