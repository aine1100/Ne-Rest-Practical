import { eq, and, or, ilike, count, desc, gte, lte } from 'drizzle-orm';
import { AppError } from '@fems/shared';
import { db, fireExtinguishers } from '@fems/db';
import { validateExtinguisherDates, resolveStatus, notifyService } from '../utils/helpers.js';

export async function createExtinguisher(data, userId) {
  validateExtinguisherDates(data);

  const [existing] = await db
    .select()
    .from(fireExtinguishers)
    .where(eq(fireExtinguishers.serialNumber, data.serialNumber))
    .limit(1);

  if (existing) {
    throw new AppError('Serial number already exists', 409);
  }

  const status = resolveStatus(data.expiryDate, data.status);

  const [created] = await db
    .insert(fireExtinguishers)
    .values({
      ...data,
      status,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  if (created.assignedUserId) {
    await notifyService({
      userId: created.assignedUserId,
      title: 'Extinguisher Assigned',
      message: `Fire extinguisher ${created.serialNumber} (${created.building}, ${created.floor}/${created.room}) has been assigned to you.`,
      type: 'assignment',
    });
  }

  return created;
}

export async function listExtinguishers({ page, limit, status, type, building, search, assignedUserId, dateFrom, dateTo }) {
  const conditions = [];

  if (status) conditions.push(eq(fireExtinguishers.status, status));
  if (type) conditions.push(eq(fireExtinguishers.type, type));
  if (building) conditions.push(ilike(fireExtinguishers.building, `%${building}%`));
  if (assignedUserId) conditions.push(eq(fireExtinguishers.assignedUserId, assignedUserId));
  if (dateFrom) conditions.push(gte(fireExtinguishers.expiryDate, dateFrom));
  if (dateTo) conditions.push(lte(fireExtinguishers.expiryDate, dateTo));
  if (search) {
    conditions.push(
      or(
        ilike(fireExtinguishers.serialNumber, `%${search}%`),
        ilike(fireExtinguishers.building, `%${search}%`),
        ilike(fireExtinguishers.room, `%${search}%`),
        ilike(fireExtinguishers.floor, `%${search}%`)
      )
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const [totalResult] = await db.select({ total: count() }).from(fireExtinguishers).where(where);

  const rows = await db
    .select()
    .from(fireExtinguishers)
    .where(where)
    .orderBy(desc(fireExtinguishers.createdAt))
    .limit(limit)
    .offset(offset);

  return { extinguishers: rows, page, limit, total: totalResult.total };
}

export async function getExtinguisherById(id) {
  const [item] = await db
    .select()
    .from(fireExtinguishers)
    .where(eq(fireExtinguishers.id, id))
    .limit(1);

  if (!item) throw new AppError('Extinguisher not found', 404);
  return item;
}

export async function updateExtinguisher(id, data, userId) {
  const existing = await getExtinguisherById(id);

  const manufactureDate = data.manufactureDate || existing.manufactureDate;
  const installationDate = data.installationDate || existing.installationDate;
  const expiryDate = data.expiryDate || existing.expiryDate;

  if (data.manufactureDate || data.installationDate || data.expiryDate) {
    validateExtinguisherDates({ manufactureDate, installationDate, expiryDate });
  }

  if (data.serialNumber && data.serialNumber !== existing.serialNumber) {
    const [dup] = await db
      .select()
      .from(fireExtinguishers)
      .where(eq(fireExtinguishers.serialNumber, data.serialNumber))
      .limit(1);
    if (dup) throw new AppError('Serial number already exists', 409);
  }

  const status = data.status || resolveStatus(expiryDate, existing.status);

  const [updated] = await db
    .update(fireExtinguishers)
    .set({ ...data, status, updatedAt: new Date(), updatedBy: userId })
    .where(eq(fireExtinguishers.id, id))
    .returning();

  if (
    data.assignedUserId &&
    data.assignedUserId !== existing.assignedUserId
  ) {
    await notifyService({
      userId: data.assignedUserId,
      title: 'Extinguisher Assigned',
      message: `Fire extinguisher ${updated.serialNumber} (${updated.building}, ${updated.floor}/${updated.room}) has been assigned to you.`,
      type: 'assignment',
    });
  }

  return updated;
}

export async function deleteExtinguisher(id) {
  const [deleted] = await db
    .delete(fireExtinguishers)
    .where(eq(fireExtinguishers.id, id))
    .returning();

  if (!deleted) throw new AppError('Extinguisher not found', 404);
  return deleted;
}

export async function updateExtinguisherStatus(id, status, userId) {
  const [updated] = await db
    .update(fireExtinguishers)
    .set({ status, updatedAt: new Date(), updatedBy: userId })
    .where(eq(fireExtinguishers.id, id))
    .returning();

  if (!updated) throw new AppError('Extinguisher not found', 404);
  return updated;
}

export async function searchExtinguishers(query) {
  const conditions = or(
    ilike(fireExtinguishers.serialNumber, `%${query}%`),
    ilike(fireExtinguishers.building, `%${query}%`),
    ilike(fireExtinguishers.room, `%${query}%`),
    ilike(fireExtinguishers.status, `%${query}%`),
    ilike(fireExtinguishers.type, `%${query}%`)
  );

  return db
    .select()
    .from(fireExtinguishers)
    .where(conditions)
    .orderBy(desc(fireExtinguishers.createdAt))
    .limit(50);
}

export async function getExpiringExtinguishers(daysUntilExpiry) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysUntilExpiry);
  const targetStr = targetDate.toISOString().split('T')[0];

  return db
    .select()
    .from(fireExtinguishers)
    .where(eq(fireExtinguishers.expiryDate, targetStr));
}

export async function getExpiredExtinguishers() {
  const today = new Date().toISOString().split('T')[0];
  const rows = await db.select().from(fireExtinguishers);
  return rows.filter((r) => r.expiryDate <= today && r.status !== 'Expired');
}
