import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { Department } from '../models/Department';
import { AppError } from '../utils/AppError';
import { auditService } from '../services/auditService';

const router = Router();
router.use(authenticate);

// GET /api/departments — list departments (SuperAdmin sees all, Admin/Employee sees their assigned department)
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';

    const filter = isSuperAdmin ? {} : { name: req.user!.department };
    const depts = await Department.find(filter).sort({ name: 1 });

    res.json({
      success: true,
      data: depts.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        code: d.code,
        head: d.head,
        budget: d.budget,
        membersCount: d.membersCount,
        activeProjects: d.activeProjects,
        description: d.description,
      })),
    });
  })
);

// POST /api/departments — create a department (SuperAdmin ONLY)
router.post(
  '/',
  authorize('SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, code, head, budget, description } = req.body;
    if (!name || !code || !head) {
      throw new AppError('Name, code, and department head are required.', 400);
    }

    const dept = await Department.create({
      name,
      code: code.toUpperCase(),
      head,
      budget: budget || '$100,000',
      description,
    });

    await auditService.log(req, 'DEPARTMENT_CREATE', `Created department: ${dept.name} (${dept.code})`);

    res.status(201).json({
      success: true,
      data: {
        id: dept._id.toString(),
        name: dept.name,
        code: dept.code,
        head: dept.head,
        budget: dept.budget,
        membersCount: dept.membersCount,
        activeProjects: dept.activeProjects,
        description: dept.description,
      },
    });
  })
);

// PATCH /api/departments/:id — update department details (SuperAdmin or Admin of that department)
router.patch(
  '/:id',
  authorize('Admin', 'SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const userRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';

    const targetDept = await Department.findById(req.params.id);
    if (!targetDept) throw new AppError('Department not found.', 404);

    if (!isSuperAdmin && targetDept.name !== req.user!.department) {
      throw new AppError(`Access denied: You can only update your assigned department (${req.user!.department}).`, 403);
    }

    const updatedDept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await auditService.log(req, 'DEPARTMENT_UPDATE', `Updated department: ${updatedDept!.name}`);
    res.json({ success: true, data: updatedDept });
  })
);

// DELETE /api/departments/:id — delete department (SuperAdmin ONLY)
router.delete(
  '/:id',
  authorize('SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) throw new AppError('Department not found.', 404);
    await auditService.log(req, 'DEPARTMENT_DELETE', `Deleted department: ${dept.name}`);
    res.json({ success: true, message: 'Department deleted.' });
  })
);

export default router;
