import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    const userRole = (req.user.role || '').toUpperCase();
    
    // SuperAdmin always has access to all routes
    if (userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN') {
      return next();
    }

    const normalizedAllowedRoles = roles.flatMap((r) => {
      const up = r.toUpperCase();
      if (up === 'ADMIN') return ['ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'];
      if (up === 'EMPLOYEE' || up === 'MEMBER') return ['EMPLOYEE', 'MEMBER', 'ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'];
      return [up];
    });

    if (!normalizedAllowedRoles.includes(userRole)) {
      return next(new AppError(`Access denied. Required role: ${roles.join(' or ')}.`, 403));
    }

    next();
  };
};

export const authorize = requireRole;

