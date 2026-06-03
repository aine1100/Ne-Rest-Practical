import * as userService from '../services/user.service.js';
import { successResponse, paginatedResponse } from '@fems/shared';

export async function getProfile(req, res) {
  const user = await userService.getProfile(req.user.id);
  return successResponse(res, user);
}

export async function updateProfile(req, res) {
  const user = await userService.updateProfile(req.user.id, req.validated);
  return successResponse(res, user, 'Profile updated successfully');
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.validated;
  const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
  return successResponse(res, result, result.message);
}

export async function listUsers(req, res) {
  const result = await userService.listUsers(req.query);
  return paginatedResponse(res, result.users, result.page, result.limit, result.total);
}

export async function getUserById(req, res) {
  const user = await userService.getUserById(parseInt(req.params.id, 10));
  return successResponse(res, user);
}

export async function createUser(req, res) {
  const user = await userService.createUser(req.validated, req.user.id);
  return successResponse(res, user, 'User invited successfully. OTP sent to email.', 201);
}

export async function updateUser(req, res) {
  const user = await userService.updateUser(
    parseInt(req.params.id, 10),
    req.validated,
    req.user.id
  );
  return successResponse(res, user, 'User updated successfully');
}

export async function deleteUser(req, res) {
  const user = await userService.deleteUser(parseInt(req.params.id, 10), req.user.id);
  return successResponse(res, user, 'User deleted successfully');
}
