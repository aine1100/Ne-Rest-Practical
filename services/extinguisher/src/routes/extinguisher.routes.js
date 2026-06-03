import { Router } from 'express';
import { asyncHandler } from '@fems/shared';
import { validate, authenticate, requireAdmin } from '../middleware/validate.middleware.js';
import * as controller from '../controllers/extinguisher.controller.js';
import {
  extinguisherSchema,
  updateExtinguisherSchema,
  listQuerySchema,
  updateStatusSchema,
} from '../validators/extinguisher.validator.js';

const router = Router();

router.use(authenticate);

router.get('/search', asyncHandler(controller.search));
router.get('/', validate(listQuerySchema, 'query'), asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', requireAdmin, validate(extinguisherSchema), asyncHandler(controller.create));
router.put('/:id', requireAdmin, validate(updateExtinguisherSchema), asyncHandler(controller.update));
router.patch('/:id/status', validate(updateStatusSchema), asyncHandler(controller.updateStatus));
router.delete('/:id', requireAdmin, asyncHandler(controller.remove));

export default router;
