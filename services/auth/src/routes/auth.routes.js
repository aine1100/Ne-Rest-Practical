import { Router } from 'express';
import { asyncHandler } from '@fems/shared';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import * as authController from '../controllers/auth.controller.js';
import {
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  setPasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  setupAdminSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/setup-admin', validate(setupAdminSchema), asyncHandler(authController.setupAdmin));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.post('/refresh-token', validate(refreshTokenSchema), asyncHandler(authController.refreshToken));
router.post('/verify-otp', validate(verifyOtpSchema), asyncHandler(authController.verifyOtp));
router.post('/resend-otp', validate(resendOtpSchema), asyncHandler(authController.resendOtp));
router.post('/set-password', validate(setPasswordSchema), asyncHandler(authController.setPassword));
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(authController.resetPassword));

export default router;
