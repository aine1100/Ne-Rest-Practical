import nodemailer from 'nodemailer';
import config from '../config/index.js';
import { logger } from '@fems/shared';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: false,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  return transporter;
}

function getInviteLink(email) {
  return `${config.frontendUrl}/accept-invite?email=${encodeURIComponent(email.toLowerCase())}`;
}

export async function sendOtpEmail(to, otp, purpose = 'verification') {
  const subjects = {
    verification: 'FEMS - Verify Your Account',
    reset: 'FEMS - Password Reset OTP',
    invite: 'FEMS - You Have Been Invited',
  };

  const inviteLink = purpose === 'invite' ? getInviteLink(to) : null;

  const messages = {
    verification: `Your verification code is: ${otp}. It expires in 30 minutes.`,
    reset: `Your password reset code is: ${otp}. It expires in 30 minutes.`,
    invite: inviteLink
      ? `You have been invited to FEMS. Your verification code is: ${otp}. It expires in 30 minutes.\n\nAccept your invite: ${inviteLink}`
      : `You have been invited to FEMS. Your verification code is: ${otp}. It expires in 30 minutes.`,
  };

  const inviteHtml = inviteLink
    ? `
        <p style="margin: 24px 0;">
          <a href="${inviteLink}" style="display: inline-block; background: #FF383C; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Accept Invite
          </a>
        </p>
        <p style="color: #6B7280; font-size: 14px;">Or copy this link: ${inviteLink}</p>
      `
    : '';

  const mailOptions = {
    from: config.smtp.from,
    to,
    subject: subjects[purpose] || subjects.verification,
    text: messages[purpose] || messages.verification,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF383C;">Fire Extinguisher Management System</h2>
        <p>${messages[purpose] || messages.verification}</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1A1D21;">${otp}</p>
        ${inviteHtml}
        <p style="color: #6B7280;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await getTransporter().sendMail(mailOptions);
    logger.info(`OTP email sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send OTP email to ${to}: ${err.message}`);
    throw err;
  }
}
