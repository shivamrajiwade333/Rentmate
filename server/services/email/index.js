const nodemailer = require('nodemailer');

exports.sendEmail = async ({ to, subject, html, text }) => {
  const provider = process.env.EMAIL_PROVIDER || 'smtp';

  try {
    if (provider === 'resend') {
      await sendViaResend({ to, subject, html, text });
    } else {
      await sendViaSMTP({ to, subject, html, text });
    }
  } catch (error) {
    console.error(`Email delivery failed to ${to}:`, error.message);
    // We don't throw error to prevent main transaction failure
  }
};

const sendViaResend = async ({ to, subject, html, text }) => {
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    to,
    subject,
    html: html || text,
    text: text || '',
  });
};

const sendViaSMTP = async ({ to, subject, html, text }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: html || text,
    text: text || '',
  });
};
