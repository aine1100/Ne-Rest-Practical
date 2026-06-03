import { z } from 'zod';
import { EXTINGUISHER_TYPES } from '@fems/shared';
import { validateExtinguisherDates } from '../utils/helpers.js';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

const dateFields = {
  manufactureDate: dateString,
  installationDate: dateString,
  expiryDate: dateString,
};

function addDateValidation(data, ctx) {
  try {
    validateExtinguisherDates(data);
  } catch (err) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: err.message,
      path: ['installationDate'],
    });
  }
}

export const extinguisherSchema = z
  .object({
    serialNumber: z.string().min(1).max(100),
    type: z.enum(EXTINGUISHER_TYPES),
    size: z.string().min(1).max(20),
    building: z.string().min(1).max(100),
    floor: z.string().min(1).max(20),
    room: z.string().min(1).max(50),
    ...dateFields,
    assignedUserId: z.number().int().positive().optional().nullable(),
  })
  .superRefine(addDateValidation);

export const updateExtinguisherSchema = z
  .object({
    serialNumber: z.string().min(1).max(100).optional(),
    type: z.enum(EXTINGUISHER_TYPES).optional(),
    size: z.string().min(1).max(20).optional(),
    building: z.string().min(1).max(100).optional(),
    floor: z.string().min(1).max(20).optional(),
    room: z.string().min(1).max(50).optional(),
    manufactureDate: dateString.optional(),
    installationDate: dateString.optional(),
    expiryDate: dateString.optional(),
    assignedUserId: z.number().int().positive().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.manufactureDate && !data.installationDate && !data.expiryDate) return;

    if (!data.manufactureDate || !data.installationDate || !data.expiryDate) {
      return;
    }

    addDateValidation(
      {
        manufactureDate: data.manufactureDate,
        installationDate: data.installationDate,
        expiryDate: data.expiryDate,
      },
      ctx
    );
  });

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.string().optional(),
  type: z.string().optional(),
  building: z.string().optional(),
  search: z.string().optional(),
  assignedUserId: z.coerce.number().int().positive().optional(),
  dateFrom: dateString.optional(),
  dateTo: dateString.optional(),
});

export const updateStatusSchema = z.object({
  status: z.string().min(1),
});
