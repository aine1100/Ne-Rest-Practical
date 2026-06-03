import { Router } from 'express';
import { asyncHandler } from '@fems/shared';
import {
  validate,
  authenticate,
  requireAdmin,
  requireInspector,
  requireInspectorOrAdmin,
} from '../middleware/validate.middleware.js';
import * as controller from '../controllers/inspection.controller.js';
import {
  requestInspectionSchema,
  createInspectionSchema,
  acceptInspectionSchema,
  completeInspectionSchema,
  updateInspectionSchema,
  listInspectionQuerySchema,
} from '../validators/inspection.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listInspectionQuerySchema, 'query'), asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));

router.post('/request', validate(requestInspectionSchema), asyncHandler(controller.request));
router.post('/', requireAdmin, validate(createInspectionSchema), asyncHandler(controller.create));

router.patch('/:id/accept', requireInspector, validate(acceptInspectionSchema), asyncHandler(controller.accept));
router.patch('/:id/complete', requireInspector, validate(completeInspectionSchema), asyncHandler(controller.complete));

router.put('/:id', requireInspectorOrAdmin, validate(updateInspectionSchema), asyncHandler(controller.update));
router.delete('/:id', requireAdmin, asyncHandler(controller.remove));

export default router;
