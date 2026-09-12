"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Try loading single canonical .env file from project root
const rootEnvPath = path_1.default.resolve(__dirname, '../../../.env');
const serverEnvPath = path_1.default.resolve(__dirname, '../../.env');
if (fs_1.default.existsSync(rootEnvPath)) {
    dotenv_1.default.config({ path: rootEnvPath });
}
else if (fs_1.default.existsSync(serverEnvPath)) {
    dotenv_1.default.config({ path: serverEnvPath });
}
else {
    dotenv_1.default.config();
}
exports.env = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-enterprise-hub',
    JWT_SECRET: process.env.JWT_SECRET || 'aeh-jwt-secret-dev',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'aeh-refresh-secret-dev',
    JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
    JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001',
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10),
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
    GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
};
//# sourceMappingURL=env.js.map