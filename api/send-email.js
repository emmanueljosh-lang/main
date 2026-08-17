import { Resend } from 'resend';

const FORM_SUBMIT_URL = 'https://formsubmit.co/ajax/ejosh8650@gmail.com';
const RECIPIENT_EMAIL = 'ejosh8650@gmail.com';
const SENDER_NAME = 'Emmanuel Josh Dinsay';
const SENDER_ADDRESS = 'no-reply@emmanuel-josh-portfolio.vercel.app'; // must be a VERIFIED domain in Resend
const FROM = `${SENDER_NAME} <${SENDER_ADDRESS}>`;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const safeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, email, message } = request.body || {};

  if (!name || !email || !message) {
    response.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const sentAt = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date());

  // --- Path 1: Resend (preferred, if configured) ---
  if (resend) {
    // Strip anything that could break/inject into an email header (newlines,
    // angle brackets, quotes). Header values must be a single line.
    const safeName = String(name).replace(/[\r\n<>"]/g, '').trim().slice(0, 100);

    // Show the VISITOR's name in your inbox (e.g. "Josh Dela Cruz (via Portfolio)"),
    // even though the actual sending address stays on your verified domain.
    const notifyFrom = `${safeName || 'Portfolio Visitor'} (via Portfolio) <${SENDER_ADDRESS}>`;

    const promises = [];
    let notifyIndex = -1;
    let confirmIndex = -1;

    // Do not send notification to yourself if you are the one submitting the form (self-testing)
    const shouldNotify = email.toLowerCase() !== RECIPIENT_EMAIL.toLowerCase();

    if (shouldNotify) {
      notifyIndex = promises.length;
      promises.push(
        resend.emails.send({
          from: notifyFrom,
          to: [RECIPIENT_EMAIL],
          subject: `Portfolio contact from ${name} • ${sentAt}`,
          replyTo: email, // camelCase — 'reply_to' is silently ignored by the SDK
          text: `New portfolio contact message\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}\n\nSent at (Philippines time): ${sentAt}`,
          html: `<div style="font-family: Inter, system-ui, -apple-system, sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin-top: 0; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
              New Portfolio Contact Submission
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
              <thead>
                <tr style="background-color: #2b4c8c; color: #ffffff; text-align: left;">
                  <th style="padding: 10px 12px; font-weight: 600; border-top-left-radius: 4px; border-bottom-left-radius: 4px;">Name</th>
                  <th style="padding: 10px 12px; font-weight: 600; border-top-right-radius: 4px; border-bottom-right-radius: 4px;">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px; font-weight: 600; color: #4b5563; width: 30%;">name</td>
                  <td style="padding: 12px; color: #111827; white-space: pre-wrap;">${safeHtml(name)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px; font-weight: 600; color: #4b5563;">email</td>
                  <td style="padding: 12px; color: #111827;"><a href="mailto:${email}" style="color: #2b4c8c; text-decoration: none;">${safeHtml(email)}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px; font-weight: 600; color: #4b5563;">message</td>
                  <td style="padding: 12px; color: #111827; white-space: pre-wrap;">${safeHtml(message)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: 600; color: #4b5563;">Sent at (Philippines time)</td>
                  <td style="padding: 12px; color: #111827;">${safeHtml(sentAt)}</td>
                </tr>
              </tbody>
            </table>
            <div style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px;">
              Sent from the contact form on your portfolio site.
            </div>
          </div>`,
        })
      );
    }

    confirmIndex = promises.length;
    promises.push(
      resend.emails.send({
        from: FROM,
        to: [email],
        subject: 'Thank you for contacting Emmanuel',
        text: `Hi ${name},\n\nThanks for your message. I have received it and will reply as soon as possible.\n\nYour message:\n${message}\n\nSent at (Philippines time): ${sentAt}\n\nBest regards,\n${SENDER_NAME}`,
        html: `<div style="font-family: Inter, system-ui, sans-serif; color:#111; line-height:1.6;">
          <h2>Thanks for your message, ${safeHtml(name)}!</h2>
          <p>Your note has been received and I'll reply as soon as possible.</p>
          <p><strong>Your message:</strong></p>
          <p>${safeHtml(message)}</p>
          <p>Sent at (Philippines time): ${safeHtml(sentAt)}</p>
          <p>Best regards,<br/>${safeHtml(SENDER_NAME)}</p>
        </div>`,
      })
    );

    const results = await Promise.allSettled(promises);

    const notifyResult = notifyIndex !== -1 ? results[notifyIndex] : null;
    const confirmResult = results[confirmIndex];

    // If we sent a notification and it was successful, or if we skipped notification (since it is self-testing) and confirmation succeeded
    if ((notifyResult && notifyResult.status === 'fulfilled') || (!shouldNotify && confirmResult.status === 'fulfilled')) {
      if (confirmResult.status === 'rejected') {
        console.error('Confirmation email failed:', confirmResult.reason);
      }
      response.status(200).json({ ok: true, message: 'Message delivered.' });
      return;
    }

    if (notifyResult && notifyResult.status === 'rejected') {
      console.error('Resend notify email failed:', notifyResult.reason);
    }
    // Fall through to FormSubmit backup below.
  }

  // --- Path 2: FormSubmit fallback (no RESEND_API_KEY, or Resend failed) ---
  try {
    const shouldNotify = email.toLowerCase() !== RECIPIENT_EMAIL.toLowerCase();

    if (!shouldNotify) {
      response.status(200).json({ ok: true, message: 'Self-test skipped FormSubmit notification.' });
      return;
    }

    const referer = request.headers.referer || 'https://emmanuel-josh-portfolio.vercel.app/';

    const fsResponse = await fetch(FORM_SUBMIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Referer': referer
      },
      body: JSON.stringify({
        name,
        email,
        message: `${message}\n\nSent at (Philippines time): ${sentAt}`,
        _subject: `Portfolio message from ${name}`,
        _replyto: email,
      }),
    });

    if (!fsResponse.ok) {
      throw new Error(`FormSubmit responded with ${fsResponse.status}`);
    }

    response.status(200).json({ ok: true, message: 'Message delivered via FormSubmit.' });
  } catch (err) {
    console.error('FormSubmit fallback failed:', err);
    response.status(500).json({ error: 'Unable to send your message. Please email directly.' });
  }
}
