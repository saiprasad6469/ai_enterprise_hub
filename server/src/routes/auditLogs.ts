import mongoose from 'mongoose';
import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { AuditLog } from '../models/AuditLog';
import { User } from '../models/User';

const router = Router();
router.use(authenticate);

// GET /api/audit-logs — list audit logs (Role-based: SuperAdmin = all, Admin = department users, Employee = self)
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const actionFilter = req.query.action as string;
    const statusFilter = req.query.status as string;
    const searchVal = req.query.search as string;
    const roleFilter = req.query.role as string;

    const userRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const isAdmin = userRole === 'ADMIN';

    const mongoFilter: any = {};

    if (actionFilter && actionFilter !== 'All') {
      mongoFilter.action = { $regex: actionFilter, $options: 'i' };
    }

    if (statusFilter && statusFilter !== 'All') {
      mongoFilter.status = statusFilter;
    }

    if (!isSuperAdmin) {
      if (isAdmin) {
        // Admin sees logs where the user belongs to the Admin's department
        const departmentUsers = await User.find({ department: req.user!.department }).select('_id');
        const userIds = departmentUsers.map((u) => u._id);
        mongoFilter.user = { $in: userIds };
      } else {
        // Employee sees only their own audit logs
        const validUserId = mongoose.Types.ObjectId.isValid(req.user!._id?.toString())
          ? req.user!._id
          : new mongoose.Types.ObjectId('65a000000000000000000000');
        mongoFilter.user = validUserId;
      }
    } else {
      // SuperAdmin can filter by user role if requested
      if (roleFilter && roleFilter !== 'All') {
        const roleUsers = await User.find({ 
          role: { $regex: roleFilter, $options: 'i' } 
        }).select('_id');
        const roleUserIds = roleUsers.map((u) => u._id);
        mongoFilter.user = { $in: roleUserIds };
      }
    }

    let logsQuery = AuditLog.find(mongoFilter)
      .populate('user', 'name email role department employeeId designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    let [rawLogs, total] = await Promise.all([
      logsQuery.exec(),
      AuditLog.countDocuments(mongoFilter),
    ]);

    // Client-side text search fallback if search query passed
    let formattedLogs = rawLogs.map((log: any) => {
      const userObj = log.user || {};
      const userName = userObj.name || 'System';
      const userEmail = userObj.email || 'system@enterprise.ai';
      const userRoleStr = userObj.role || 'System';
      const userDept = userObj.department || 'Enterprise';

      return {
        id: log._id.toString(),
        timestamp: log.createdAt ? log.createdAt.toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: userEmail,
        userName,
        userRole: userRoleStr,
        department: userDept,
        action: log.action,
        target: log.target,
        ipAddress: log.ipAddress || '192.168.1.1',
        status: log.status || 'Success',
      };
    });

    if (searchVal) {
      const searchLower = searchVal.toLowerCase();
      formattedLogs = formattedLogs.filter((log) =>
        log.user.toLowerCase().includes(searchLower) ||
        log.userName.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.target.toLowerCase().includes(searchLower) ||
        log.department.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: {
        logs: formattedLogs,
        total: formattedLogs.length,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

export default router;
