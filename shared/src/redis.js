import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '7001', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
});

redisClient.on('connect', () => logger.info('Connected to Redis'));
redisClient.on('error', (err) => logger.error(`Redis connection error: ${err.message}`));

export const get = (key) => redisClient.get(key);
export const set = (key, value) => redisClient.set(key, value);
export const setex = (key, seconds, value) => redisClient.setex(key, seconds, value);
export const del = (key) => redisClient.del(key);
export const incr = (key) => redisClient.incr(key);
export const expire = (key, seconds) => redisClient.expire(key, seconds);

export const redis = { get, set, setex, del, incr, expire, client: redisClient };
