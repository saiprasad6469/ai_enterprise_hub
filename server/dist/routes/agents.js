"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const Agent_1 = require("../models/Agent");
const AppError_1 = require("../utils/AppError");
const auditService_1 = require("../services/auditService");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /api/agents — list agents (SuperAdmin sees all, Admin/Employee sees only their department)
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const filter = isSuperAdmin ? {} : { department: req.user.department };
    const agents = await Agent_1.Agent.find(filter).sort({ createdAt: -1 });
    res.json({
        success: true,
        data: agents.map((a) => ({
            id: a._id.toString(),
            name: a.name,
            description: a.description,
            department: a.department,
            model: a.model,
            status: a.status,
            promptTemplate: a.promptTemplate,
            lastUsed: a.lastUsed ? a.lastUsed.toISOString() : 'Never used',
        })),
    });
}));
// POST /api/agents — create agent (SuperAdmin or Admin of department)
router.post('/', (0, rbac_1.authorize)('Admin', 'SuperAdmin'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    let { name, description, department, model, promptTemplate, status } = req.body;
    if (!name || !description || !model) {
        throw new AppError_1.AppError('Name, description, and model are required.', 400);
    }
    // Admins can only create agents for their assigned department
    if (!isSuperAdmin) {
        department = req.user.department;
    }
    const agent = await Agent_1.Agent.create({
        name,
        description,
        department: department || req.user.department || 'Engineering',
        model,
        promptTemplate,
        status: status || 'Active',
        createdBy: req.user._id,
    });
    await auditService_1.auditService.log(req, 'AGENT_CREATE', `Created AI Agent: ${agent.name} for ${agent.department}`);
    res.status(201).json({
        success: true,
        data: {
            id: agent._id.toString(),
            name: agent.name,
            description: agent.description,
            department: agent.department,
            model: agent.model,
            status: agent.status,
            promptTemplate: agent.promptTemplate,
            lastUsed: 'Never used',
        },
    });
}));
// PATCH /api/agents/:id — update agent (department scoped)
router.patch('/:id', (0, rbac_1.authorize)('Admin', 'SuperAdmin'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const targetAgent = await Agent_1.Agent.findById(req.params.id);
    if (!targetAgent)
        throw new AppError_1.AppError('Agent not found.', 404);
    if (!isSuperAdmin && targetAgent.department !== req.user.department) {
        throw new AppError_1.AppError(`Access denied: You can only update AI Agents within your department (${req.user.department}).`, 403);
    }
    const updatedAgent = await Agent_1.Agent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await auditService_1.auditService.log(req, 'AGENT_UPDATE', `Updated agent: ${updatedAgent.name}`);
    res.json({
        success: true,
        data: {
            id: updatedAgent._id.toString(),
            name: updatedAgent.name,
            description: updatedAgent.description,
            department: updatedAgent.department,
            model: updatedAgent.model,
            status: updatedAgent.status,
            promptTemplate: updatedAgent.promptTemplate,
        },
    });
}));
// DELETE /api/agents/:id — delete agent (department scoped)
router.delete('/:id', (0, rbac_1.authorize)('Admin', 'SuperAdmin'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const targetAgent = await Agent_1.Agent.findById(req.params.id);
    if (!targetAgent)
        throw new AppError_1.AppError('Agent not found.', 404);
    if (!isSuperAdmin && targetAgent.department !== req.user.department) {
        throw new AppError_1.AppError(`Access denied: You can only delete AI Agents within your assigned department (${req.user.department}).`, 403);
    }
    await Agent_1.Agent.findByIdAndDelete(req.params.id);
    await auditService_1.auditService.log(req, 'AGENT_DELETE', `Deleted agent: ${targetAgent.name}`);
    res.json({ success: true, message: 'Agent deleted.' });
}));
exports.default = router;
//# sourceMappingURL=agents.js.map