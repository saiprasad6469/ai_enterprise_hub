import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authService } from '../services/authService';
import { auditService } from '../services/auditService';
import { authenticate } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required.', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters.', 400);
    }

    const { user, accessToken, refreshToken } = await authService.register({
      name,
      email,
      password,
      role,
      department,
    });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth',
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: authService.sanitizeUser(user),
        accessToken,
      },
    });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, id, password, role, department } = req.body;
    const identifier = id || email;

    if (!identifier || !password) {
      throw new AppError('Email/ID and password are required.', 400);
    }

    const { user, accessToken, refreshToken } = await authService.login(identifier, password, role, department);

    // Audit log
    await auditService.log(
      { ...req, user } as Request,
      'USER_LOGIN',
      `Login from ${req.ip}`,
      'Success'
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: authService.sanitizeUser(user),
        accessToken,
      },
    });
  })
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!oldRefreshToken) {
      throw new AppError('Refresh token is required.', 400);
    }

    const { accessToken, refreshToken } = await authService.refreshAccessToken(oldRefreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    res.json({
      success: true,
      data: { accessToken },
    });
  })
);

// POST /api/auth/logout
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (refreshToken && req.user) {
      await authService.logout(req.user._id.toString(), refreshToken);
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });

    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  })
);

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: { user: authService.sanitizeUser(req.user!) },
    });
  })
);

// POST /api/auth/forgot-password (stubbed for future email integration)
router.post(
  '/forgot-password',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required.', 400);

    // In production, send a reset link via email service
    // For now, just acknowledge the request
    res.json({
      success: true,
      message: 'If this email is registered, a reset link has been sent.',
    });
  })
);

export default router;
