import { Parser } from 'json2csv';

export function generateCsvReport(data) {
  const rows = [
    { category: 'Inventory', metric: 'Total', value: data.inventory.total },
    { category: 'Inventory', metric: 'Active', value: data.inventory.active },
    { category: 'Inventory', metric: 'Expired', value: data.inventory.expired },
    { category: 'Inventory', metric: 'Under Maintenance', value: data.inventory.underMaintenance },
    { category: 'Inspections', metric: 'Total', value: data.inspections.total },
    { category: 'Inspections', metric: 'Scheduled', value: data.inspections.scheduled },
    { category: 'Inspections', metric: 'Completed', value: data.inspections.completed },
    { category: 'Inspections', metric: 'Overdue', value: data.inspections.overdue },
    { category: 'Compliance', metric: 'Compliance %', value: data.compliance.compliancePercent },
    { category: 'Compliance', metric: 'Expired Extinguishers', value: data.compliance.expiredExtinguishers },
    { category: 'Maintenance', metric: 'Total Records', value: data.maintenance.totalMaintenanceRecords },
  ];

  const parser = new Parser({ fields: ['category', 'metric', 'value'] });
  return parser.parse(rows);
}
