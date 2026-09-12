import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { auditService } from '../services/auditService';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/users — list users (SuperAdmin sees all, Admin/Employee sees only their department)
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';

    const filter = isSuperAdmin ? {} : { department: req.user!.department };
    const users = await User.find(filter)
      .select('-passwordHash -refreshTokens')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users.map((u) => ({
        id: u._id.toString(),
        employeeId: u.employeeId,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        designation: u.designation,
        status: u.status,
        avatar: u.avatar,
        joinedAt: u.createdAt ? u.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
        employeeId: req.user!.employeeId,
        name: req.user!.name,
        email: req.user!.email,
        role: req.user!.role,
        department: req.user!.department,
        designation: req.user!.designation,
        status: req.user!.status,
        avatar: req.user!.avatar,
        joinedAt: req.user!.createdAt,
      },
    });
  })
);

// POST /api/users — create a new user/employee
router.post(
  '/',
  authorize('Admin', 'SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const currentUserRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'SUPERADMIN';

    let { name, email, employeeId, designation, department, password, role, status } = req.body;

    if (!name || !email) {
      throw new AppError('Name and email are required.', 400);
    }

    // Admins can only create employees within their own department
    if (!isSuperAdmin) {
      department = req.user!.department;
      role = 'Employee';
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw new AppError('A user with this email already exists.', 409);
    }

    const userPassword = password || 'Enterprise2026!';
    const passwordHash = await bcrypt.hash(userPassword, 12);

    const newUser = await User.create({
      name,
      email: email.toLowerCase().trim(),
      employeeId: employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      designation: designation || (role === 'Admin' ? 'Enterprise Administrator' : 'Specialist'),
      department: department || req.user!.department || 'Engineering',
      passwordHash,
      role: role || 'Employee',
      status: status || 'Active',
      refreshTokens: [],
    });

    await auditService.log(req, 'USER_CREATE', `Created user ${newUser.email} (${newUser.role}) in department ${newUser.department}`);

    res.status(201).json({
      success: true,
      data: {
        id: newUser._id.toString(),
        employeeId: newUser.employeeId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        designation: newUser.designation,
        status: newUser.status,
        joinedAt: newUser.createdAt ? newUser.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      },
    });
  })
);

// POST /api/users/employee — specific endpoint for department employee creation
router.post(
  '/employee',
  authorize('Admin', 'SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const currentUserRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'SUPERADMIN';

    let { name, email, employeeId, designation, department, password, status } = req.body;
    if (!name || !email) {
      throw new AppError('Name and email are required.', 400);
    }

    // Admins can ONLY create employees for their assigned department
    if (!isSuperAdmin) {
      department = req.user!.department;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw new AppError('An employee with this email already exists.', 409);
    }

    const userPassword = password || 'EmpSecret2026!';
    const passwordHash = await bcrypt.hash(userPassword, 12);

    const newEmployee = await User.create({
      name,
      email: email.toLowerCase().trim(),
      employeeId: employeeId || `EMP-${Math.floor(200 + Math.random() * 800)}`,
      designation: designation || 'Operations Associate',
      department: department || req.user!.department || 'Engineering',
      passwordHash,
      role: 'Employee',
      status: status || 'Active',
      refreshTokens: [],
    });

    await auditService.log(req, 'EMPLOYEE_CREATE', `Added employee ${newEmployee.name} (${newEmployee.employeeId}) to ${newEmployee.department}`);

    res.status(201).json({
      success: true,
      data: {
        id: newEmployee._id.toString(),
        employeeId: newEmployee.employeeId,
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        department: newEmployee.department,
        designation: newEmployee.designation,
        status: newEmployee.status,
        joinedAt: newEmployee.createdAt ? newEmployee.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      },
    });
  })
);

// POST /api/users/admin — specific endpoint for admin creation (Super Admin ONLY)
router.post(
  '/admin',
  authorize('SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email, employeeId, designation, department, password, role } = req.body;
    if (!name || !email) {
      throw new AppError('Name and email are required.', 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw new AppError('An administrator with this email already exists.', 409);
    }

    const userPassword = password || 'AdminSecret2026!';
    const passwordHash = await bcrypt.hash(userPassword, 12);

    const newAdmin = await User.create({
      name,
      email: email.toLowerCase().trim(),
      employeeId: employeeId || `ADM-${Math.floor(100 + Math.random() * 900)}`,
      designation: designation || 'Enterprise Administrator',
      department: department || 'Engineering',
      passwordHash,
      role: role || 'Admin',
      status: 'Active',
      refreshTokens: [],
    });

    await auditService.log(req, 'ADMIN_PROVISION', `Provisioned Admin: ${newAdmin.name} (${newAdmin.email}) for department ${newAdmin.department}`);

    res.status(201).json({
      success: true,
      data: {
        id: newAdmin._id.toString(),
        employeeId: newAdmin.employeeId,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        department: newAdmin.department,
        designation: newAdmin.designation,
        status: newAdmin.status,
        joinedAt: newAdmin.createdAt ? newAdmin.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      },
    });
  })
);

// PATCH /api/users/:id/password — reset user password (scoped to department for Admins)
router.patch(
  '/:id/password',
  authorize('Admin', 'SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const currentUserRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'SUPERADMIN';

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) throw new AppError('User not found.', 404);

    if (!isSuperAdmin && targetUser.department !== req.user!.department) {
      throw new AppError(`Access denied: You can only manage users within your department (${req.user!.department}).`, 403);
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters long.', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    targetUser.passwordHash = passwordHash;
    targetUser.refreshTokens = [];
    await targetUser.save();

    await auditService.log(req, 'PASSWORD_RESET', `Password reset for user: ${targetUser.email}`);

    res.json({ success: true, message: 'Password updated successfully.' });
  })
);

// PATCH /api/users/:id — update user details or toggle status (department scoped)
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const targetId = req.params.id;
    const currentUser = req.user!;
    const currentUserRole = (currentUser.role || '').toUpperCase();
    const isSuperAdmin = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'SUPERADMIN';
    const isAdmin = currentUserRole === 'ADMIN';
    const isSelf = currentUser._id.toString() === targetId;

    const targetUser = await User.findById(targetId);
    if (!targetUser) throw new AppError('User not found.', 404);

    if (!isSelf && !isSuperAdmin && !isAdmin) {
      throw new AppError('Access denied.', 403);
    }

    // Admins can ONLY edit users within their department
    if (isAdmin && !isSelf && targetUser.department !== currentUser.department) {
      throw new AppError(`Access denied: You can only edit employees in the ${currentUser.department} department.`, 403);
    }

    const updates: any = {};
    const { name, department, designation, role, status, avatar } = req.body;
    if (name) updates.name = name;
    if (designation) updates.designation = designation;
    if (avatar) updates.avatar = avatar;

    // SuperAdmin can change department & role globally; Admin can only edit employees within department
    if (isSuperAdmin) {
      if (department) updates.department = department;
      if (role) updates.role = role;
      if (status) updates.status = status;
    } else if (isAdmin) {
      if (status) updates.status = status;
    }

    const updatedUser = await User.findByIdAndUpdate(targetId, updates, { new: true })
      .select('-passwordHash -refreshTokens');

    await auditService.log(req, 'USER_UPDATE', `Updated user: ${updatedUser!.email}`);

    res.json({
      success: true,
      data: {
        id: updatedUser!._id.toString(),
        employeeId: updatedUser!.employeeId,
        name: updatedUser!.name,
        email: updatedUser!.email,
        role: updatedUser!.role,
        department: updatedUser!.department,
        designation: updatedUser!.designation,
        status: updatedUser!.status,
        avatar: updatedUser!.avatar,
        joinedAt: updatedUser!.createdAt,
      },
    });
  })
);

// DELETE /api/users/:id — delete user (department scoped)
router.delete(
  '/:id',
  authorize('Admin', 'SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const currentUserRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'SUPERADMIN';

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) throw new AppError('User not found.', 404);

    if (!isSuperAdmin && targetUser.department !== req.user!.department) {
      throw new AppError(`Access denied: You can only delete employees within your assigned department (${req.user!.department}).`, 403);
    }

    if (!isSuperAdmin && ['ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'].includes((targetUser.role || '').toUpperCase())) {
      throw new AppError('Access denied: Department administrators cannot delete other administrators.', 403);
    }

    await User.findByIdAndDelete(req.params.id);
    await auditService.log(req, 'USER_DELETE', `Deleted user: ${targetUser.email}`);

    res.json({ success: true, message: 'User deleted.' });
  })
);

export default router;
