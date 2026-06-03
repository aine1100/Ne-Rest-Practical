import { eq, and, or, count, desc, lte, gte, inArray, ilike } from 'drizzle-orm';
import { AppError } from '@fems/shared';
import { db, inspections, fireExtinguishers } from '@fems/db';
import { updateExtinguisherStatus, notifyService } from '../utils/helpers.js';

const OPEN_STATUSES = ['Requested', 'Accepted', 'Scheduled', 'Overdue'];

async function getExtinguisher(extinguisherId) {
  const [ext] = await db
    .select()
    .from(fireExtinguishers)
    .where(eq(fireExtinguishers.id, extinguisherId))
    .limit(1);

  if (!ext) throw new AppError('Extinguisher not found', 404);
  return ext;
}

async function ensureExtinguisherAccess(extinguisherId, userId, userRole) {
  const ext = await getExtinguisher(extinguisherId);

  if (userRole === 'user' && ext.assignedUserId !== userId) {
    throw new AppError('You can only request inspections for extinguishers assigned to you', 403);
  }

  return ext;
}

async function ensureNoOpenInspection(extinguisherId) {
  const [open] = await db
    .select()
    .from(inspections)
    .where(
      and(
        eq(inspections.extinguisherId, extinguisherId),
        inArray(inspections.status, OPEN_STATUSES)
      )
    )
    .limit(1);

  if (open) {
    throw new AppError('An open inspection already exists for this extinguisher', 409);
  }
}

export async function requestInspection(data, userId, userRole) {
  await ensureExtinguisherAccess(data.extinguisherId, userId, userRole);
  await ensureNoOpenInspection(data.extinguisherId);

  const [created] = await db
    .insert(inspections)
    .values({
      extinguisherId: data.extinguisherId,
      inspectionDate: data.inspectionDate || null,
      inspectionTime: data.inspectionTime || null,
      remarks: data.remarks || null,
      status: 'Requested',
      createdBy: userId,
    })
    .returning();

  await updateExtinguisherStatus(data.extinguisherId, 'Inspection Due', userId);

  const ext = await getExtinguisher(data.extinguisherId);
  await notifyService({
    userId,
    title: 'Inspection Request Submitted',
    message: `Your inspection request for extinguisher ${ext.serialNumber} (#${data.extinguisherId}) was submitted successfully.`,
    type: 'inspection_due',
  });

  return created;
}

export async function scheduleInspection(data, userId) {
  const ext = await getExtinguisher(data.extinguisherId);
  await ensureNoOpenInspection(data.extinguisherId);

  const [created] = await db
    .insert(inspections)
    .values({
      ...data,
      status: 'Scheduled',
      createdBy: userId,
    })
    .returning();

  await updateExtinguisherStatus(data.extinguisherId, 'Inspection Due', userId);

  await notifyService({
    userId: data.inspectorId,
    title: 'Inspection Assigned',
    message: `Inspection #${created.id} was assigned to you for extinguisher #${data.extinguisherId} on ${data.inspectionDate} at ${data.inspectionTime}.`,
    type: 'inspection_due',
  });

  if (ext.assignedUserId) {
    await notifyService({
      userId: ext.assignedUserId,
      title: 'Inspection Scheduled',
      message: `An inspection for your extinguisher ${ext.serialNumber} is scheduled on ${data.inspectionDate} at ${data.inspectionTime}.`,
      type: 'inspection_due',
    });
  }

  return created;
}

export async function acceptInspection(id, inspectorId, data) {
  const existing = await getInspectionById(id);

  if (existing.status !== 'Requested') {
    throw new AppError('Only requested inspections can be accepted', 400);
  }

  const [updated] = await db
    .update(inspections)
    .set({
      inspectorId,
      status: 'Accepted',
      inspectionDate: data.inspectionDate,
      inspectionTime: data.inspectionTime,
    })
    .where(eq(inspections.id, id))
    .returning();

  if (existing.createdBy) {
    await notifyService({
      userId: existing.createdBy,
      title: 'Inspection Accepted',
      message: `Your inspection request #${id} for extinguisher #${existing.extinguisherId} was accepted for ${data.inspectionDate} at ${data.inspectionTime}.`,
      type: 'inspection_due',
    });
  }

  const ext = await getExtinguisher(existing.extinguisherId);
  if (ext.assignedUserId && ext.assignedUserId !== existing.createdBy) {
    await notifyService({
      userId: ext.assignedUserId,
      title: 'Inspection Accepted',
      message: `An inspection for your extinguisher ${ext.serialNumber} was accepted for ${data.inspectionDate} at ${data.inspectionTime}.`,
      type: 'inspection_due',
    });
  }

  return updated;
}

export async function completeInspection(id, inspectorId, data) {
  const existing = await getInspectionById(id);

  if (existing.inspectorId !== inspectorId) {
    throw new AppError('This inspection is not assigned to you', 403);
  }

  if (!['Accepted', 'Scheduled'].includes(existing.status)) {
    throw new AppError('This inspection cannot be completed yet', 400);
  }

  const finalStatus = data.status === 'Failed' ? 'Failed' : 'Completed';
  const extBefore = await getExtinguisher(existing.extinguisherId);
  const statusBefore = extBefore.status;
  const statusAfter = finalStatus === 'Completed' ? 'Active' : 'Damaged';

  const [updated] = await db
    .update(inspections)
    .set({
      status: finalStatus,
      findings: data.findings,
      statusBefore,
      statusAfter,
    })
    .where(eq(inspections.id, id))
    .returning();

  if (finalStatus === 'Completed') {
    await updateExtinguisherStatus(existing.extinguisherId, 'Active', inspectorId);
  } else {
    await updateExtinguisherStatus(existing.extinguisherId, 'Damaged', inspectorId);
  }

  if (existing.createdBy) {
    await notifyService({
      userId: existing.createdBy,
      title: `Inspection ${finalStatus}`,
      message: `Inspection #${id} for extinguisher #${existing.extinguisherId} was marked ${finalStatus}. Findings: ${data.findings}`,
      type: finalStatus === 'Completed' ? 'inspection_due' : 'inspection_overdue',
    });
  }

  const ext = await getExtinguisher(existing.extinguisherId);
  if (ext.assignedUserId && ext.assignedUserId !== existing.createdBy) {
    await notifyService({
      userId: ext.assignedUserId,
      title: `Inspection ${finalStatus}`,
      message: `Inspection for your extinguisher ${ext.serialNumber} was marked ${finalStatus}.`,
      type: finalStatus === 'Completed' ? 'inspection_due' : 'inspection_overdue',
    });
  }

  return updated;
}

export async function listInspections({ page, limit, status, statuses, inspectorId, extinguisherId, search, dateFrom, dateTo }, user) {
  const conditions = [];

  if (user.role === 'user') {
    conditions.push(eq(inspections.createdBy, user.id));
  } else if (user.role === 'inspector') {
    conditions.push(
      or(eq(inspections.status, 'Requested'), eq(inspections.inspectorId, user.id))
    );
  }

  if (statuses) {
    const list = statuses.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length) conditions.push(inArray(inspections.status, list));
  } else if (status) {
    conditions.push(eq(inspections.status, status));
  }
  if (inspectorId) conditions.push(eq(inspections.inspectorId, inspectorId));
  if (extinguisherId) conditions.push(eq(inspections.extinguisherId, extinguisherId));
  if (search) {
    const term = `%${search.trim()}%`;
    const searchParts = [
      ilike(inspections.remarks, term),
      ilike(inspections.findings, term),
    ];
    if (/^\d+$/.test(search.trim())) {
      searchParts.push(eq(inspections.extinguisherId, parseInt(search.trim(), 10)));
    }
    conditions.push(or(...searchParts));
  }
  if (dateFrom) conditions.push(gte(inspections.inspectionDate, dateFrom));
  if (dateTo) conditions.push(lte(inspections.inspectionDate, dateTo));

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const [totalResult] = await db.select({ total: count() }).from(inspections).where(where);

  const rows = await db
    .select()
    .from(inspections)
    .where(where)
    .orderBy(desc(inspections.createdAt))
    .limit(limit)
    .offset(offset);

  return { inspections: rows, page, limit, total: totalResult.total };
}

export async function getInspectionById(id) {
  const [item] = await db.select().from(inspections).where(eq(inspections.id, id)).limit(1);
  if (!item) throw new AppError('Inspection not found', 404);
  return item;
}

export async function getInspectionForUser(id, user) {
  const item = await getInspectionById(id);

  if (user.role === 'admin') return item;

  if (user.role === 'user' && item.createdBy !== user.id) {
    throw new AppError('Access denied', 403);
  }

  if (user.role === 'inspector') {
    const allowed =
      item.status === 'Requested' || item.inspectorId === user.id;
    if (!allowed) throw new AppError('Access denied', 403);
  }

  return item;
}

export async function updateInspection(id, data, userId) {
  const existing = await getInspectionById(id);

  const [updated] = await db
    .update(inspections)
    .set(data)
    .where(eq(inspections.id, id))
    .returning();

  if (data.status === 'Completed') {
    await updateExtinguisherStatus(existing.extinguisherId, 'Active', userId);
  } else if (data.status === 'Failed') {
    await updateExtinguisherStatus(existing.extinguisherId, 'Damaged', userId);
  }

  return updated;
}

export async function deleteInspection(id) {
  const [deleted] = await db.delete(inspections).where(eq(inspections.id, id)).returning();
  if (!deleted) throw new AppError('Inspection not found', 404);
  return deleted;
}

export async function markOverdueInspections() {
  const today = new Date().toISOString().split('T')[0];

  const overdue = await db
    .select()
    .from(inspections)
    .where(
      and(
        eq(inspections.status, 'Scheduled'),
        lte(inspections.inspectionDate, today)
      )
    );

  for (const inspection of overdue) {
    if (!inspection.inspectorId) continue;

    await db.update(inspections).set({ status: 'Overdue' }).where(eq(inspections.id, inspection.id));

    await notifyService({
      userId: inspection.inspectorId,
      title: 'Inspection Overdue',
      message: `Inspection #${inspection.id} for extinguisher #${inspection.extinguisherId} is overdue.`,
      type: 'inspection_overdue',
    });
  }

  return overdue.length;
}
