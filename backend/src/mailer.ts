import { config } from './config';

// Dev mode: the reset link is always printed in this console.
// Production: set SMTP_* in .env and run `npm i nodemailer` to send real emails.
export async function sendResetEmail(to: string, link: string) {
  console.log(`\n🔑 Password reset link for ${to}:\n   ${link}\n`);
  if (!config.smtp.host) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodemailer = require('nodemailer');
    const t = nodemailer.createTransport({
      host: config.smtp.host, port: config.smtp.port,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    });
    await t.sendMail({ from: config.smtp.from, to, subject: 'Reset your SpeakSphere password',
      text: `Open this link to reset your password (valid 1 hour):\n${link}` });
  } catch (e) {
    console.warn('SMTP is configured but sending failed (is nodemailer installed?):', (e as Error).message);
  }
}
