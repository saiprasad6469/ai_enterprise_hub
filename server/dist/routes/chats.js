"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const ChatSession_1 = require("../models/ChatSession");
const Agent_1 = require("../models/Agent");
const ragService_1 = require("../services/ragService");
const AppError_1 = require("../utils/AppError");
const auditService_1 = require("../services/auditService");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /api/chats
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const chats = await ChatSession_1.ChatSession.find({ user: req.user._id })
        .sort({ updatedAt: -1 })
        .select('-messages');
    res.json({ success: true, data: chats });
}));
// POST /api/chats — create new chat session
router.post('/', (0, rbac_1.authorize)('Admin', 'Employee', 'Member'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { agentId, title } = req.body;
    let chatTitle = title || 'New AI Consultation';
    if (agentId && mongoose_1.default.Types.ObjectId.isValid(agentId)) {
        const agent = await Agent_1.Agent.findById(agentId);
        if (agent)
            chatTitle = `Chat with ${agent.name}`;
    }
    const chat = await ChatSession_1.ChatSession.create({
        title: chatTitle,
        user: req.user._id,
        agent: (agentId && mongoose_1.default.Types.ObjectId.isValid(agentId)) ? agentId : null,
        messages: [],
    });
    await auditService_1.auditService.log(req, 'CHAT_CREATE', chatTitle);
    res.status(201).json({ success: true, data: chat });
}));
// GET /api/chats/:id — get chat with messages
router.get('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    let chat = null;
    if (mongoose_1.default.Types.ObjectId.isValid(rawId)) {
        chat = await ChatSession_1.ChatSession.findOne({
            _id: rawId,
            user: req.user._id,
        });
    }
    if (!chat)
        throw new AppError_1.AppError('Chat not found.', 404);
    res.json({ success: true, data: chat });
}));
// POST /api/chats/:id/messages — send message & generate RAG response with vector citations
router.post('/:id/messages', (0, rbac_1.authorize)('Admin', 'Employee', 'Member'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { content } = req.body;
    if (!content)
        throw new AppError_1.AppError('Message content is required.', 400);
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    let chat = null;
    if (mongoose_1.default.Types.ObjectId.isValid(rawId)) {
        chat = await ChatSession_1.ChatSession.findOne({
            _id: rawId,
            user: req.user._id,
        });
    }
    if (!chat) {
        chat = await ChatSession_1.ChatSession.create({
            title: 'New AI Consultation',
            user: req.user._id,
            messages: [],
        });
    }
    // Add user message
    chat.messages.push({
        sender: 'user',
        content,
        timestamp: new Date(),
    });
    // Department-isolated RAG vector search & retrieval
    const userRole = (req.user.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const ragResult = await ragService_1.ragService.retrieveDepartmentContext(content, req.user.department, isSuperAdmin, 8, 12000);
    const agent = chat.agent ? await Agent_1.Agent.findById(chat.agent) : null;
    const agentName = agent?.name || 'Enterprise AI Assistant';
    const agentDept = agent?.department || req.user.department;
    let aiResponse = null;
    let isNotFound = ragResult.status === 'NOT_FOUND';
    if (!isNotFound) {
        aiResponse = await ragService_1.ragService.generateGroqLLMResponse(content, ragResult.contextText, agentName, req.user.department, req.user.role);
        // Fallback to local grounded RAG synthesizer if Groq API key is not configured or offline
        if (!aiResponse || aiResponse.trim() === 'NOT_FOUND' || aiResponse.includes('Information on this topic is not available')) {
            aiResponse = ragService_1.ragService.generateLocalRAGResponse(content, ragResult.contextText, ragResult.sources, agentName, req.user.department);
        }
    }
    if (isNotFound || !aiResponse) {
        aiResponse = `The requested information was not found in the authorized **${req.user.department}** department documents.`;
    }
    chat.messages.push({
        sender: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
    });
    await chat.save();
    await auditService_1.auditService.log(req, 'CHAT_QUERY', `Query to ${agentName} (${req.user.department})`);
    const parseCategoriesFromContext = (contextText) => {
        const categories = [];
        const catRegex = /(?:###|\*\*|^)\s*(Languages|Systems & Backend|Data & ML|Frontend|Technical Skills|Projects|Education|Achievements|Certifications|Key Provisions|Rules|Liabilities|Financials)[:\*]*\s*([^\n]+(?:\n[^\n#]+)*)/gi;
        let m;
        while ((m = catRegex.exec(contextText)) !== null) {
            const catName = m[1].trim();
            const rawItems = m[2]
                .replace(/[*#]/g, '')
                .split(/[,;\n]/)
                .map((i) => i.trim())
                .filter((i) => i.length > 1 && !i.toLowerCase().includes('extracted') && !i.toLowerCase().includes('copilot') && !i.toLowerCase().includes('grounded'));
            if (rawItems.length > 0) {
                categories.push({
                    name: catName,
                    items: Array.from(new Set(rawItems)).slice(0, 10),
                });
            }
        }
        return categories;
    };
    const structuredCategories = !isNotFound ? parseCategoriesFromContext(ragResult.contextText) : [];
    // Return the closed-domain consistent RAG envelope
    res.json({
        success: true,
        status: isNotFound ? 'NOT_FOUND' : 'ANSWERED',
        answer: {
            summary: isNotFound
                ? 'The requested information was not found in the authorized enterprise documents.'
                : aiResponse,
            ...(structuredCategories.length > 0 ? { categories: structuredCategories } : {}),
        },
        data: {
            messages: chat.messages.slice(-2),
            sources: isNotFound ? [] : ragResult.sources,
        },
        sources: isNotFound ? [] : ragResult.sources,
        retrieval: {
            candidateCount: ragResult.retrievalStats?.candidateCount || 0,
            relevantChunkCount: isNotFound ? 0 : ragResult.retrievalStats?.relevantChunkCount || 0,
        },
    });
}));
// DELETE /api/chats/:id
router.delete('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const chat = await ChatSession_1.ChatSession.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!chat)
        throw new AppError_1.AppError('Chat not found.', 404);
    res.json({ success: true, message: 'Chat deleted.' });
}));
exports.default = router;
//# sourceMappingURL=chats.js.map