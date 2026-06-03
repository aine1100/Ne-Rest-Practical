import { sql } from '@fems/db';

export async function getInventoryReport() {
  const rows = await sql`
    SELECT status, COUNT(*)::int as count
    FROM extinguisher.fire_extinguishers
    GROUP BY status
  `;

  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const byStatus = Object.fromEntries(rows.map((r) => [r.status, r.count]));

  return {
    total,
    active: byStatus['Active'] || 0,
    expired: byStatus['Expired'] || 0,
    underMaintenance: byStatus['Under Maintenance'] || 0,
    inspectionDue: byStatus['Inspection Due'] || 0,
    damaged: byStatus['Damaged'] || 0,
    retired: byStatus['Retired'] || 0,
    byStatus,
  };
}

export async function getInspectionReport() {
  const rows = await sql`
    SELECT status, COUNT(*)::int as count
    FROM inspection.inspections
    GROUP BY status
  `;

  const byStatus = Object.fromEntries(rows.map((r) => [r.status, r.count]));
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return {
    total,
    requested: byStatus['Requested'] || 0,
    accepted: byStatus['Accepted'] || 0,
    scheduled: byStatus['Scheduled'] || 0,
    completed: byStatus['Completed'] || 0,
    overdue: byStatus['Overdue'] || 0,
    failed: byStatus['Failed'] || 0,
    cancelled: byStatus['Cancelled'] || 0,
    byStatus,
  };
}

export async function getComplianceReport() {
  const inventory = await getInventoryReport();
  const inspection = await getInspectionReport();

  const totalExtinguishers = inventory.total || 1;
  const compliant = inventory.active + inventory.inspectionDue;
  const compliancePercent = Math.round((compliant / totalExtinguishers) * 100);

  return {
    totalExtinguishers: inventory.total,
    expiredExtinguishers: inventory.expired,
    dueInspections: inspection.scheduled + inspection.overdue,
    overdueInspections: inspection.overdue,
    compliancePercent,
  };
}

export async function getMaintenanceReport() {
  const [countResult] = await sql`
    SELECT COUNT(*)::int as total FROM inspection.maintenances
  `;

  const recent = await sql`
    SELECT * FROM inspection.maintenances
    ORDER BY created_at DESC
    LIMIT 10
  `;

  const monthly = await sql`
    SELECT TO_CHAR(maintenance_date, 'YYYY-MM') as month, COUNT(*)::int as count
    FROM inspection.maintenances
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `;

  return {
    totalMaintenanceRecords: countResult.total,
    recentActivities: recent,
    monthlyTrend: monthly,
  };
}

export async function getFullReportData() {
  const [inventory, inspections, compliance, maintenance] = await Promise.all([
    getInventoryReport(),
    getInspectionReport(),
    getComplianceReport(),
    getMaintenanceReport(),
  ]);

  return { inventory, inspections, compliance, maintenance, generatedAt: new Date().toISOString() };
}
