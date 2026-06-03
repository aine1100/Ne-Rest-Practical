import * as maintenanceService from '../services/maintenance.service.js';
import { successResponse, paginatedResponse } from '@fems/shared';

export async function create(req, res) {
  const item = await maintenanceService.createMaintenance(req.validated, req.user.id);
  return successResponse(res, item, 'Maintenance logged', 201);
}

export async function list(req, res) {
  const result = await maintenanceService.listMaintenances(req.query, req.user);
  return paginatedResponse(res, result.maintenances, result.page, result.limit, result.total);
}

export async function getById(req, res) {
  const item = await maintenanceService.getMaintenanceById(parseInt(req.params.id, 10));
  return successResponse(res, item);
}

export async function complete(req, res) {
  const item = await maintenanceService.completeMaintenance(parseInt(req.params.id, 10), req.user.id);
  return successResponse(res, item, 'Maintenance completed');
}
