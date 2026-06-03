import { pgSchema, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const authSchema = pgSchema('auth');

export const users = authSchema.table('users', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by'),
});
