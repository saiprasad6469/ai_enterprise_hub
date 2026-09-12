"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.requireRole = void 0;
const AppError_1 = require("../utils/AppError");
const requireRole = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new AppError_1.AppError('Authentication required.', 401));
        }
        const userRole = (req.user.role || '').toUpperCase();
        // SuperAdmin always has access to all routes
        if (userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN') {
            return next();
        }
        const normalizedAllowedRoles = roles.flatMap((r) => {
            const up = r.toUpperCase();
            if (up === 'ADMIN')
                return ['ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'];
            if (up === 'EMPLOYEE' || up === 'MEMBER')
                return ['EMPLOYEE', 'MEMBER', 'ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'];
            return [up];
        });
        if (!normalizedAllowedRoles.includes(userRole)) {
            return next(new AppError_1.AppError(`Access denied. Required role: ${roles.join(' or ')}.`, 403));
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.authorize = exports.requireRole;
//# sourceMappingURL=rbac.js.map