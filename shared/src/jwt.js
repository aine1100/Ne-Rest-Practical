import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as redis from './redis.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
}

export async function storeRefreshToken(userId, token) {
  await redis.setex(`refresh:${userId}`, 7 * 24 * 60 * 60, token);
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

export async function revokeRefreshToken(userId) {
  await redis.del(`refresh:${userId}`);
}

export async function validateStoredRefreshToken(userId, token) {
  const stored = await redis.get(`refresh:${userId}`);
  return stored === token;
}

export function generateTempToken(payload) {
  return jwt.sign({ ...payload, type: 'temp' }, ACCESS_SECRET, { expiresIn: '30m' });
}

export function verifyTempToken(token) {
  const decoded = jwt.verify(token, ACCESS_SECRET);
  if (decoded.type !== 'temp') throw new Error('Invalid token type');
  return decoded;
}
