"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const User_1 = require("../models/User");
const Document_1 = require("../models/Document");
const Agent_1 = require("../models/Agent");
const AuditLog_1 = require("../models/AuditLog");
const AppError_1 = require("../utils/AppError");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = (0, express_1.Router)();
// All admin routes require authentication + Admin role
router.use(auth_1.authenticate);
router.use((0, rbac_1.requireRole)('Admin'));
// ── GET /api/admin/stats ─────────────────────────────────
router.get('/stats', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [totalUsers, totalDocs, totalAgents, totalLogs] = await Promise.all([
        User_1.User.countDocuments(),
        Document_1.Document.countDocuments(),
        Agent_1.Agent.countDocuments(),
        AuditLog_1.AuditLog.countDocuments(),
    ]);
    const activeUsers = await User_1.User.countDocuments({ status: 'Active' });
    const adminUsers = await User_1.User.countDocuments({ role: 'Admin' });
    const employeeUsers = await User_1.User.countDocuments({ role: 'Employee' });
    res.json({
        success: true,
        data: {
            totalUsers,
            activeUsers,
            adminUsers,
            employeeUsers,
            totalDocuments: totalDocs,
            totalAgents,
            totalAuditLogs: totalLogs,
        },
    });
}));
// ── GET /api/admin/users ─────────────────────────────────
router.get('/users', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const status = req.query.status;
    const search = req.query.search;
    const filter = {};
    if (role && (role === 'Admin' || role === 'Employee'))
        filter.role = role;
    if (status)
        filter.status = status;
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }
    const [users, total] = await Promise.all([
        User_1.User.find(filter)
            .select('-passwordHash -refreshTokens')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        User_1.User.countDocuments(filter),
    ]);
    res.json({
        success: true,
        data: { users, total, page, pages: Math.ceil(total / limit) },
    });
}));
// ── POST /api/admin/users ─────────────────────────────────
router.post('/users', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password) {
        throw new AppError_1.AppError('Name, email, and password are required.', 400);
    }
    if (password.length < 8) {
        throw new AppError_1.AppError('Password must be at least 8 characters.', 400);
    }
    const existing = await User_1.User.findOne({ email: email.toLowerCase() });
    if (existing)
        throw new AppError_1.AppError('Email already in use.', 409);
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const user = await User_1.User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role || 'Employee',
        department: department || 'Engineering',
        status: 'Active',
        refreshTokens: [],
    });
    res.status(201).json({
        success: true,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                status: user.status,
                createdAt: user.createdAt,
            },
        },
    });
}));
// ── PATCH /api/admin/users/:id ────────────────────────────
router.patch('/users/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, role, department, status } = req.body;
    const user = await User_1.User.findByIdAndUpdate(req.params.id, { ...(name && { name }), ...(role && { role }), ...(department && { department }), ...(status && { status }) }, { new: true, runValidators: true }).select('-passwordHash -refreshTokens');
    if (!user)
        throw new AppError_1.AppError('User not found.', 404);
    res.json({ success: true, data: { user } });
}));
// ── DELETE /api/admin/users/:id ───────────────────────────
router.delete('/users/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findByIdAndDelete(req.params.id);
    if (!user)
        throw new AppError_1.AppError('User not found.', 404);
    res.json({ success: true, message: 'User deleted successfully.' });
}));
// ── GET /api/admin/audit-logs ─────────────────────────────
router.get('/audit-logs', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
        AuditLog_1.AuditLog.find()
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        AuditLog_1.AuditLog.countDocuments(),
    ]);
    res.json({
        success: true,
        data: { logs, total, page, pages: Math.ceil(total / limit) },
    });
}));
// ── GET /api/admin/documents ──────────────────────────────
router.get('/documents', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const docs = await Document_1.Document.find()
        .populate('uploadedBy', 'name email role')
        .sort({ createdAt: -1 })
        .limit(50);
    res.json({ success: true, data: { documents: docs } });
}));
exports.default = router;
//# sourceMappingURL=admin.js.map