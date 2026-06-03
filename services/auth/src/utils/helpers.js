export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export function getOtpKey(email) {
  return `otp:${email.toLowerCase()}`;
}

export function getResendCountKey(email) {
  return `otp_resend_count:${email.toLowerCase()}`;
}
