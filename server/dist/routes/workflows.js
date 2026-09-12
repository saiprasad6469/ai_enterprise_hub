"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const Workflow_1 = require("../models/Workflow");
const AppError_1 = require("../utils/AppError");
const auditService_1 = require("../services/auditService");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /api/workflows
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const workflows = await Workflow_1.Workflow.find().sort({ createdAt: -1 });
    res.json({
        success: true,
        data: workflows.map((w) => ({
            id: w._id.toString(),
            name: w.name,
            description: w.description,
            status: w.status,
            steps: w.steps,
            lastRun: w.lastRun ? w.lastRun.toISOString().replace('T', ' ').substring(0, 16) : 'Never run',
            runs: (w.runs || []).map((r) => ({
                id: r._id?.toString() || `run_${Math.random()}`,
                runAt: r.runAt ? r.runAt.toISOString().replace('T', ' ').substring(0, 16) : '',
                duration: r.duration || '3.2s',
                status: r.status,
                triggerBy: r.triggerBy || 'User',
            })),
        })),
    });
}));
// POST /api/workflows
router.post('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, description, steps } = req.body;
    if (!name || !description) {
        throw new AppError_1.AppError('Name and description are required.', 400);
    }
    const workflow = await Workflow_1.Workflow.create({
        name,
        description,
        steps: steps || ['Trigger', 'Process with AI', 'Store Result'],
        status: 'Completed',
        runs: [],
        createdBy: req.user._id,
    });
    await auditService_1.auditService.log(req, 'WORKFLOW_CREATE', `Created workflow: ${workflow.name}`);
    res.status(201).json({
        success: true,
        data: {
            id: workflow._id.toString(),
            name: workflow.name,
            description: workflow.description,
            status: workflow.status,
            steps: workflow.steps,
            lastRun: 'Never run',
            runs: [],
        },
    });
}));
// POST /api/workflows/:id/run
router.post('/:id/run', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const workflow = await Workflow_1.Workflow.findById(req.params.id);
    if (!workflow)
        throw new AppError_1.AppError('Workflow not found.', 404);
    const newRun = {
        runAt: new Date(),
        duration: `${(2 + Math.random() * 4).toFixed(1)}s`,
        status: 'Completed',
        triggerBy: req.user?.name || 'Administrator',
    };
    workflow.status = 'Completed';
    workflow.lastRun = new Date();
    workflow.runs.unshift(newRun);
    await workflow.save();
    await auditService_1.auditService.log(req, 'WORKFLOW_TRIGGER', `Executed workflow: ${workflow.name}`);
    res.json({
        success: true,
        data: {
            workflow: {
                id: workflow._id.toString(),
                name: workflow.name,
                status: workflow.status,
                lastRun: workflow.lastRun.toISOString().replace('T', ' ').substring(0, 16),
                runs: workflow.runs,
            },
        },
    });
}));
// PATCH /api/workflows/:id
router.patch('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const workflow = await Workflow_1.Workflow.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!workflow)
        throw new AppError_1.AppError('Workflow not found.', 404);
    res.json({ success: true, data: workflow });
}));
// DELETE /api/workflows/:id
router.delete('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const workflow = await Workflow_1.Workflow.findByIdAndDelete(req.params.id);
    if (!workflow)
        throw new AppError_1.AppError('Workflow not found.', 404);
    await auditService_1.auditService.log(req, 'WORKFLOW_DELETE', `Deleted workflow: ${workflow.name}`);
    res.json({ success: true, message: 'Workflow deleted.' });
}));
exports.default = router;
//# sourceMappingURL=workflows.js.map