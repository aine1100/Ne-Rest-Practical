import * as authService from '../services/auth.service.js';
import { successResponse } from '@fems/shared';

export async function login(req, res) {
  const { email, password } = req.validated;
  const result = await authService.login(email, password);
  return successResponse(res, result, 'Login successful');
}

export async function logout(req, res) {
  await authService.logout(req.user.id);
  return successResponse(res, null, 'Logged out successfully');
}

export async function refreshToken(req, res) {
  const { refreshToken } = req.validated;
  const result = await authService.refreshAccessToken(refreshToken);
  return successResponse(res, result, 'Token refreshed');
}

export async function verifyOtp(req, res) {
  const { email, otp } = req.validated;
  const result = await authService.verifyOtpAndGetTempToken(email, otp);
  return successResponse(res, result, 'OTP verified successfully');
}

export async function resendOtp(req, res) {
  const { email } = req.validated;
  const result = await authService.resendOtp(email);
  return successResponse(res, result, 'OTP resent successfully');
}

export async function setPassword(req, res) {
  const { tempToken, password } = req.validated;
  const user = await authService.setPassword(tempToken, password);
  return successResponse(res, user, 'Password set successfully');
}

export async function forgotPassword(req, res) {
  const { email } = req.validated;
  const result = await authService.forgotPassword(email);
  return successResponse(res, result, result.message);
}

export async function resetPassword(req, res) {
  const { email, otp, password } = req.validated;
  const user = await authService.resetPassword(email, otp, password);
  return successResponse(res, user, 'Password reset successfully');
}

export async function setupAdmin(req, res) {
  const result = await authService.setupAdmin(req.validated);
  return successResponse(res, result, 'Admin account created successfully', 201);
}
