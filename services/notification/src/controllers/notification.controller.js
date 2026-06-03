import * as notificationService from '../services/notification.service.js';
import { successResponse, paginatedResponse } from '@fems/shared';

export async function list(req, res) {
  const { page = 1, limit = 10, status } = req.query;
  const result = await notificationService.listNotifications(req.user.id, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    status,
  });
  return paginatedResponse(res, result.notifications, result.page, result.limit, result.total);
}

export async function markRead(req, res) {
  const item = await notificationService.markAsRead(parseInt(req.params.id, 10), req.user.id);
  return successResponse(res, item, 'Notification marked as read');
}

export async function markAllRead(req, res) {
  const result = await notificationService.markAllAsRead(req.user.id);
  return successResponse(res, result, result.message);
}

export async function unreadCount(req, res) {
  const count = await notificationService.getUnreadCount(req.user.id);
  return successResponse(res, { count });
}

export async function createInternal(req, res) {
  const item = await notificationService.createInternalNotification(req.body);
  return successResponse(res, item, 'Notification created', 201);
}
