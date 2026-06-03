import * as inspectionService from '../services/inspection.service.js';
import { successResponse, paginatedResponse } from '@fems/shared';

export async function request(req, res) {
  const item = await inspectionService.requestInspection(
    req.validated,
    req.user.id,
    req.user.role
  );
  return successResponse(res, item, 'Inspection request submitted', 201);
}

export async function create(req, res) {
  const item = await inspectionService.scheduleInspection(req.validated, req.user.id);
  return successResponse(res, item, 'Inspection scheduled', 201);
}

export async function list(req, res) {
  const result = await inspectionService.listInspections(req.query, req.user);
  return paginatedResponse(res, result.inspections, result.page, result.limit, result.total);
}

export async function getById(req, res) {
  const item = await inspectionService.getInspectionForUser(parseInt(req.params.id, 10), req.user);
  return successResponse(res, item);
}

export async function accept(req, res) {
  const item = await inspectionService.acceptInspection(
    parseInt(req.params.id, 10),
    req.user.id,
    req.validated
  );
  return successResponse(res, item, 'Inspection accepted');
}

export async function complete(req, res) {
  const item = await inspectionService.completeInspection(
    parseInt(req.params.id, 10),
    req.user.id,
    req.validated
  );
  return successResponse(res, item, 'Inspection completed');
}

export async function update(req, res) {
  const item = await inspectionService.updateInspection(
    parseInt(req.params.id, 10),
    req.validated,
    req.user.id
  );
  return successResponse(res, item, 'Inspection updated');
}

export async function remove(req, res) {
  await inspectionService.deleteInspection(parseInt(req.params.id, 10));
  return successResponse(res, null, 'Inspection deleted');
}
