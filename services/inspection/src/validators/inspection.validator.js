import { z } from 'zod';
import { INSPECTION_STATUS } from '@fems/shared';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeString = z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM');

function isTodayOrFuture(value) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(`${value}T00:00:00`);
  return selected >= today;
}

const futureOrTodayOptional = dateString
  .optional()
  .refine((value) => !value || isTodayOrFuture(value), {
    message: 'Inspection date must be today or a future date',
  });

const futureOrTodayRequired = dateString.refine(isTodayOrFuture, {
  message: 'Inspection date must be today or a future date',
});

export const requestInspectionSchema = z.object({
  extinguisherId: z.number().int().positive(),
  inspectionDate: futureOrTodayOptional,
  inspectionTime: timeString.optional(),
  remarks: z.string().optional(),
});

export const createInspectionSchema = z.object({
  extinguisherId: z.number().int().positive(),
  inspectorId: z.number().int().positive(),
  inspectionDate: futureOrTodayRequired,
  inspectionTime: timeString,
  remarks: z.string().optional(),
});

export const acceptInspectionSchema = z.object({
  inspectionDate: futureOrTodayRequired,
  inspectionTime: timeString,
});

export const completeInspectionSchema = z.object({
  findings: z.string().min(1, 'Findings are required'),
  status: z.enum(['Completed', 'Failed']).default('Completed'),
});

export const updateInspectionSchema = z.object({
  inspectionDate: dateString.optional(),
  inspectionTime: timeString.optional(),
  status: z.enum(INSPECTION_STATUS).optional(),
  remarks: z.string().optional(),
  findings: z.string().optional(),
});

export const listInspectionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.string().optional(),
  statuses: z.string().optional(),
  inspectorId: z.coerce.number().int().optional(),
  extinguisherId: z.coerce.number().int().optional(),
  search: z.string().optional(),
  dateFrom: dateString.optional(),
  dateTo: dateString.optional(),
});

export const createMaintenanceSchema = z.object({
  extinguisherId: z.number().int().positive(),
  inspectorId: z.number().int().positive(),
  maintenanceDate: dateString,
  actionTaken: z.string().min(1),
  issuesFound: z.string().optional(),
  recommendations: z.string().optional(),
});

export const listMaintenanceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  extinguisherId: z.coerce.number().int().optional(),
  inspectorId: z.coerce.number().int().optional(),
});
