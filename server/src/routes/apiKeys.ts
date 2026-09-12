import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { ApiKey } from '../models/ApiKey';
import { AppError } from '../utils/AppError';
import { auditService } from '../services/auditService';

const router = Router();
router.use(authenticate);

// GET /api/api-keys — list API keys
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const keys = await ApiKey.find({}).sort({ createdAt: -1 });

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
  })
);

// POST /api/api-keys — create new API key (SuperAdmin or Admin)
router.post(
  '/',
  authorize('Admin', 'SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, scopes } = req.body;
    if (!name) throw new AppError('API key name is required.', 400);

    const rawKey = `aeh_live_${crypto.randomBytes(20).toString('hex')}`;
    const keyPrefix = rawKey.substring(0, 13);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const prefixSuffix = rawKey.substring(rawKey.length - 4);

    const newKey = await ApiKey.create({
      name,
      keyPrefix,
      keyHash,
      status: 'Active',
      scopes: scopes || ['chat:write', 'chat:read'],
      userId: req.user!._id,
    });

    await auditService.log(req, 'API_KEY_CREATE', `Created API Key: ${newKey.name}`);

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
  })
);

// PATCH /api/api-keys/:id/revoke — revoke an API key
router.patch(
  '/:id/revoke',
  authorize('Admin', 'SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const key = await ApiKey.findByIdAndUpdate(
      req.params.id,
      { status: 'Revoked' },
      { new: true }
    );
    if (!key) throw new AppError('API key not found.', 404);

    await auditService.log(req, 'API_KEY_REVOKE', `Revoked API Key: ${key.name}`);

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
  })
);

export default router;
