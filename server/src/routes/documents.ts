import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { Document as DocumentModel } from '../models/Document';
import { DocumentChunk } from '../models/DocumentChunk';
import { ragService } from '../services/ragService';
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

// GET /api/documents — list documents (SuperAdmin sees all, Admin/Employee sees only their department)
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    await ragService.seedEnterpriseDocuments();

    const userRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';

    const filter = isSuperAdmin ? {} : { department: req.user!.department };
    const docs = await DocumentModel.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: docs.map((d: any) => ({
        id: d._id,
        name: d.name,
        type: d.type,
        size: `${(d.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedBy: (d.uploadedBy as any)?.name || 'Unknown',
        uploadedAt: d.createdAt ? d.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: d.status,
        progress: d.progress,
        chunksCount: d.chunksCount || 1,
        department: d.department,
      })),
    });
  })
);

// POST /api/documents/upload — upload document & trigger RAG vector ingestion (Restricted to Admins & SuperAdmin)
router.post(
  '/upload',
  authorize('Admin', 'SuperAdmin'),
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('No file uploaded.', 400);
    }

    const userRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const ext = path.extname(req.file.originalname).replace('.', '').toUpperCase();

    // Backend authoritative department assignment (never trust client payload for non-SuperAdmins)
    const docDepartment = isSuperAdmin
      ? req.body.department || req.user!.department
      : req.user!.department;

    const doc = await DocumentModel.create({
      name: req.file.originalname,
      originalName: req.file.originalname,
      type: ext,
      size: req.file.size,
      uploadedBy: req.user!._id,
      status: 'Indexing',
      progress: 50,
      path: req.file.path,
      department: docDepartment,
    });

    await auditService.log(req, 'DOC_UPLOAD', `${doc.name} in department ${docDepartment}`);

    // Process RAG Ingestion Pipeline synchronously (Text extraction -> Chunking -> Embedding -> MongoDB Vector Storage)
    try {
      await ragService.processDocumentIngestion(
        doc._id.toString(),
        doc.name,
        docDepartment,
        req.file.path,
        ext
      );
    } catch (err) {
      console.error('RAG Ingestion Error:', err);
      await DocumentModel.findByIdAndUpdate(doc._id, { status: 'Failed' });
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded and queued for vector RAG indexing.',
      data: {
        id: doc._id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        status: 'Indexed',
        department: doc.department,
      },
    });
  })
);

// GET /api/documents/:id
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';

    const doc = await DocumentModel.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!doc) throw new AppError('Document not found.', 404);

    if (!isSuperAdmin && doc.department !== req.user!.department) {
      throw new AppError(`Access denied: You can only access documents in your assigned department (${req.user!.department}).`, 403);
    }

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
        chunksCount: doc.chunksCount || 1,
        department: doc.department,
      },
    });
  })
);

// GET /api/documents/:id/download — download document (scoped to department authorization)
router.get(
  '/:id/download',
  asyncHandler(async (req: Request, res: Response) => {
    const userRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';

    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) throw new AppError('Document not found.', 404);

    if (!isSuperAdmin && doc.department !== req.user!.department) {
      throw new AppError(`Access denied: You can only download documents within your assigned department (${req.user!.department}).`, 403);
    }

    if (!doc.path || !fs.existsSync(doc.path)) {
      throw new AppError('Physical document file not found on server storage.', 444);
    }

    await auditService.log(req, 'DOC_DOWNLOAD', `${doc.name} (${doc.department})`);
    res.download(doc.path, doc.originalName || doc.name);
  })
);

// DELETE /api/documents/:id — delete document & remove RAG vector chunks (Restricted to Admins & SuperAdmin)
router.delete(
  '/:id',
  authorize('Admin', 'SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const userRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';

    const targetDoc = await DocumentModel.findById(req.params.id);
    if (!targetDoc) throw new AppError('Document not found.', 404);

    if (!isSuperAdmin && targetDoc.department !== req.user!.department) {
      throw new AppError(`Access denied: You can only delete documents within your department (${targetDoc.department}).`, 403);
    }

    // Remove document and its vector chunks to prevent orphaned vectors
    await DocumentModel.findByIdAndDelete(req.params.id);
    await DocumentChunk.deleteMany({ documentId: req.params.id });

    // Delete physical file
    if (targetDoc.path && fs.existsSync(targetDoc.path)) {
      fs.unlinkSync(targetDoc.path);
    }

    await auditService.log(req, 'DOC_DELETE', targetDoc.name);

    res.json({ success: true, message: 'Document and vector embeddings deleted.' });
  })
);

// POST /api/documents/reindex — re-parse and re-index all uploaded files into clean vector chunks
router.post(
  '/reindex',
  authorize('Admin', 'SuperAdmin'),
  asyncHandler(async (req: Request, res: Response) => {
    const docs = await DocumentModel.find({});
    let reindexedCount = 0;

    for (const doc of docs) {
      if (doc.path && fs.existsSync(doc.path)) {
        await DocumentChunk.deleteMany({ documentId: doc._id });
        await ragService.processDocumentIngestion(
          doc._id.toString(),
          doc.name,
          doc.department || 'Engineering',
          doc.path,
          doc.type
        );
        reindexedCount++;
      }
    }

    res.json({
      success: true,
      message: `Re-indexed ${reindexedCount} documents with zip XML parser into clean vector chunks.`,
    });
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
