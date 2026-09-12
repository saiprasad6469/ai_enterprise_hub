"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const Department_1 = require("../models/Department");
const AppError_1 = require("../utils/AppError");
const auditService_1 = require("../services/auditService");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /api/departments — list departments (SuperAdmin sees all, Admin/Employee sees their assigned department)
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const filter = isSuperAdmin ? {} : { name: req.user.department };
    const depts = await Department_1.Department.find(filter).sort({ name: 1 });
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
}));
// POST /api/departments — create a department (SuperAdmin ONLY)
router.post('/', (0, rbac_1.authorize)('SuperAdmin'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, code, head, budget, description } = req.body;
    if (!name || !code || !head) {
        throw new AppError_1.AppError('Name, code, and department head are required.', 400);
    }
    const dept = await Department_1.Department.create({
        name,
        code: code.toUpperCase(),
        head,
        budget: budget || '$100,000',
        description,
    });
    await auditService_1.auditService.log(req, 'DEPARTMENT_CREATE', `Created department: ${dept.name} (${dept.code})`);
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
}));
// PATCH /api/departments/:id — update department details (SuperAdmin or Admin of that department)
router.patch('/:id', (0, rbac_1.authorize)('Admin', 'SuperAdmin'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const targetDept = await Department_1.Department.findById(req.params.id);
    if (!targetDept)
        throw new AppError_1.AppError('Department not found.', 404);
    if (!isSuperAdmin && targetDept.name !== req.user.department) {
        throw new AppError_1.AppError(`Access denied: You can only update your assigned department (${req.user.department}).`, 403);
    }
    const updatedDept = await Department_1.Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await auditService_1.auditService.log(req, 'DEPARTMENT_UPDATE', `Updated department: ${updatedDept.name}`);
    res.json({ success: true, data: updatedDept });
}));
// DELETE /api/departments/:id — delete department (SuperAdmin ONLY)
router.delete('/:id', (0, rbac_1.authorize)('SuperAdmin'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const dept = await Department_1.Department.findByIdAndDelete(req.params.id);
    if (!dept)
        throw new AppError_1.AppError('Department not found.', 404);
    await auditService_1.auditService.log(req, 'DEPARTMENT_DELETE', `Deleted department: ${dept.name}`);
    res.json({ success: true, message: 'Department deleted.' });
}));
exports.default = router;
//# sourceMappingURL=departments.js.map