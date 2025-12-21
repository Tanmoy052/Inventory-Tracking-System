const nodemailer = require('nodemailer');// Import nodemailer for sending emails

let transporter = null;  //mail sender transporter

function initMailer() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465', 10); // default to 465 ssl
  const secure = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user && pass) {
    transporter = nodemailer.createTransport({ // create transporter object
      host, 
      port,
      secure,//
      auth: { user, pass }, // authentication
    });
  }
}

async function sendOtpEmail(to, code, expiresMs) { // send OTP admins email
  if (!transporter) return false;
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.FROM_NAME || 'Inventory Admin';
  const subject = 'Your Admin OTP Code';
  const minutes = Math.round(expiresMs / 60000);
  const text = `Your one-time OTP is ${code}. It expires in ${minutes} minute(s).`;
  const html = `<p>Your one-time OTP is <strong>${code}</strong>.</p><p>It expires in ${minutes} minute(s).</p>`;
  try {
    await transporter.sendMail({         // send mail
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (e) {
    console.error('Failed to send OTP email:', e.message);
    return false;     // return false on failure
  }
}

initMailer();

module.exports = { sendOtpEmail };
