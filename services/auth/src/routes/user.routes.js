import { Router } from 'express';
import { asyncHandler } from '@fems/shared';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import * as userController from '../controllers/user.controller.js';
import {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  listUsersQuerySchema,
} from '../validators/user.validator.js';

const router = Router();

router.get('/profile', authenticate, asyncHandler(userController.getProfile));
router.put('/profile', authenticate, validate(updateProfileSchema), asyncHandler(userController.updateProfile));
router.put('/change-password', authenticate, validate(changePasswordSchema), asyncHandler(userController.changePassword));

router.get('/', authenticate, requireAdmin, validate(listUsersQuerySchema, 'query'), asyncHandler(userController.listUsers));
router.get('/:id', authenticate, requireAdmin, asyncHandler(userController.getUserById));
router.post('/', authenticate, requireAdmin, validate(createUserSchema), asyncHandler(userController.createUser));
router.put('/:id', authenticate, requireAdmin, validate(updateUserSchema), asyncHandler(userController.updateUser));
router.delete('/:id', authenticate, requireAdmin, asyncHandler(userController.deleteUser));

export default router;
