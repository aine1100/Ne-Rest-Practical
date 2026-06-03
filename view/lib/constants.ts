export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const ROLES = {
  ADMIN: 'admin',
  INSPECTOR: 'inspector',
  USER: 'user',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  inspector: '/inspector',
  user: '/user',
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

export const INSPECTION_STATUS = ['Requested', 'Accepted', 'Scheduled', 'Completed', 'Failed', 'Cancelled', 'Overdue'];

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'fems_access_token',
  REFRESH_TOKEN: 'fems_refresh_token',
  USER: 'fems_user',
};
