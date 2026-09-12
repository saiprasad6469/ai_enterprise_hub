import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { auditService } from '../services/auditService';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/users — list all users (Admin/Member)
router.get(
  '/',
  authorize('Admin', 'Member'),
  asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find()
      .select('-passwordHash -refreshTokens')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        status: u.status,
        avatar: u.avatar,
        joinedAt: u.createdAt,
      })),
    });
  })
);

// GET /api/users/me — get current user profile
router.get(
  '/me',
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        id: req.user!._id,
        name: req.user!.name,
        email: req.user!.email,
        role: req.user!.role,
        department: req.user!.department,
        status: req.user!.status,
        avatar: req.user!.avatar,
        joinedAt: req.user!.createdAt,
      },
    });
  })
);

// GET /api/users/:id
router.get(
  '/:id',
  authorize('Admin', 'Member'),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id).select('-passwordHash -refreshTokens');
    if (!user) throw new AppError('User not found.', 404);

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        avatar: user.avatar,
        joinedAt: user.createdAt,
      },
    });
  })
);

// PATCH /api/users/:id — update user (Admin only for role/status, user for own profile)
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const targetId = req.params.id;
    const currentUser = req.user!;
    const isSelf = currentUser._id.toString() === targetId;
    const isAdmin = currentUser.role === 'Admin';

    if (!isSelf && !isAdmin) {
      throw new AppError('You can only edit your own profile.', 403);
    }

    const allowedFields: Record<string, boolean> = {
      name: true,
      department: true,
      avatar: true,
    };

    // Admin can also change role and status
    if (isAdmin) {
      allowedFields.role = true;
      allowedFields.status = true;
    }

    const updates: any = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (allowedFields[key]) {
        updates[key] = value;
      }
    }

    const user = await User.findByIdAndUpdate(targetId, updates, { new: true })
      .select('-passwordHash -refreshTokens');

    if (!user) throw new AppError('User not found.', 404);

    await auditService.log(req, 'USER_UPDATE', `Updated user: ${user.email}`);

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        avatar: user.avatar,
        joinedAt: user.createdAt,
      },
    });
  })
);

// DELETE /api/users/:id — Admin only
router.delete(
  '/:id',
  authorize('Admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new AppError('User not found.', 404);

    await auditService.log(req, 'USER_DELETE', `Deleted user: ${user.email}`);

    res.json({ success: true, message: 'User deleted.' });
  })
);

export default router;
