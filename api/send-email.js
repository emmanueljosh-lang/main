import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { name, email, message } = request.body || {};

    if (!name || !email || !message) {
      response.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const safeHtml = (value) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');

    const recipientEmail = 'ejosh8650@gmail.com';
    const senderName = 'Emmanuel Josh Dinsay';
    const senderAddress = 'onboarding@resend.dev';
    const from = `${senderName} <${senderAddress}>`;
    const subject = `Portfolio message from ${name}`;
    const sentAt = new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date());

    const notifyResult = await resend.emails.send({
      from,
      to: [recipientEmail],
      subject,
      reply_to: email,
      text: `New portfolio contact message\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}\n\nSent from the contact form on the portfolio site.`,
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; color: #111; line-height: 1.6;">
          <h2>New portfolio contact message</h2>
          <p><strong>Name:</strong> ${safeHtml(name)}</p>
          <p><strong>Email:</strong> ${safeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <p>${safeHtml(message)}</p>
          <p style="margin-top:1rem; color:#666;">Sent from the contact form on the portfolio site.</p>
        </div>
      `,
    });

    const confirmationResult = await resend.emails.send({
      from,
      to: [email],
      subject: 'Thank you for contacting Emmanuel',
      text: `Hi ${name},\n\nThanks for your message. I have received it and will reply as soon as possible.\n\nYour message:\n${message}\n\nSent at (Philippines time): ${sentAt}\n\nBest regards,\n${senderName}`,
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; color: #111; line-height: 1.6;">
          <h2>Thanks for your message, ${safeHtml(name)}!</h2>
          <p>Your note has been received and I’ll reply as soon as possible.</p>
          <p><strong>Your message:</strong></p>
          <p>${safeHtml(message)}</p>
          <p>Sent at (Philippines time): ${safeHtml(sentAt)}</p>
          <p>Best regards,<br/>${safeHtml(senderName)}</p>
        </div>
      `,
    });

    console.log('Resend notify id:', notifyResult.id);
    console.log('Resend confirmation id:', confirmationResult.id);

    response.status(200).json({ ok: true, message: 'Emails queued for delivery.' });
  } catch (error) {
    console.error('Resend API error:', error);
    response.status(500).json({ error: 'Unable to send email.' });
  }
}
