// Minimal Zoho SMTP mailer shared by any endpoint that needs to send
// transactional email (currently just password reset). Uses nodemailer
// against Zoho's SMTP relay with an app-specific password (not the
// account login password) - see ZOHO_SMTP_PASS in Vercel env vars.

import nodemailer from "nodemailer";

let _transporter = null;
function getTransporter() {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.ZOHO_SMTP_USER || "vibir@fieldpress.studio",
      pass: process.env.ZOHO_SMTP_PASS
    }
  });
  return _transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const transporter = getTransporter();
  const from = process.env.ZOHO_SMTP_FROM || "FieldPress Support <support@fieldpress.studio>";
  await transporter.sendMail({ from, to, subject, html, text });
}
