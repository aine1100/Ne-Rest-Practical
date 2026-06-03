import { sql } from '@fems/db';

export async function getAdminUserIds() {
  const rows = await sql`
    SELECT id, email FROM auth.users WHERE role = 'admin' AND status = 'active'
  `;
  return rows;
}

export async function getUserEmail(userId) {
  const [user] = await sql`
    SELECT email FROM auth.users WHERE id = ${userId} LIMIT 1
  `;
  return user?.email;
}

export function todayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

export function addDaysIsoDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function daysUntilDate(isoDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${isoDate}T00:00:00`);
  return Math.ceil((target - today) / 86400000);
}

/** All non-expired extinguishers expiring within the next 30 days (inclusive). */
export async function getExtinguishersApproachingExpiry() {
  const today = todayIsoDate();
  const within30Days = addDaysIsoDate(30);

  return sql`
    SELECT * FROM extinguisher.fire_extinguishers
    WHERE status != 'Expired'
      AND expiry_date > ${today}
      AND expiry_date <= ${within30Days}
    ORDER BY expiry_date ASC
  `;
}

export async function getExpiredExtinguishers() {
  const today = todayIsoDate();
  return sql`
    SELECT * FROM extinguisher.fire_extinguishers
    WHERE expiry_date <= ${today} AND status != 'Expired'
  `;
}

export async function markExtinguisherExpired(id) {
  await sql`
    UPDATE extinguisher.fire_extinguishers
    SET status = 'Expired', updated_at = NOW()
    WHERE id = ${id}
  `;
}

/** Inspections due today or tomorrow that still need a scheduled visit. */
export async function getUpcomingInspections() {
  const today = todayIsoDate();
  const tomorrow = addDaysIsoDate(1);

  return sql`
    SELECT
      i.*,
      e.assigned_user_id
    FROM inspection.inspections i
    LEFT JOIN extinguisher.fire_extinguishers e ON e.id = i.extinguisher_id
    WHERE (i.inspection_date = ${today} OR i.inspection_date = ${tomorrow})
      AND i.status IN ('Scheduled', 'Accepted')
    ORDER BY i.inspection_date ASC, i.id ASC
  `;
}
