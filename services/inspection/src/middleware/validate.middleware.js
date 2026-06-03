import { AppError } from '@fems/shared';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Validation failed', 400, errors));
    }
    req[source === 'body' ? 'validated' : 'query'] = result.data;
    next();
  };
}

export function authenticate(req, _res, next) {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  if (!userId || !userRole) {
    return next(new AppError('Authentication required', 401));
  }

  req.user = {
    id: parseInt(userId, 10),
    role: userRole,
    email: req.headers['x-user-email'],
  };
  next();
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
}

export function requireInspector(req, _res, next) {
  if (req.user?.role !== 'inspector') {
    return next(new AppError('Inspector access required', 403));
  }
  next();
}

export function requireInspectorOrAdmin(req, _res, next) {
  if (!['admin', 'inspector'].includes(req.user?.role)) {
    return next(new AppError('Inspector or admin access required', 403));
  }
  next();
}
