import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { Workflow } from '../models/Workflow';
import { AppError } from '../utils/AppError';
import { auditService } from '../services/auditService';

const router = Router();
router.use(authenticate);

// GET /api/workflows
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const workflows = await Workflow.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: workflows.map((w) => ({
        id: w._id.toString(),
        name: w.name,
        description: w.description,
        status: w.status,
        steps: w.steps,
        lastRun: w.lastRun ? w.lastRun.toISOString().replace('T', ' ').substring(0, 16) : 'Never run',
        runs: (w.runs || []).map((r: any) => ({
          id: r._id?.toString() || `run_${Math.random()}`,
          runAt: r.runAt ? r.runAt.toISOString().replace('T', ' ').substring(0, 16) : '',
          duration: r.duration || '3.2s',
          status: r.status,
          triggerBy: r.triggerBy || 'User',
        })),
      })),
    });
  })
);

// POST /api/workflows
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { name, description, steps } = req.body;
    if (!name || !description) {
      throw new AppError('Name and description are required.', 400);
    }

    const workflow = await Workflow.create({
      name,
      description,
      steps: steps || ['Trigger', 'Process with AI', 'Store Result'],
      status: 'Completed',
      runs: [],
      createdBy: req.user!._id,
    });

    await auditService.log(req, 'WORKFLOW_CREATE', `Created workflow: ${workflow.name}`);

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
  })
);

// POST /api/workflows/:id/run
router.post(
  '/:id/run',
  asyncHandler(async (req: Request, res: Response) => {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) throw new AppError('Workflow not found.', 404);

    const newRun = {
      runAt: new Date(),
      duration: `${(2 + Math.random() * 4).toFixed(1)}s`,
      status: 'Completed' as const,
      triggerBy: req.user?.name || 'Administrator',
    };

    workflow.status = 'Completed';
    workflow.lastRun = new Date();
    workflow.runs.unshift(newRun as any);
    await workflow.save();

    await auditService.log(req, 'WORKFLOW_TRIGGER', `Executed workflow: ${workflow.name}`);

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
  })
);

// PATCH /api/workflows/:id
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const workflow = await Workflow.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!workflow) throw new AppError('Workflow not found.', 404);
    res.json({ success: true, data: workflow });
  })
);

// DELETE /api/workflows/:id
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    if (!workflow) throw new AppError('Workflow not found.', 404);
    await auditService.log(req, 'WORKFLOW_DELETE', `Deleted workflow: ${workflow.name}`);
    res.json({ success: true, message: 'Workflow deleted.' });
  })
);

export default router;
