import { eq, and, count, desc } from 'drizzle-orm';
import { AppError } from '@fems/shared';
import { db, maintenances } from '@fems/db';
import { updateExtinguisherStatus } from '../utils/helpers.js';

export async function createMaintenance(data, userId) {
  const [created] = await db
    .insert(maintenances)
    .values({ ...data, createdBy: userId })
    .returning();

  await updateExtinguisherStatus(data.extinguisherId, 'Under Maintenance', userId);
  return created;
}

export async function listMaintenances({ page, limit, extinguisherId, inspectorId }, user) {
  const conditions = [];
  if (extinguisherId) conditions.push(eq(maintenances.extinguisherId, extinguisherId));
  if (inspectorId) conditions.push(eq(maintenances.inspectorId, inspectorId));
  if (user?.role === 'inspector') conditions.push(eq(maintenances.inspectorId, user.id));

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const [totalResult] = await db.select({ total: count() }).from(maintenances).where(where);

  const rows = await db
    .select()
    .from(maintenances)
    .where(where)
    .orderBy(desc(maintenances.createdAt))
    .limit(limit)
    .offset(offset);

  return { maintenances: rows, page, limit, total: totalResult.total };
}

export async function getMaintenanceById(id) {
  const [item] = await db.select().from(maintenances).where(eq(maintenances.id, id)).limit(1);
  if (!item) throw new AppError('Maintenance record not found', 404);
  return item;
}

export async function completeMaintenance(id, userId) {
  const maintenance = await getMaintenanceById(id);
  await updateExtinguisherStatus(maintenance.extinguisherId, 'Active', userId);
  return maintenance;
}
