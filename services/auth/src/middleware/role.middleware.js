import { AppError, ROLES } from '@fems/shared';

export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
}

export const requireAdmin = requireRole(ROLES.ADMIN);
