import * as extinguisherService from '../services/extinguisher.service.js';
import { successResponse, paginatedResponse } from '@fems/shared';

export async function create(req, res) {
  const item = await extinguisherService.createExtinguisher(req.validated, req.user.id);
  return successResponse(res, item, 'Extinguisher created successfully', 201);
}

export async function list(req, res) {
  const result = await extinguisherService.listExtinguishers(req.query);
  return paginatedResponse(res, result.extinguishers, result.page, result.limit, result.total);
}

export async function getById(req, res) {
  const item = await extinguisherService.getExtinguisherById(parseInt(req.params.id, 10));
  return successResponse(res, item);
}

export async function update(req, res) {
  const item = await extinguisherService.updateExtinguisher(
    parseInt(req.params.id, 10),
    req.validated,
    req.user.id
  );
  return successResponse(res, item, 'Extinguisher updated successfully');
}

export async function remove(req, res) {
  await extinguisherService.deleteExtinguisher(parseInt(req.params.id, 10));
  return successResponse(res, null, 'Extinguisher deleted successfully');
}

export async function search(req, res) {
  const q = req.query.q || req.query.search || '';
  const results = await extinguisherService.searchExtinguishers(q);
  return successResponse(res, results);
}

export async function updateStatus(req, res) {
  const item = await extinguisherService.updateExtinguisherStatus(
    parseInt(req.params.id, 10),
    req.validated.status,
    req.user.id
  );
  return successResponse(res, item, 'Status updated successfully');
}
