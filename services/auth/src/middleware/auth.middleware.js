import { AppError } from '@fems/shared';

export function authenticate(req, _res, next) {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  if (!userId || !userRole) {
    return next(new AppError('Authentication required', 401));
  }

  req.user = {
    id: parseInt(userId, 10),
    role: userRole,
    email: userEmail,
  };

  next();
}

export function optionalAuth(req, _res, next) {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  if (userId && userRole) {
    req.user = {
      id: parseInt(userId, 10),
      role: userRole,
      email: userEmail,
    };
  }

  next();
}
