"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = void 0;
const AuditLog_1 = require("../models/AuditLog");
exports.auditService = {
    async log(req, action, target, status = 'Success') {
        try {
            await AuditLog_1.AuditLog.create({
                user: req.user?._id,
                action,
                target,
                ipAddress: req.ip || req.socket.remoteAddress || '0.0.0.0',
                status,
            });
        }
        catch (err) {
            // Audit logging should never crash the main flow
            console.error('Audit log failed:', err);
        }
    },
};
//# sourceMappingURL=auditService.js.map