"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const Document_1 = require("../models/Document");
const Agent_1 = require("../models/Agent");
const ChatSession_1 = require("../models/ChatSession");
const Notification_1 = require("../models/Notification");
const AppError_1 = require("../utils/AppError");
const router = (0, express_1.Router)();
// All employee routes require authentication
router.use(auth_1.authenticate);
// ── GET /api/employee/my-documents ───────────────────────
router.get('/my-documents', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const docs = await Document_1.Document.find({ uploadedBy: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
    res.json({ success: true, data: { documents: docs } });
}));
// ── GET /api/employee/agents ──────────────────────────────
router.get('/agents', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const dept = req.user.department;
    const agents = await Agent_1.Agent.find({
        $or: [{ department: dept }, { department: 'All' }],
        status: 'Active',
    }).sort({ lastUsed: -1 });
    res.json({ success: true, data: { agents } });
}));
// ── GET /api/employee/chats ───────────────────────────────
router.get('/chats', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const sessions = await ChatSession_1.ChatSession.find({ user: req.user._id })
        .sort({ updatedAt: -1 })
        .limit(20);
    res.json({ success: true, data: { sessions } });
}));
// ── POST /api/employee/chats ──────────────────────────────
router.post('/chats', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { title, agentId } = req.body;
    if (!title)
        throw new AppError_1.AppError('Chat title is required.', 400);
    const session = await ChatSession_1.ChatSession.create({
        title,
        user: req.user._id,
        agent: agentId || null,
        messages: [],
    });
    res.status(201).json({ success: true, data: { session } });
}));
// ── GET /api/employee/notifications ──────────────────────
router.get('/notifications', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const notifications = await Notification_1.Notification.find({
        $or: [{ recipient: req.user._id }, { recipient: null }],
    })
        .sort({ createdAt: -1 })
        .limit(30);
    res.json({ success: true, data: { notifications } });
}));
// ── PATCH /api/employee/notifications/:id/read ────────────
router.patch('/notifications/:id/read', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const notification = await Notification_1.Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification)
        throw new AppError_1.AppError('Notification not found.', 404);
    res.json({ success: true, data: { notification } });
}));
// ── GET /api/employee/profile ─────────────────────────────
router.get('/profile', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                department: req.user.department,
                status: req.user.status,
                avatar: req.user.avatar,
            },
        },
    });
}));
exports.default = router;
//# sourceMappingURL=employee.js.map