import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '@fems/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER?.trim(),
      pass: process.env.SMTP_PASSWORD?.replace(/\s/g, ''),
    },
  });

  return transporter;
}

export async function sendNotificationEmail(to, title, message) {
  if (!to || !process.env.SMTP_USER) return;

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: title,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #FF383C;">${title}</h2>
          <p>${message}</p>
        </div>
      `,
    });
    logger.info(`Notification email sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send notification email: ${err.message}`);
  }
}
