const nodemailer = require('nodemailer');

let transporter = null;

function initMailer() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }
}

async function sendOtpEmail(to, code, expiresMs) {
  if (!transporter) return false;
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.FROM_NAME || 'Inventory Admin';
  const subject = 'Your Admin OTP Code';
  const minutes = Math.round(expiresMs / 60000);
  const text = `Your one-time OTP is ${code}. It expires in ${minutes} minute(s).`;
  const html = `<p>Your one-time OTP is <strong>${code}</strong>.</p><p>It expires in ${minutes} minute(s).</p>`;
  try {
    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (e) {
    console.error('Failed to send OTP email:', e.message);
    return false;
  }
}

initMailer();

module.exports = { sendOtpEmail };
