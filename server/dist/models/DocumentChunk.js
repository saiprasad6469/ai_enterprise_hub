"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentChunk = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const documentChunkSchema = new mongoose_1.Schema({
    documentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
        index: true,
    },
    documentName: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
        index: true,
    },
    chunkIndex: {
        type: Number,
        required: true,
    },
    pageNumber: {
        type: Number,
        default: 1,
    },
    section: {
        type: String,
        default: 'General',
        index: true,
    },
    content: {
        type: String,
        required: true,
    },
    embedding: {
        type: [Number],
        required: true,
    },
}, { timestamps: true });
// Compound index for department-isolated RAG search
documentChunkSchema.index({ department: 1, documentId: 1 });
exports.DocumentChunk = mongoose_1.default.model('DocumentChunk', documentChunkSchema);
//# sourceMappingURL=DocumentChunk.js.map