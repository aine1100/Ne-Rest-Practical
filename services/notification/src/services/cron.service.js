import {
  getAdminUserIds,
  getExtinguishersApproachingExpiry,
  getExpiredExtinguishers,
  markExtinguisherExpired,
  getUpcomingInspections,
  daysUntilDate,
  todayIsoDate,
} from '../utils/helpers.js';
import {
  createNotification,
  hasAlertBeenSent,
  logNotificationSent,
} from './notification.service.js';
import { logger, NOTIFICATION_TYPES } from '@fems/shared';

const EXPIRY_TIERS = [
  {
    maxDays: 1,
    type: NOTIFICATION_TYPES.EXPIRY_WARNING_1D,
    title: 'URGENT: Extinguisher Expiring Tomorrow',
    message: (ext, days) =>
      `Extinguisher ${ext.serial_number} (${ext.building}, ${ext.floor}/${ext.room}) expires ${days === 1 ? 'tomorrow' : `in ${days} day(s)`}.`,
  },
  {
    maxDays: 7,
    type: NOTIFICATION_TYPES.EXPIRY_WARNING_7D,
    title: 'Extinguisher Expiring in 7 Days',
    message: (ext, days) =>
      `Extinguisher ${ext.serial_number} (${ext.building}, ${ext.floor}/${ext.room}) expires in ${days} day(s).`,
  },
  {
    maxDays: 30,
    type: NOTIFICATION_TYPES.EXPIRY_WARNING_30D,
    title: 'Extinguisher Expiring in 30 Days',
    message: (ext, days) =>
      `Extinguisher ${ext.serial_number} (${ext.building}, ${ext.floor}/${ext.room}) expires in ${days} day(s).`,
  },
];

async function notifyUser(userId, payload) {
  if (!userId) return;
  await createNotification({ userId, ...payload });
}

async function notifyAdminsAndAssignee(admins, assigneeId, payload) {
  for (const admin of admins) {
    await notifyUser(admin.id, payload);
  }
  await notifyUser(assigneeId, payload);
}

function resolveExpiryAlert(daysRemaining) {
  for (const tier of EXPIRY_TIERS) {
    if (daysRemaining <= tier.maxDays) return tier;
  }
  return null;
}

export async function runExpiryAlertJob() {
  const admins = await getAdminUserIds();
  if (!admins.length) {
    logger.warn('No admin users found for expiry alerts');
  }

  let expiryAlertsSent = 0;
  const approaching = await getExtinguishersApproachingExpiry();

  for (const ext of approaching) {
    const daysRemaining = daysUntilDate(ext.expiry_date);
    const tier = resolveExpiryAlert(daysRemaining);
    if (!tier) continue;

    const alreadySent = await hasAlertBeenSent(ext.id, tier.type);
    if (alreadySent) continue;

    const message = tier.message(ext, daysRemaining);
    await notifyAdminsAndAssignee(admins, ext.assigned_user_id, {
      title: tier.title,
      message,
      type: tier.type,
    });

    await logNotificationSent(ext.id, tier.type);
    expiryAlertsSent += 1;
  }

  let expiredAlertsSent = 0;
  const expired = await getExpiredExtinguishers();

  for (const ext of expired) {
    await markExtinguisherExpired(ext.id);

    const alreadySent = await hasAlertBeenSent(ext.id, NOTIFICATION_TYPES.EXPIRED);
    if (alreadySent) continue;

    const message = `Extinguisher ${ext.serial_number} has expired and status was updated to Expired.`;
    await notifyAdminsAndAssignee(admins, ext.assigned_user_id, {
      title: 'Extinguisher Expired',
      message,
      type: NOTIFICATION_TYPES.EXPIRED,
    });

    await logNotificationSent(ext.id, NOTIFICATION_TYPES.EXPIRED);
    expiredAlertsSent += 1;
  }

  logger.info(
    `Expiry alert job completed: ${expiryAlertsSent} warning(s), ${expiredAlertsSent} expired alert(s), ${approaching.length} monitored`
  );
}

export async function runInspectionDueJob() {
  const upcoming = await getUpcomingInspections();
  const today = todayIsoDate();
  let remindersSent = 0;

  for (const inspection of upcoming) {
    const isToday = inspection.inspection_date === today;
    const dedupeKey = isToday
      ? `inspection_due_today_${inspection.id}`
      : `inspection_due_${inspection.id}`;

    const alreadySent = await hasAlertBeenSent(inspection.id, dedupeKey);
    if (alreadySent) continue;

    const title = isToday ? 'Inspection Due Today' : 'Inspection Due Tomorrow';
    const whenLabel = isToday ? 'today' : 'tomorrow';

    await notifyUser(inspection.inspector_id, {
      title,
      message: `Inspection #${inspection.id} for extinguisher #${inspection.extinguisher_id} is scheduled for ${whenLabel} (${inspection.inspection_time || 'time TBD'}).`,
      type: NOTIFICATION_TYPES.INSPECTION_DUE,
    });

    await notifyUser(inspection.created_by, {
      title,
      message: `Inspection #${inspection.id} for extinguisher #${inspection.extinguisher_id} is scheduled for ${whenLabel}.`,
      type: NOTIFICATION_TYPES.INSPECTION_DUE,
    });

    await notifyUser(inspection.assigned_user_id, {
      title,
      message: `An inspection for your assigned extinguisher #${inspection.extinguisher_id} is scheduled for ${whenLabel}.`,
      type: NOTIFICATION_TYPES.INSPECTION_DUE,
    });

    await logNotificationSent(inspection.id, dedupeKey);
    remindersSent += 1;
  }

  logger.info(
    `Inspection due job completed: ${remindersSent} reminder(s) sent, ${upcoming.length} upcoming inspection(s) checked`
  );
}

export async function runAllNotificationJobs() {
  await runExpiryAlertJob();
  await runInspectionDueJob();
}
