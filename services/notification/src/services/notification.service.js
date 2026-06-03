import { eq, and, count, desc } from 'drizzle-orm';
import { AppError, NOTIFICATION_STATUS } from '@fems/shared';
import { db, notifications, notificationLog } from '@fems/db';
import { sendNotificationEmail } from './email.service.js';
import { getUserEmail } from '../utils/helpers.js';

export async function createNotification({ userId, title, message, type, sendEmail = true }) {
  const [created] = await db
    .insert(notifications)
    .values({ userId, title, message, type })
    .returning();

  if (sendEmail) {
    const email = await getUserEmail(userId);
    if (email) await sendNotificationEmail(email, title, message);
  }

  return created;
}

export async function createInternalNotification(data) {
  return createNotification(data);
}

export async function listNotifications(userId, { page = 1, limit = 10, status } = {}) {
  const conditions = [eq(notifications.userId, userId)];
  if (status) conditions.push(eq(notifications.status, status));

  const where = and(...conditions);
  const offset = (page - 1) * limit;

  const [totalResult] = await db.select({ total: count() }).from(notifications).where(where);

  const rows = await db
    .select()
    .from(notifications)
    .where(where)
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  return { notifications: rows, page, limit, total: totalResult.total };
}

export async function markAsRead(id, userId) {
  const [updated] = await db
    .update(notifications)
    .set({ status: NOTIFICATION_STATUS.READ })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning();

  if (!updated) throw new AppError('Notification not found', 404);
  return updated;
}

export async function markAllAsRead(userId) {
  await db
    .update(notifications)
    .set({ status: NOTIFICATION_STATUS.READ })
    .where(and(eq(notifications.userId, userId), eq(notifications.status, NOTIFICATION_STATUS.UNREAD)));
  return { message: 'All notifications marked as read' };
}

export async function getUnreadCount(userId) {
  const [result] = await db
    .select({ total: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.status, NOTIFICATION_STATUS.UNREAD)));

  return result.total;
}

export async function hasAlertBeenSent(entityId, notificationType) {
  if (!entityId) return false;

  const [existing] = await db
    .select()
    .from(notificationLog)
    .where(
      and(
        eq(notificationLog.extinguisherId, entityId),
        eq(notificationLog.notificationType, notificationType)
      )
    )
    .limit(1);

  return !!existing;
}

/** @deprecated Prefer hasAlertBeenSent — kept for compatibility */
export async function hasSentToday(entityId, notificationType) {
  return hasAlertBeenSent(entityId, notificationType);
}

export async function logNotificationSent(entityId, notificationType) {
  const today = new Date().toISOString().split('T')[0];
  await db.insert(notificationLog).values({
    extinguisherId: entityId,
    notificationType,
    sentDate: today,
  });
}
