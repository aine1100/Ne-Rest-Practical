import { pgSchema, serial, varchar, text, date, timestamp, integer } from 'drizzle-orm/pg-core';

export const inspectionSchema = pgSchema('inspection');

export const inspections = inspectionSchema.table('inspections', {
  id: serial('id').primaryKey(),
  extinguisherId: integer('extinguisher_id').notNull(),
  inspectorId: integer('inspector_id'),
  inspectionDate: date('inspection_date'),
  inspectionTime: varchar('inspection_time', { length: 10 }),
  status: varchar('status', { length: 20 }).notNull().default('Requested'),
  remarks: text('remarks'),
  findings: text('findings'),
  statusBefore: varchar('status_before', { length: 20 }),
  statusAfter: varchar('status_after', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: integer('created_by'),
});

export const maintenances = inspectionSchema.table('maintenances', {
  id: serial('id').primaryKey(),
  extinguisherId: integer('extinguisher_id').notNull(),
  inspectorId: integer('inspector_id').notNull(),
  maintenanceDate: date('maintenance_date').notNull(),
  actionTaken: text('action_taken').notNull(),
  issuesFound: text('issues_found'),
  recommendations: text('recommendations'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: integer('created_by'),
});
