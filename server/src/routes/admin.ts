import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { User } from '../models/User';
import { Document } from '../models/Document';
import { Agent } from '../models/Agent';
import { AuditLog } from '../models/AuditLog';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcryptjs';

const router = Router();

// All admin routes require authentication + Admin role
router.use(authenticate);
router.use(requireRole('Admin'));

// ── GET /api/admin/stats ─────────────────────────────────
router.get('/stats', asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalDocs, totalAgents, totalLogs] = await Promise.all([
    User.countDocuments(),
    Document.countDocuments(),
    Agent.countDocuments(),
    AuditLog.countDocuments(),
  ]);

  const activeUsers = await User.countDocuments({ status: 'Active' });
  const adminUsers = await User.countDocuments({ role: 'Admin' });
  const employeeUsers = await User.countDocuments({ role: 'Employee' });

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
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const role = req.query.role as string;
  const status = req.query.status as string;
  const search = req.query.search as string;

  const filter: Record<string, unknown> = {};
  if (role && (role === 'Admin' || role === 'Employee')) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { users, total, page, pages: Math.ceil(total / limit) },
  });
}));

// ── POST /api/admin/users ─────────────────────────────────
router.post('/users', asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required.', 400);
  }
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters.', 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError('Email already in use.', 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
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
router.patch('/users/:id', asyncHandler(async (req: Request, res: Response) => {
  const { name, role, department, status } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...(name && { name }), ...(role && { role }), ...(department && { department }), ...(status && { status }) },
    { new: true, runValidators: true }
  ).select('-passwordHash -refreshTokens');

  if (!user) throw new AppError('User not found.', 404);
  res.json({ success: true, data: { user } });
}));

// ── DELETE /api/admin/users/:id ───────────────────────────
router.delete('/users/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  res.json({ success: true, message: 'User deleted successfully.' });
}));

// ── GET /api/admin/audit-logs ─────────────────────────────
router.get('/audit-logs', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 30;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(),
  ]);

  res.json({
    success: true,
    data: { logs, total, page, pages: Math.ceil(total / limit) },
  });
}));

// ── GET /api/admin/documents ──────────────────────────────
router.get('/documents', asyncHandler(async (_req: Request, res: Response) => {
  const docs = await Document.find()
    .populate('uploadedBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, data: { documents: docs } });
}));

export default router;
