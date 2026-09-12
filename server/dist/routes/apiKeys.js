"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const ApiKey_1 = require("../models/ApiKey");
const AppError_1 = require("../utils/AppError");
const auditService_1 = require("../services/auditService");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /api/api-keys — list API keys
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const keys = await ApiKey_1.ApiKey.find({}).sort({ createdAt: -1 });
    res.json({
        success: true,
        data: keys.map((k) => {
            const prefixSuffix = k.keyPrefix ? k.keyPrefix.substring(k.keyPrefix.length - 4) : '3fa4';
            return {
                id: k._id.toString(),
                name: k.name,
                keyPrefix: k.keyPrefix,
                secretMasked: `••••••••••••••••••••••••••••••••••••${prefixSuffix}`,
                status: k.status,
                scopes: k.scopes,
                created: k.createdAt ? k.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                lastUsed: k.lastUsed ? k.lastUsed.toISOString().replace('T', ' ').substring(0, 16) : 'Never used',
            };
        }),
    });
}));
// POST /api/api-keys — create new API key (SuperAdmin or Admin)
router.post('/', (0, rbac_1.authorize)('Admin', 'SuperAdmin'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, scopes } = req.body;
    if (!name)
        throw new AppError_1.AppError('API key name is required.', 400);
    const rawKey = `aeh_live_${crypto_1.default.randomBytes(20).toString('hex')}`;
    const keyPrefix = rawKey.substring(0, 13);
    const keyHash = crypto_1.default.createHash('sha256').update(rawKey).digest('hex');
    const prefixSuffix = rawKey.substring(rawKey.length - 4);
    const newKey = await ApiKey_1.ApiKey.create({
        name,
        keyPrefix,
        keyHash,
        status: 'Active',
        scopes: scopes || ['chat:write', 'chat:read'],
        userId: req.user._id,
    });
    await auditService_1.auditService.log(req, 'API_KEY_CREATE', `Created API Key: ${newKey.name}`);
    res.status(201).json({
        success: true,
        data: {
            id: newKey._id.toString(),
            name: newKey.name,
            keyPrefix: newKey.keyPrefix,
            secretMasked: `••••••••••••••••••••••••••••••••••••${prefixSuffix}`,
            rawKey, // returned once upon creation
            status: newKey.status,
            scopes: newKey.scopes,
            created: newKey.createdAt ? newKey.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            lastUsed: 'Never used',
        },
    });
}));
// PATCH /api/api-keys/:id/revoke — revoke an API key
router.patch('/:id/revoke', (0, rbac_1.authorize)('Admin', 'SuperAdmin'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const key = await ApiKey_1.ApiKey.findByIdAndUpdate(req.params.id, { status: 'Revoked' }, { new: true });
    if (!key)
        throw new AppError_1.AppError('API key not found.', 404);
    await auditService_1.auditService.log(req, 'API_KEY_REVOKE', `Revoked API Key: ${key.name}`);
    const prefixSuffix = key.keyPrefix ? key.keyPrefix.substring(key.keyPrefix.length - 4) : '7c2a';
    res.json({
        success: true,
        data: {
            id: key._id.toString(),
            name: key.name,
            keyPrefix: key.keyPrefix,
            secretMasked: `••••••••••••••••••••••••••••••••••••${prefixSuffix}`,
            status: key.status,
            scopes: key.scopes,
        },
    });
}));
exports.default = router;
//# sourceMappingURL=apiKeys.js.map