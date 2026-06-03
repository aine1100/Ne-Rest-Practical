import { sql } from '@fems/db';
import { Parser } from 'json2csv';

function matchesSearch(value, search) {
  if (!search) return true;
  return String(value || '').toLowerCase().includes(search.trim().toLowerCase());
}

export async function getExtinguishersForExport(filters = {}, user) {
  const scopedFilters = { ...filters };
  if (user?.role === 'user') {
    scopedFilters.assignedUserId = user.id;
  }

  const rows = await sql`
    SELECT
      e.id,
      e.serial_number,
      e.type,
      e.size,
      e.building,
      e.floor,
      e.room,
      e.status,
      e.manufacture_date,
      e.installation_date,
      e.expiry_date,
      e.assigned_user_id,
      COALESCE(CONCAT(u.first_name, ' ', u.last_name), '') AS assigned_to,
      u.email AS assigned_email
    FROM extinguisher.fire_extinguishers e
    LEFT JOIN auth.users u ON u.id = e.assigned_user_id
    ORDER BY e.created_at DESC
  `;

  return rows.filter((row) => {
    if (scopedFilters.status && row.status !== scopedFilters.status) return false;
    if (scopedFilters.type && row.type !== scopedFilters.type) return false;
    if (scopedFilters.building && !matchesSearch(row.building, scopedFilters.building)) return false;
    if (scopedFilters.assignedUserId && row.assigned_user_id !== Number(scopedFilters.assignedUserId)) return false;
    if (scopedFilters.dateFrom && row.expiry_date < scopedFilters.dateFrom) return false;
    if (scopedFilters.dateTo && row.expiry_date > scopedFilters.dateTo) return false;
    if (scopedFilters.search) {
      const term = scopedFilters.search.trim().toLowerCase();
      const haystack = [row.serial_number, row.building, row.room, row.floor]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

function matchesInspectionSearch(row, search) {
  const term = search.trim().toLowerCase();
  const haystack = [row.remarks, row.findings, row.extinguisher_serial, String(row.id)]
    .join(' ')
    .toLowerCase();
  if (haystack.includes(term)) return true;
  if (/^\d+$/.test(search.trim()) && row.extinguisher_id === Number(search.trim())) return true;
  return false;
}

export async function getInspectionsForExport(filters = {}, user) {
  const rows = await sql`
    SELECT
      i.id,
      i.extinguisher_id,
      e.serial_number AS extinguisher_serial,
      i.inspector_id,
      COALESCE(CONCAT(insp.first_name, ' ', insp.last_name), '') AS inspector_name,
      i.inspection_date,
      i.inspection_time,
      i.status,
      i.remarks,
      i.findings,
      i.status_before,
      i.status_after,
      i.created_by,
      i.created_at
    FROM inspection.inspections i
    LEFT JOIN extinguisher.fire_extinguishers e ON e.id = i.extinguisher_id
    LEFT JOIN auth.users insp ON insp.id = i.inspector_id
    ORDER BY i.created_at DESC
  `;

  const statusList = filters.statuses
    ? filters.statuses.split(',').map((s) => s.trim()).filter(Boolean)
    : null;

  return rows.filter((row) => {
    if (user?.role === 'user' && row.created_by !== user.id) return false;
    if (user?.role === 'inspector') {
      const allowed = row.status === 'Requested' || row.inspector_id === user.id;
      if (!allowed) return false;
    }

    if (statusList?.length) {
      if (!statusList.includes(row.status)) return false;
    } else if (filters.status && row.status !== filters.status) {
      return false;
    }

    if (filters.inspectorId && row.inspector_id !== Number(filters.inspectorId)) return false;
    if (filters.extinguisherId && row.extinguisher_id !== Number(filters.extinguisherId)) return false;
    if (filters.dateFrom && row.inspection_date && row.inspection_date < filters.dateFrom) return false;
    if (filters.dateTo && row.inspection_date && row.inspection_date > filters.dateTo) return false;
    if (filters.search && !matchesInspectionSearch(row, filters.search)) return false;

    return true;
  });
}

export async function getUsersForExport(filters = {}) {
  const rows = await sql`
    SELECT
      id,
      first_name,
      last_name,
      email,
      role,
      status,
      created_at
    FROM auth.users
    ORDER BY created_at DESC
  `;

  return rows.filter((row) => {
    if (filters.role && row.role !== filters.role) return false;
    if (filters.status && row.status !== filters.status) return false;
    if (filters.dateFrom) {
      const created = new Date(row.created_at).toISOString().slice(0, 10);
      if (created < filters.dateFrom) return false;
    }
    if (filters.dateTo) {
      const created = new Date(row.created_at).toISOString().slice(0, 10);
      if (created > filters.dateTo) return false;
    }
    if (filters.search) {
      const term = filters.search.trim().toLowerCase();
      const haystack = [row.first_name, row.last_name, row.email].join(' ').toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

export function generateExtinguishersCsv(rows) {
  const data = rows.map((row) => ({
    ID: row.id,
    SerialNumber: row.serial_number,
    Type: row.type,
    Size: row.size,
    Building: row.building,
    Floor: row.floor,
    Room: row.room,
    Status: row.status,
    ManufactureDate: row.manufacture_date,
    InstallationDate: row.installation_date,
    ExpiryDate: row.expiry_date,
    AssignedTo: row.assigned_to || 'Unassigned',
    AssignedEmail: row.assigned_email || '',
  }));

  const parser = new Parser({
    fields: [
      'ID',
      'SerialNumber',
      'Type',
      'Size',
      'Building',
      'Floor',
      'Room',
      'Status',
      'ManufactureDate',
      'InstallationDate',
      'ExpiryDate',
      'AssignedTo',
      'AssignedEmail',
    ],
  });

  return parser.parse(data);
}

export function generateUsersCsv(rows) {
  const data = rows.map((row) => ({
    ID: row.id,
    FirstName: row.first_name,
    LastName: row.last_name,
    Email: row.email,
    Role: row.role,
    Status: row.status,
    JoinedAt: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : '',
  }));

  const parser = new Parser({
    fields: ['ID', 'FirstName', 'LastName', 'Email', 'Role', 'Status', 'JoinedAt'],
  });

  return parser.parse(data);
}

export function generateInspectionsCsv(rows) {
  const data = rows.map((row) => ({
    ID: row.id,
    ExtinguisherId: row.extinguisher_id,
    ExtinguisherSerial: row.extinguisher_serial || '',
    InspectorId: row.inspector_id || '',
    InspectorName: row.inspector_name || '',
    InspectionDate: row.inspection_date || '',
    InspectionTime: row.inspection_time || '',
    Status: row.status,
    Remarks: row.remarks || '',
    Findings: row.findings || '',
    StatusBefore: row.status_before || '',
    StatusAfter: row.status_after || '',
    CreatedAt: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : '',
  }));

  const parser = new Parser({
    fields: [
      'ID',
      'ExtinguisherId',
      'ExtinguisherSerial',
      'InspectorId',
      'InspectorName',
      'InspectionDate',
      'InspectionTime',
      'Status',
      'Remarks',
      'Findings',
      'StatusBefore',
      'StatusAfter',
      'CreatedAt',
    ],
  });

  return parser.parse(data);
}
