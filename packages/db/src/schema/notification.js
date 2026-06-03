import { pgSchema, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const notificationSchema = pgSchema('notification');

export const notifications = notificationSchema.table('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('unread'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notificationLog = notificationSchema.table('notification_log', {
  id: serial('id').primaryKey(),
  extinguisherId: integer('extinguisher_id'),
  notificationType: varchar('notification_type', { length: 50 }).notNull(),
  sentDate: varchar('sent_date', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
