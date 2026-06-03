import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

export default {
  port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '30', 10),
  otpMaxResends: parseInt(process.env.OTP_MAX_RESENDS || '3', 10),
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER?.trim(),
    pass: process.env.SMTP_PASSWORD?.replace(/\s/g, ''),
    from: process.env.SMTP_FROM,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3010',
};
