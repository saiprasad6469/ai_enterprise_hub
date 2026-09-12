"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const authService_1 = require("../services/authService");
const auditService_1 = require("../services/auditService");
const auth_1 = require("../middleware/auth");
const AppError_1 = require("../utils/AppError");
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post('/register', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password) {
        throw new AppError_1.AppError('Name, email, and password are required.', 400);
    }
    if (password.length < 8) {
        throw new AppError_1.AppError('Password must be at least 8 characters.', 400);
    }
    const { user, accessToken, refreshToken } = await authService_1.authService.register({
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
            user: authService_1.authService.sanitizeUser(user),
            accessToken,
        },
    });
}));
// POST /api/auth/login
router.post('/login', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, id, password, role, department } = req.body;
    const identifier = id || email;
    if (!identifier || !password) {
        throw new AppError_1.AppError('Email/ID and password are required.', 400);
    }
    const { user, accessToken, refreshToken } = await authService_1.authService.login(identifier, password, role, department);
    // Audit log
    await auditService_1.auditService.log({ ...req, user }, 'USER_LOGIN', `Login from ${req.ip}`, 'Success');
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
            user: authService_1.authService.sanitizeUser(user),
            accessToken,
        },
    });
}));
// POST /api/auth/refresh
router.post('/refresh', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const oldRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!oldRefreshToken) {
        throw new AppError_1.AppError('Refresh token is required.', 400);
    }
    const { accessToken, refreshToken } = await authService_1.authService.refreshAccessToken(oldRefreshToken);
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
}));
// POST /api/auth/logout
router.post('/logout', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (refreshToken && req.user) {
        await authService_1.authService.logout(req.user._id.toString(), refreshToken);
    }
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({
        success: true,
        message: 'Logged out successfully.',
    });
}));
// GET /api/auth/me
router.get('/me', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    res.json({
        success: true,
        data: { user: authService_1.authService.sanitizeUser(req.user) },
    });
}));
// POST /api/auth/forgot-password (stubbed for future email integration)
router.post('/forgot-password', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email)
        throw new AppError_1.AppError('Email is required.', 400);
    // In production, send a reset link via email service
    // For now, just acknowledge the request
    res.json({
        success: true,
        message: 'If this email is registered, a reset link has been sent.',
    });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map