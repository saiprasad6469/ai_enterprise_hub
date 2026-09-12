"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const AuditLog_1 = require("../models/AuditLog");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /api/audit-logs — list audit logs (Role-based: SuperAdmin = all, Admin = department users, Employee = self)
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const actionFilter = req.query.action;
    const statusFilter = req.query.status;
    const searchVal = req.query.search;
    const roleFilter = req.query.role;
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const isAdmin = userRole === 'ADMIN';
    const mongoFilter = {};
    if (actionFilter && actionFilter !== 'All') {
        mongoFilter.action = { $regex: actionFilter, $options: 'i' };
    }
    if (statusFilter && statusFilter !== 'All') {
        mongoFilter.status = statusFilter;
    }
    if (!isSuperAdmin) {
        if (isAdmin) {
            // Admin sees logs where the user belongs to the Admin's department
            const departmentUsers = await User_1.User.find({ department: req.user.department }).select('_id');
            const userIds = departmentUsers.map((u) => u._id);
            mongoFilter.user = { $in: userIds };
        }
        else {
            // Employee sees only their own audit logs
            mongoFilter.user = req.user._id;
        }
    }
    else {
        // SuperAdmin can filter by user role if requested
        if (roleFilter && roleFilter !== 'All') {
            const roleUsers = await User_1.User.find({
                role: { $regex: roleFilter, $options: 'i' }
            }).select('_id');
            const roleUserIds = roleUsers.map((u) => u._id);
            mongoFilter.user = { $in: roleUserIds };
        }
    }
    let logsQuery = AuditLog_1.AuditLog.find(mongoFilter)
        .populate('user', 'name email role department employeeId designation')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    let [rawLogs, total] = await Promise.all([
        logsQuery.exec(),
        AuditLog_1.AuditLog.countDocuments(mongoFilter),
    ]);
    // Client-side text search fallback if search query passed
    let formattedLogs = rawLogs.map((log) => {
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
        formattedLogs = formattedLogs.filter((log) => log.user.toLowerCase().includes(searchLower) ||
            log.userName.toLowerCase().includes(searchLower) ||
            log.action.toLowerCase().includes(searchLower) ||
            log.target.toLowerCase().includes(searchLower) ||
            log.department.toLowerCase().includes(searchLower));
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
}));
exports.default = router;
//# sourceMappingURL=auditLogs.js.map