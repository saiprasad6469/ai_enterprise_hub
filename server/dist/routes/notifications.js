"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const Notification_1 = require("../models/Notification");
const AppError_1 = require("../utils/AppError");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /api/notifications — list notifications
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const notifs = await Notification_1.Notification.find({})
        .sort({ createdAt: -1 })
        .limit(50);
    res.json({
        success: true,
        data: notifs.map((n) => ({
            id: n._id.toString(),
            title: n.title,
            description: n.description,
            category: n.category || 'System',
            read: n.read || false,
            time: n.createdAt ? n.createdAt.toISOString().replace('T', ' ').substring(0, 16) : 'Just now',
        })),
    });
}));
// PATCH /api/notifications/read-all — mark all notifications as read
router.patch('/read-all', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    await Notification_1.Notification.updateMany({}, { read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
}));
// DELETE /api/notifications/:id — clear a notification
router.delete('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const notif = await Notification_1.Notification.findByIdAndDelete(req.params.id);
    if (!notif)
        throw new AppError_1.AppError('Notification not found.', 404);
    res.json({ success: true, message: 'Notification cleared.' });
}));
exports.default = router;
//# sourceMappingURL=notifications.js.map