import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import {
  AppError,
  USER_STATUS,
  ROLES,
  generateAccessToken,
  generateRefreshToken,
  generateTempToken,
  verifyTempToken,
  storeRefreshToken,
  revokeRefreshToken,
  validateStoredRefreshToken,
  verifyRefreshToken,
} from '@fems/shared';
import { db, users } from '@fems/db';
import { sanitizeUser } from '../utils/helpers.js';
import * as otpService from './otp.service.js';

const SALT_ROUNDS = 12;

export async function setupAdmin({ firstName, lastName, email, password }) {
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.role, ROLES.ADMIN))
    .limit(1);

  if (existingAdmin) {
    throw new AppError('Admin account already exists. Use login instead.', 403);
  }

  const normalizedEmail = email.toLowerCase();

  const [existingEmail] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingEmail) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [admin] = await db
    .insert(users)
    .values({
      firstName,
      lastName,
      email: normalizedEmail,
      passwordHash,
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
    })
    .returning();

  const payload = { id: admin.id, email: admin.email, role: admin.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await storeRefreshToken(admin.id, refreshToken);

  return {
    user: sanitizeUser(admin),
    accessToken,
    refreshToken,
  };
}

export async function login(email, password) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user || !user.passwordHash) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AppError('Account is not active. Please complete verification or contact admin.', 403);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await storeRefreshToken(user.id, refreshToken);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function logout(userId) {
  await revokeRefreshToken(userId);
}

export async function refreshAccessToken(refreshToken) {
  let decoded;
  try {
    decoded = await verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const valid = await validateStoredRefreshToken(decoded.id, refreshToken);
  if (!valid) {
    throw new AppError('Refresh token revoked', 401);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, decoded.id))
    .limit(1);

  if (!user || user.status !== USER_STATUS.ACTIVE) {
    throw new AppError('User not found or inactive', 401);
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);

  return { accessToken, user: sanitizeUser(user) };
}

export async function verifyOtpAndGetTempToken(email, otp) {
  await otpService.verifyOtp(email.toLowerCase(), otp);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const tempToken = generateTempToken({ id: user.id, email: user.email });
  return { tempToken, user: sanitizeUser(user) };
}

export async function setPassword(tempToken, password) {
  let decoded;
  try {
    decoded = verifyTempToken(tempToken);
  } catch {
    throw new AppError('Invalid or expired token', 400);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [updated] = await db
    .update(users)
    .set({
      passwordHash,
      status: USER_STATUS.ACTIVE,
      updatedAt: new Date(),
    })
    .where(eq(users.id, decoded.id))
    .returning();

  if (!updated) {
    throw new AppError('User not found', 404);
  }

  return sanitizeUser(updated);
}

export async function forgotPassword(email) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    return { message: 'If the email exists, an OTP has been sent' };
  }

  await otpService.createAndSendOtp(email.toLowerCase(), 'reset');
  return { message: 'If the email exists, an OTP has been sent' };
}

export async function resetPassword(email, otp, password) {
  await otpService.verifyOtp(email.toLowerCase(), otp);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [updated] = await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.email, email.toLowerCase()))
    .returning();

  if (!updated) {
    throw new AppError('User not found', 404);
  }

  await revokeRefreshToken(updated.id);
  return sanitizeUser(updated);
}

export async function resendOtp(email) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const purpose = user.status === USER_STATUS.PENDING ? 'invite' : 'reset';
  return otpService.resendOtp(email.toLowerCase(), purpose);
}
