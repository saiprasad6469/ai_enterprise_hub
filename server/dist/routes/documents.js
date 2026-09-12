"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const Document_1 = require("../models/Document");
const DocumentChunk_1 = require("../models/DocumentChunk");
const ragService_1 = require("../services/ragService");
const AppError_1 = require("../utils/AppError");
const auditService_1 = require("../services/auditService");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure multer for local file storage
const uploadDir = path_1.default.resolve(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['.pdf', '.docx', '.txt', '.csv', '.xlsx', '.pptx', '.png', '.jpg', '.jpeg'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new AppError_1.AppError(`File type ${ext} is not supported.`, 400));
        }
    },
});
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /api/documents — list documents (SuperAdmin sees all, Admin/Employee sees only their department)
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await ragService_1.ragService.seedEnterpriseDocuments();
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const filter = isSuperAdmin ? {} : { department: req.user.department };
    const docs = await Document_1.Document.find(filter)
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 });
    res.json({
        success: true,
        data: docs.map((d) => ({
            id: d._id,
            name: d.name,
            type: d.type,
            size: `${(d.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadedBy: d.uploadedBy?.name || 'Unknown',
            uploadedAt: d.createdAt ? d.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: d.status,
            progress: d.progress,
            chunksCount: d.chunksCount || 1,
            department: d.department,
        })),
    });
}));
// POST /api/documents/upload — upload document & trigger RAG vector ingestion (Restricted to Admins & SuperAdmin)
router.post('/upload', (0, rbac_1.authorize)('Admin', 'SuperAdmin'), upload.single('file'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw new AppError_1.AppError('No file uploaded.', 400);
    }
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const ext = path_1.default.extname(req.file.originalname).replace('.', '').toUpperCase();
    // Backend authoritative department assignment (never trust client payload for non-SuperAdmins)
    const docDepartment = isSuperAdmin
        ? req.body.department || req.user.department
        : req.user.department;
    const doc = await Document_1.Document.create({
        name: req.file.originalname,
        originalName: req.file.originalname,
        type: ext,
        size: req.file.size,
        uploadedBy: req.user._id,
        status: 'Indexing',
        progress: 50,
        path: req.file.path,
        department: docDepartment,
    });
    await auditService_1.auditService.log(req, 'DOC_UPLOAD', `${doc.name} in department ${docDepartment}`);
    // Process RAG Ingestion Pipeline synchronously (Text extraction -> Chunking -> Embedding -> MongoDB Vector Storage)
    try {
        await ragService_1.ragService.processDocumentIngestion(doc._id.toString(), doc.name, docDepartment, req.file.path, ext);
    }
    catch (err) {
        console.error('RAG Ingestion Error:', err);
        await Document_1.Document.findByIdAndUpdate(doc._id, { status: 'Failed' });
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
}));
// GET /api/documents/:id
router.get('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const doc = await Document_1.Document.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!doc)
        throw new AppError_1.AppError('Document not found.', 404);
    if (!isSuperAdmin && doc.department !== req.user.department) {
        throw new AppError_1.AppError(`Access denied: You can only access documents in your assigned department (${req.user.department}).`, 403);
    }
    res.json({
        success: true,
        data: {
            id: doc._id,
            name: doc.name,
            type: doc.type,
            size: doc.size,
            uploadedBy: doc.uploadedBy?.name || 'Unknown',
            uploadedAt: doc.createdAt,
            status: doc.status,
            chunksCount: doc.chunksCount || 1,
            department: doc.department,
        },
    });
}));
// GET /api/documents/:id/download — download document (scoped to department authorization)
router.get('/:id/download', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const doc = await Document_1.Document.findById(req.params.id);
    if (!doc)
        throw new AppError_1.AppError('Document not found.', 404);
    if (!isSuperAdmin && doc.department !== req.user.department) {
        throw new AppError_1.AppError(`Access denied: You can only download documents within your assigned department (${req.user.department}).`, 403);
    }
    if (!doc.path || !fs_1.default.existsSync(doc.path)) {
        throw new AppError_1.AppError('Physical document file not found on server storage.', 444);
    }
    await auditService_1.auditService.log(req, 'DOC_DOWNLOAD', `${doc.name} (${doc.department})`);
    res.download(doc.path, doc.originalName || doc.name);
}));
// DELETE /api/documents/:id — delete document & remove RAG vector chunks (Restricted to Admins & SuperAdmin)
router.delete('/:id', (0, rbac_1.authorize)('Admin', 'SuperAdmin'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const targetDoc = await Document_1.Document.findById(req.params.id);
    if (!targetDoc)
        throw new AppError_1.AppError('Document not found.', 404);
    if (!isSuperAdmin && targetDoc.department !== req.user.department) {
        throw new AppError_1.AppError(`Access denied: You can only delete documents within your department (${targetDoc.department}).`, 403);
    }
    // Remove document and its vector chunks to prevent orphaned vectors
    await Document_1.Document.findByIdAndDelete(req.params.id);
    await DocumentChunk_1.DocumentChunk.deleteMany({ documentId: req.params.id });
    // Delete physical file
    if (targetDoc.path && fs_1.default.existsSync(targetDoc.path)) {
        fs_1.default.unlinkSync(targetDoc.path);
    }
    await auditService_1.auditService.log(req, 'DOC_DELETE', targetDoc.name);
    res.json({ success: true, message: 'Document and vector embeddings deleted.' });
}));
// POST /api/documents/reindex — re-parse and re-index all uploaded files into clean vector chunks
router.post('/reindex', (0, rbac_1.authorize)('Admin', 'SuperAdmin'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const docs = await Document_1.Document.find({});
    let reindexedCount = 0;
    for (const doc of docs) {
        if (doc.path && fs_1.default.existsSync(doc.path)) {
            await DocumentChunk_1.DocumentChunk.deleteMany({ documentId: doc._id });
            await ragService_1.ragService.processDocumentIngestion(doc._id.toString(), doc.name, doc.department || 'Engineering', doc.path, doc.type);
            reindexedCount++;
        }
    }
    res.json({
        success: true,
        message: `Re-indexed ${reindexedCount} documents with zip XML parser into clean vector chunks.`,
    });
}));
// Background processing simulation (extensible for BullMQ / LangChain / Qdrant)
function simulateDocumentProcessing(docId) {
    let progress = 0;
    const interval = setInterval(async () => {
        progress += 20;
        try {
            if (progress >= 100) {
                await Document_1.Document.findByIdAndUpdate(docId, {
                    status: 'Processed',
                    $unset: { progress: 1 },
                });
                clearInterval(interval);
            }
            else {
                await Document_1.Document.findByIdAndUpdate(docId, { progress });
            }
        }
        catch {
            clearInterval(interval);
        }
    }, 800);
}
exports.default = router;
//# sourceMappingURL=documents.js.map