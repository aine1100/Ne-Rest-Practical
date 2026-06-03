import { pgSchema, serial, varchar, date, timestamp, integer } from 'drizzle-orm/pg-core';

export const extinguisherSchema = pgSchema('extinguisher');

export const fireExtinguishers = extinguisherSchema.table('fire_extinguishers', {
  id: serial('id').primaryKey(),
  serialNumber: varchar('serial_number', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(),
  size: varchar('size', { length: 20 }).notNull(),
  building: varchar('building', { length: 100 }).notNull(),
  floor: varchar('floor', { length: 20 }).notNull(),
  room: varchar('room', { length: 50 }).notNull(),
  manufactureDate: date('manufacture_date').notNull(),
  installationDate: date('installation_date').notNull(),
  expiryDate: date('expiry_date').notNull(),
  status: varchar('status', { length: 30 }).notNull().default('Active'),
  assignedUserId: integer('assigned_user_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by'),
});
