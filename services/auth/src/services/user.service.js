import bcrypt from 'bcryptjs';
import { eq, and, or, ilike, count, desc, gte, lte } from 'drizzle-orm';
import { AppError, USER_STATUS, ROLES, revokeRefreshToken } from '@fems/shared';
import { db, users } from '@fems/db';
import { sanitizeUser } from '../utils/helpers.js';
import * as otpService from './otp.service.js';

const SALT_ROUNDS = 12;

export async function getProfile(userId) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new AppError('User not found', 404);
  return sanitizeUser(user);
}

export async function updateProfile(userId, data) {
  const [updated] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date(), updatedBy: userId })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) throw new AppError('User not found', 404);
  return sanitizeUser(updated);
}

export async function changePassword(userId, currentPassword, newPassword) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new AppError('User not found', 404);

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new AppError('Current password is incorrect', 400);

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date(), updatedBy: userId })
    .where(eq(users.id, userId));

  return { message: 'Password changed successfully' };
}

export async function listUsers({ page, limit, role, status, search, dateFrom, dateTo }) {
  const conditions = [];

  if (role) conditions.push(eq(users.role, role));
  if (status) conditions.push(eq(users.status, status));
  if (dateFrom) conditions.push(gte(users.createdAt, new Date(`${dateFrom}T00:00:00`)));
  if (dateTo) conditions.push(lte(users.createdAt, new Date(`${dateTo}T23:59:59`)));
  if (search) {
    conditions.push(
      or(
        ilike(users.firstName, `%${search}%`),
        ilike(users.lastName, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const [totalResult] = await db.select({ total: count() }).from(users).where(where);
  const total = totalResult.total;

  const rows = await db
    .select()
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    users: rows.map(sanitizeUser),
    page,
    limit,
    total,
  };
}

export async function getUserById(id) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) throw new AppError('User not found', 404);
  return sanitizeUser(user);
}

export async function createUser(data, createdBy) {
  const email = data.email.toLowerCase();

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) throw new AppError('Email already registered', 409);

  const [user] = await db
    .insert(users)
    .values({
      firstName: data.firstName,
      lastName: data.lastName,
      email,
      role: data.role,
      status: USER_STATUS.PENDING,
      createdBy,
      updatedBy: createdBy,
    })
    .returning();

  try {
    await otpService.createAndSendOtp(email, 'invite');
  } catch (err) {
    await db.delete(users).where(eq(users.id, user.id));
    throw err instanceof AppError
      ? err
      : new AppError('Failed to send invite email. User was not created.', 502);
  }

  return sanitizeUser(user);
}

export async function updateUser(id, data, updatedBy) {
  const [updated] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date(), updatedBy })
    .where(eq(users.id, id))
    .returning();

  if (!updated) throw new AppError('User not found', 404);
  return sanitizeUser(updated);
}

export async function deleteUser(id, deletedBy) {
  if (id === deletedBy) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!target) throw new AppError('User not found', 404);

  if (target.role === ROLES.ADMIN) {
    throw new AppError('Admin accounts cannot be deleted', 403);
  }

  await revokeRefreshToken(id);
  await db.delete(users).where(eq(users.id, id));

  return { id: target.id, email: target.email };
}

export async function getUserByEmail(email) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return user ? sanitizeUser(user) : null;
}
