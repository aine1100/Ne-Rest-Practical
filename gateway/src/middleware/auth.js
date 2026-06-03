import { verifyAccessToken, AppError } from '@fems/shared';
import { publicRoutes } from '../config/routes.js';

function isPublicRoute(path) {
  return publicRoutes.some((route) => path === route || path.startsWith('/api-docs'));
}

export async function authMiddleware(req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }

  if (isPublicRoute(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    req.headers['x-user-id'] = String(decoded.id);
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-user-email'] = decoded.email;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}
