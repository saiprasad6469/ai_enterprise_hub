"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const Task_1 = require("../models/Task");
const AppError_1 = require("../utils/AppError");
const auditService_1 = require("../services/auditService");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /api/tasks — list tasks (SuperAdmin sees all, Admin/Employee sees only their department)
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const filter = isSuperAdmin ? {} : { department: req.user.department };
    const tasks = await Task_1.Task.find(filter).sort({ createdAt: -1 });
    res.json({
        success: true,
        data: tasks.map((t) => ({
            id: t._id.toString(),
            title: t.title,
            department: t.department,
            assignedTo: t.assignedTo,
            priority: t.priority,
            status: t.status,
            dueDate: t.dueDate,
            createdAt: t.createdAt ? t.createdAt.toISOString().split('T')[0] : '',
            createdBy: t.createdBy,
        })),
    });
}));
// POST /api/tasks — create a task (SuperAdmin or Admin of department)
router.post('/', (0, rbac_1.authorize)('Admin', 'SuperAdmin'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    let { title, department, assignedTo, priority, status, dueDate } = req.body;
    if (!title)
        throw new AppError_1.AppError('Task title is required.', 400);
    // Admins can only create tasks for their assigned department
    if (!isSuperAdmin) {
        department = req.user.department;
    }
    const task = await Task_1.Task.create({
        title,
        department: department || req.user.department || 'Engineering',
        assignedTo: assignedTo || 'Unassigned',
        priority: priority || 'Medium',
        status: status || 'Pending',
        dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdBy: req.user?.name || 'Administrator',
    });
    await auditService_1.auditService.log(req, 'TASK_CREATE', `Created task: ${task.title} for ${task.department}`);
    res.status(201).json({
        success: true,
        data: {
            id: task._id.toString(),
            title: task.title,
            department: task.department,
            assignedTo: task.assignedTo,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate,
            createdAt: task.createdAt ? task.createdAt.toISOString().split('T')[0] : '',
            createdBy: task.createdBy,
        },
    });
}));
// PATCH /api/tasks/:id — update task or update status (department scoped)
router.patch('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const isAdmin = userRole === 'ADMIN';
    const targetTask = await Task_1.Task.findById(req.params.id);
    if (!targetTask)
        throw new AppError_1.AppError('Task not found.', 404);
    if (!isSuperAdmin && targetTask.department !== req.user.department) {
        throw new AppError_1.AppError(`Access denied: You can only update tasks within your department (${req.user.department}).`, 403);
    }
    const updates = {};
    if (isSuperAdmin || isAdmin) {
        const { title, assignedTo, priority, status, dueDate } = req.body;
        if (title)
            updates.title = title;
        if (assignedTo)
            updates.assignedTo = assignedTo;
        if (priority)
            updates.priority = priority;
        if (status)
            updates.status = status;
        if (dueDate)
            updates.dueDate = dueDate;
    }
    else {
        // Employees can only update task status
        if (req.body.status)
            updates.status = req.body.status;
    }
    const updatedTask = await Task_1.Task.findByIdAndUpdate(req.params.id, updates, { new: true });
    await auditService_1.auditService.log(req, 'TASK_UPDATE', `Updated task: ${updatedTask.title} (${updatedTask.status})`);
    res.json({
        success: true,
        data: {
            id: updatedTask._id.toString(),
            title: updatedTask.title,
            department: updatedTask.department,
            assignedTo: updatedTask.assignedTo,
            priority: updatedTask.priority,
            status: updatedTask.status,
            dueDate: updatedTask.dueDate,
        },
    });
}));
// DELETE /api/tasks/:id — delete task (department scoped, Admins/SuperAdmins only)
router.delete('/:id', (0, rbac_1.authorize)('Admin', 'SuperAdmin'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const targetTask = await Task_1.Task.findById(req.params.id);
    if (!targetTask)
        throw new AppError_1.AppError('Task not found.', 404);
    if (!isSuperAdmin && targetTask.department !== req.user.department) {
        throw new AppError_1.AppError(`Access denied: You can only delete tasks within your assigned department (${req.user.department}).`, 403);
    }
    await Task_1.Task.findByIdAndDelete(req.params.id);
    await auditService_1.auditService.log(req, 'TASK_DELETE', `Deleted task: ${targetTask.title}`);
    res.json({ success: true, message: 'Task deleted.' });
}));
exports.default = router;
//# sourceMappingURL=tasks.js.map