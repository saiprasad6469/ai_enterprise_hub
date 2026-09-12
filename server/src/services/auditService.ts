import { AuditLog } from '../models/AuditLog';
import { Request } from 'express';

export const auditService = {
  async log(
    req: Request,
    action: string,
    target: string,
    status: 'Success' | 'Failed' = 'Success'
  ) {
    try {
      await AuditLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email || 'system',
        action,
        target,
        ipAddress: req.ip || req.socket.remoteAddress || '0.0.0.0',
        status,
        organization: req.user?.organization,
      });
    } catch (err) {
      // Audit logging should never crash the main flow
      console.error('Audit log failed:', err);
    }
  },
};
