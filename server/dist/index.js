"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const errorHandler_1 = require("./middleware/errorHandler");
const authService_1 = require("./services/authService");
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const documents_1 = __importDefault(require("./routes/documents"));
const chats_1 = __importDefault(require("./routes/chats"));
const admin_1 = __importDefault(require("./routes/admin"));
const employee_1 = __importDefault(require("./routes/employee"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const departments_1 = __importDefault(require("./routes/departments"));
const agents_1 = __importDefault(require("./routes/agents"));
const workflows_1 = __importDefault(require("./routes/workflows"));
const auditLogs_1 = __importDefault(require("./routes/auditLogs"));
const apiKeys_1 = __importDefault(require("./routes/apiKeys"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const seedService_1 = require("./services/seedService");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// ── CORS Helper ───────────────────────────────────────────
const allowedOrigins = env_1.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
const isAllowedOrigin = (origin) => {
    if (!origin)
        return true;
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))
        return true;
    if (env_1.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return true;
    }
    return false;
};
// ── Socket.IO ──────────────────────────────────────────────
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
exports.io = io;
io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
});
// ── Global Middleware ──────────────────────────────────────
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)(env_1.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// ── Rate Limiting ──────────────────────────────────────────
const isDev = env_1.env.NODE_ENV !== 'production';
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 min
    max: isDev ? 10000 : 200,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev,
    message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 1000 : 20,
    skip: () => isDev,
    message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
// ── Health & Welcome Check ─────────────────────────────────
app.get('/', (_req, res) => {
    res.json({
        success: true,
        name: 'AI Enterprise Hub API',
        version: '1.0.0',
        status: 'running',
        health: '/health',
        api: '/api',
    });
});
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env_1.env.NODE_ENV,
    });
});
// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/documents', documents_1.default);
app.use('/api/chats', chats_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/employee', employee_1.default);
app.use('/api/tasks', tasks_1.default);
app.use('/api/departments', departments_1.default);
app.use('/api/agents', agents_1.default);
app.use('/api/workflows', workflows_1.default);
app.use('/api/audit-logs', auditLogs_1.default);
app.use('/api/api-keys', apiKeys_1.default);
app.use('/api/notifications', notifications_1.default);
// ── 404 handler ────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
});
// ── Global Error Handler ───────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ── Bootstrap ──────────────────────────────────────────────
async function bootstrap() {
    const isConnected = await (0, db_1.connectDB)();
    if (isConnected) {
        await authService_1.authService.seedInitialAccounts();
        await seedService_1.seedService.seedAll();
    }
    httpServer.listen(env_1.env.PORT, () => {
        console.log(`🚀 Server running on http://localhost:${env_1.env.PORT}`);
        console.log(`🌍 Environment: ${env_1.env.NODE_ENV}`);
        console.log(`🔗 CORS Origin: ${env_1.env.CORS_ORIGIN}`);
    });
}
bootstrap().catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map