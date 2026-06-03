import { Router } from 'express';
import { asyncHandler, AppError } from '@fems/shared';
import * as controller from '../controllers/report.controller.js';

const router = Router();

function authenticate(req, _res, next) {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  if (!userId || !userRole) {
    return next(new AppError('Authentication required', 401));
  }

  req.user = { id: parseInt(userId, 10), role: userRole };
  next();
}

function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
}

router.use(authenticate);

router.get('/inventory', requireAdmin, asyncHandler(controller.inventory));
router.get('/inspections', requireAdmin, asyncHandler(controller.inspections));
router.get('/compliance', requireAdmin, asyncHandler(controller.compliance));
router.get('/maintenance', requireAdmin, asyncHandler(controller.maintenance));
router.get('/export/pdf', requireAdmin, asyncHandler(controller.exportPdf));
router.get('/export/csv', requireAdmin, asyncHandler(controller.exportCsv));
router.get('/export/users/csv', requireAdmin, asyncHandler(controller.exportUsersCsv));
router.get('/export/extinguishers/csv', asyncHandler(controller.exportExtinguishersCsv));
router.get('/export/inspections/csv', asyncHandler(controller.exportInspectionsCsv));

export default router;
