import { Router } from 'express';
import { asyncHandler, AppError } from '@fems/shared';
import * as controller from '../controllers/notification.controller.js';

const router = Router();

function authenticate(req, _res, next) {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  if (!userId || !userRole) {
    return next(new AppError('Authentication required', 401));
  }

  req.user = { id: parseInt(userId, 10), role: userRole };
  next();
}

router.post('/internal', asyncHandler(controller.createInternal));

router.use(authenticate);

router.get('/', asyncHandler(controller.list));
router.get('/unread-count', asyncHandler(controller.unreadCount));
router.patch('/read-all', asyncHandler(controller.markAllRead));
router.patch('/:id/read', asyncHandler(controller.markRead));

export default router;
