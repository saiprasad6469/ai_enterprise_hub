import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { Agent } from '../models/Agent';
import { AppError } from '../utils/AppError';
import { auditService } from '../services/auditService';

const router = Router();
router.use(authenticate);

// GET /api/agents — list agents (SuperAdmin sees all, Admin/Employee sees only their department)
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';

    const filter = isSuperAdmin ? {} : { department: req.user!.department };
    const agents = await Agent.find(filter).sort({ createdAt: -1 });

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
  })
);

// POST /api/agents — create agent (SuperAdmin or Admin of department)
router.post(
  '/',
  authorize('Admin', 'SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const userRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';

    let { name, description, department, model, promptTemplate, status } = req.body;
    if (!name || !description || !model) {
      throw new AppError('Name, description, and model are required.', 400);
    }

    // Admins can only create agents for their assigned department
    if (!isSuperAdmin) {
      department = req.user!.department;
    }

    const agent = await Agent.create({
      name,
      description,
      department: department || req.user!.department || 'Engineering',
      model,
      promptTemplate,
      status: status || 'Active',
      createdBy: req.user!._id,
    });

    await auditService.log(req, 'AGENT_CREATE', `Created AI Agent: ${agent.name} for ${agent.department}`);

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
  })
);

// PATCH /api/agents/:id — update agent (department scoped)
router.patch(
  '/:id',
  authorize('Admin', 'SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const userRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';

    const targetAgent = await Agent.findById(req.params.id);
    if (!targetAgent) throw new AppError('Agent not found.', 404);

    if (!isSuperAdmin && targetAgent.department !== req.user!.department) {
      throw new AppError(`Access denied: You can only update AI Agents within your department (${req.user!.department}).`, 403);
    }

    const updatedAgent = await Agent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await auditService.log(req, 'AGENT_UPDATE', `Updated agent: ${updatedAgent!.name}`);

    res.json({
      success: true,
      data: {
        id: updatedAgent!._id.toString(),
        name: updatedAgent!.name,
        description: updatedAgent!.description,
        department: updatedAgent!.department,
        model: updatedAgent!.model,
        status: updatedAgent!.status,
        promptTemplate: updatedAgent!.promptTemplate,
      },
    });
  })
);

// DELETE /api/agents/:id — delete agent (department scoped)
router.delete(
  '/:id',
  authorize('Admin', 'SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const userRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';

    const targetAgent = await Agent.findById(req.params.id);
    if (!targetAgent) throw new AppError('Agent not found.', 404);

    if (!isSuperAdmin && targetAgent.department !== req.user!.department) {
      throw new AppError(`Access denied: You can only delete AI Agents within your assigned department (${req.user!.department}).`, 403);
    }

    await Agent.findByIdAndDelete(req.params.id);
    await auditService.log(req, 'AGENT_DELETE', `Deleted agent: ${targetAgent.name}`);

    res.json({ success: true, message: 'Agent deleted.' });
  })
);

export default router;
