import * as redis from '@fems/shared';
import config from '../config/index.js';
import { generateOtp, getOtpKey, getResendCountKey } from '../utils/helpers.js';
import { sendOtpEmail } from './email.service.js';
import { AppError } from '@fems/shared';

const OTP_TTL = config.otpExpiryMinutes * 60;

export async function clearOtp(email) {
  const normalized = email.toLowerCase();
  await redis.del(getOtpKey(normalized));
  await redis.del(getResendCountKey(normalized));
}

export async function createAndSendOtp(email, purpose = 'invite') {
  const otp = generateOtp();
  const key = getOtpKey(email);

  await redis.setex(key, OTP_TTL, otp);
  await redis.setex(getResendCountKey(email), OTP_TTL, '0');

  try {
    await sendOtpEmail(email, otp, purpose);
  } catch {
    await clearOtp(email);
    throw new AppError('Failed to send email. Please try again later.', 502);
  }

  return otp;
}

export async function verifyOtp(email, otp) {
  const key = getOtpKey(email);
  const stored = await redis.get(key);

  if (!stored) {
    throw new AppError('OTP expired or not found. Please request a new one.', 400);
  }

  if (stored !== otp) {
    throw new AppError('Invalid OTP', 400);
  }

  await redis.del(key);
  return true;
}

export async function resendOtp(email, purpose = 'invite') {
  const countKey = getResendCountKey(email);
  let count = parseInt((await redis.get(countKey)) || '0', 10);

  if (count >= config.otpMaxResends) {
    throw new AppError('Maximum OTP resend limit reached. Please try again later.', 429);
  }

  count += 1;
  await redis.incr(countKey);
  await redis.expire(countKey, OTP_TTL);

  const otp = generateOtp();
  await redis.setex(getOtpKey(email), OTP_TTL, otp);

  try {
    await sendOtpEmail(email, otp, purpose);
  } catch {
    await clearOtp(email);
    throw new AppError('Failed to send email. Please try again later.', 502);
  }

  return { remainingResends: config.otpMaxResends - count };
}
