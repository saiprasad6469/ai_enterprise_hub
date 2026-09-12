import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { AppError } from '../utils/AppError';

const router = Router();
router.use(authenticate);

// GET /api/notifications — list notifications
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const notifs = await Notification.find({})
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
  })
);

// PATCH /api/notifications/read-all — mark all notifications as read
router.patch(
  '/read-all',
  asyncHandler(async (_req: Request, res: Response) => {
    await Notification.updateMany({}, { read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  })
);

// DELETE /api/notifications/:id — clear a notification
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const notif = await Notification.findByIdAndDelete(req.params.id);
    if (!notif) throw new AppError('Notification not found.', 404);
    res.json({ success: true, message: 'Notification cleared.' });
  })
);

export default router;
