import { Router } from 'express';
import { asyncHandler } from '@fems/shared';
import { validate, authenticate, requireInspectorOrAdmin } from '../middleware/validate.middleware.js';
import * as controller from '../controllers/maintenance.controller.js';
import {
  createMaintenanceSchema,
  listMaintenanceQuerySchema,
} from '../validators/inspection.validator.js';

const router = Router();

router.use(authenticate);
router.use(requireInspectorOrAdmin);

router.get('/', validate(listMaintenanceQuerySchema, 'query'), asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', validate(createMaintenanceSchema), asyncHandler(controller.create));
router.patch('/:id/complete', asyncHandler(controller.complete));

export default router;
