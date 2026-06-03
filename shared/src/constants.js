export const ROLES = {
  ADMIN: 'admin',
  INSPECTOR: 'inspector',
  USER: 'user',
};

export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

export const EXTINGUISHER_TYPES = ['Water', 'CO2', 'Foam', 'Dry Chemical'];

export const EXTINGUISHER_STATUS = [
  'Active',
  'Inspection Due',
  'Under Maintenance',
  'Expired',
  'Damaged',
  'Retired',
];

export const INSPECTION_STATUS = [
  'Requested',
  'Accepted',
  'Scheduled',
  'Completed',
  'Failed',
  'Cancelled',
  'Overdue',
];

export const NOTIFICATION_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
};

export const NOTIFICATION_TYPES = {
  ASSIGNMENT: 'assignment',
  INSPECTION_DUE: 'inspection_due',
  INSPECTION_OVERDUE: 'inspection_overdue',
  EXPIRY_WARNING_30D: 'expiry_warning_30d',
  EXPIRY_WARNING_7D: 'expiry_warning_7d',
  EXPIRY_WARNING_1D: 'expiry_warning_1d',
  EXPIRED: 'expired',
  MAINTENANCE_REMINDER: 'maintenance_reminder',
};
