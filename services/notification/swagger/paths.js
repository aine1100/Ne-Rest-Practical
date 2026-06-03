/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List user notifications
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [unread, read] }
 *     responses:
 *       200:
 *         description: Paginated notifications
 *
 * /notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notification count
 *     responses:
 *       200:
 *         description: Unread count
 *
 * /notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     responses:
 *       200:
 *         description: All marked read
 *
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Notification marked read
 *
 * /notifications/internal:
 *   post:
 *     tags: [Notifications]
 *     summary: Create notification (internal service-to-service)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, title, message, type]
 *             properties:
 *               userId: { type: integer }
 *               title: { type: string }
 *               message: { type: string }
 *               type:
 *                 type: string
 *                 enum: [inspection_due, inspection_overdue, expiry_warning_30d, expiry_warning_7d, expiry_warning_1d, maintenance_reminder]
 *     responses:
 *       201:
 *         description: Notification created
 */

export {};
