import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { DocumentModel } from '../models/Document';
import { AppError } from '../utils/AppError';
import { auditService } from '../services/auditService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for local file storage
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.txt', '.csv', '.xlsx', '.pptx', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError(`File type ${ext} is not supported.`, 400) as any);
    }
  },
});

const router = Router();
router.use(authenticate);

// GET /api/documents
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const docs = await DocumentModel.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: docs.map((d) => ({
        id: d._id,
        name: d.name,
        type: d.type,
        size: d.size,
        uploadedBy: (d.uploadedBy as any)?.name || 'Unknown',
        uploadedAt: d.createdAt,
        status: d.status,
        progress: d.progress,
        department: d.department,
      })),
    });
  })
);

// POST /api/documents/upload
router.post(
  '/upload',
  authorize('Admin', 'Member'),
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('No file uploaded.', 400);
    }

    const ext = path.extname(req.file.originalname).replace('.', '').toUpperCase();
    const sizeKB = req.file.size / 1024;
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;

    const doc = await DocumentModel.create({
      name: req.file.originalname,
      type: ext,
      size: sizeStr,
      uploadedBy: req.user!._id,
      status: 'Processing',
      progress: 0,
      filePath: req.file.path,
      department: req.body.department || req.user!.department,
      organization: req.user!.organization,
    });

    await auditService.log(req, 'DOC_UPLOAD', doc.name);

    // Simulate background processing (would use BullMQ queue in production)
    simulateDocumentProcessing(doc._id.toString());

    res.status(201).json({
      success: true,
      message: 'Document uploaded and queued for processing.',
      data: {
        id: doc._id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        status: doc.status,
      },
    });
  })
);

// GET /api/documents/:id
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const doc = await DocumentModel.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!doc) throw new AppError('Document not found.', 404);

    res.json({
      success: true,
      data: {
        id: doc._id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        uploadedBy: (doc.uploadedBy as any)?.name || 'Unknown',
        uploadedAt: doc.createdAt,
        status: doc.status,
        department: doc.department,
      },
    });
  })
);

// DELETE /api/documents/:id
router.delete(
  '/:id',
  authorize('Admin', 'Member'),
  asyncHandler(async (req: Request, res: Response) => {
    const doc = await DocumentModel.findByIdAndDelete(req.params.id);
    if (!doc) throw new AppError('Document not found.', 404);

    // Delete physical file
    if (doc.filePath && fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    await auditService.log(req, 'DOC_DELETE', doc.name);

    res.json({ success: true, message: 'Document deleted.' });
  })
);

// Background processing simulation (extensible for BullMQ / LangChain / Qdrant)
function simulateDocumentProcessing(docId: string) {
  let progress = 0;
  const interval = setInterval(async () => {
    progress += 20;
    try {
      if (progress >= 100) {
        await DocumentModel.findByIdAndUpdate(docId, {
          status: 'Processed',
          $unset: { progress: 1 },
        });
        clearInterval(interval);
      } else {
        await DocumentModel.findByIdAndUpdate(docId, { progress });
      }
    } catch {
      clearInterval(interval);
    }
  }, 800);
}

export default router;
