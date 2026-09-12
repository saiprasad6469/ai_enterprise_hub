import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { Document } from '../models/Document';
import { Agent } from '../models/Agent';
import { ChatSession } from '../models/ChatSession';
import { Notification } from '../models/Notification';
import { AppError } from '../utils/AppError';

const router = Router();

// All employee routes require authentication
router.use(authenticate);

// ── GET /api/employee/my-documents ───────────────────────
router.get('/my-documents', asyncHandler(async (req: Request, res: Response) => {
  const docs = await Document.find({ uploadedBy: req.user!._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, data: { documents: docs } });
}));

// ── GET /api/employee/agents ──────────────────────────────
router.get('/agents', asyncHandler(async (req: Request, res: Response) => {
  const dept = req.user!.department;
  const agents = await Agent.find({
    $or: [{ department: dept }, { department: 'All' }],
    status: 'Active',
  }).sort({ lastUsed: -1 });

  res.json({ success: true, data: { agents } });
}));

// ── GET /api/employee/chats ───────────────────────────────
router.get('/chats', asyncHandler(async (req: Request, res: Response) => {
  const sessions = await ChatSession.find({ user: req.user!._id })
    .sort({ updatedAt: -1 })
    .limit(20);

  res.json({ success: true, data: { sessions } });
}));

// ── POST /api/employee/chats ──────────────────────────────
router.post('/chats', asyncHandler(async (req: Request, res: Response) => {
  const { title, agentId } = req.body;
  if (!title) throw new AppError('Chat title is required.', 400);

  const session = await ChatSession.create({
    title,
    user: req.user!._id,
    agent: agentId || null,
    messages: [],
  });

  res.status(201).json({ success: true, data: { session } });
}));

// ── GET /api/employee/notifications ──────────────────────
router.get('/notifications', asyncHandler(async (req: Request, res: Response) => {
  const notifications = await Notification.find({
    $or: [{ recipient: req.user!._id }, { recipient: null }],
  })
    .sort({ createdAt: -1 })
    .limit(30);

  res.json({ success: true, data: { notifications } });
}));

// ── PATCH /api/employee/notifications/:id/read ────────────
router.patch('/notifications/:id/read', asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );
  if (!notification) throw new AppError('Notification not found.', 404);
  res.json({ success: true, data: { notification } });
}));

// ── GET /api/employee/profile ─────────────────────────────
router.get('/profile', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user!._id,
        name: req.user!.name,
        email: req.user!.email,
        role: req.user!.role,
        department: req.user!.department,
        status: req.user!.status,
        avatar: req.user!.avatar,
      },
    },
  });
}));

export default router;
