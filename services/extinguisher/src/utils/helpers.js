import { AppError } from '@fems/shared';

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function validateExtinguisherDates({ manufactureDate, installationDate, expiryDate }) {
  const manufacture = startOfDay(manufactureDate);
  const installation = startOfDay(installationDate);
  const expiry = startOfDay(expiryDate);
  const today = startOfDay(new Date());

  if (manufacture > today) {
    throw new AppError('Manufacture date cannot be in the future', 400);
  }

  if (installation < manufacture) {
    throw new AppError('Installation date cannot be before manufacture date', 400);
  }

  if (expiry <= manufacture) {
    throw new AppError('Expiry date must be after manufacture date', 400);
  }

  if (installation > expiry) {
    throw new AppError('Installation date cannot be after expiry date', 400);
  }
}

/** @deprecated Use validateExtinguisherDates */
export function validateDates(manufactureDate, expiryDate) {
  validateExtinguisherDates({
    manufactureDate,
    installationDate: manufactureDate,
    expiryDate,
  });
}

export function resolveStatus(expiryDate, requestedStatus) {
  const expiry = startOfDay(expiryDate);
  const today = startOfDay(new Date());

  if (expiry < today) {
    return 'Expired';
  }

  return requestedStatus || 'Active';
}

export function toDateString(date) {
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0];
}

export async function notifyService(payload) {
  const NOTIF_SERVICE = `http://${process.env.NOTIFICATION_SERVICE_HOST || 'localhost'}:${process.env.NOTIFICATION_SERVICE_PORT || 3005}`;

  try {
    await fetch(`${NOTIF_SERVICE}/notifications/internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Notification call failed:', err.message);
  }
}
