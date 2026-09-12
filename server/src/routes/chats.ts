import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { ChatSession } from '../models/ChatSession';
import { Agent } from '../models/Agent';
import { Document as DocumentModel } from '../models/Document';
import { ragService } from '../services/ragService';
import { AppError } from '../utils/AppError';
import { auditService } from '../services/auditService';

import mongoose from 'mongoose';

const router = Router();
router.use(authenticate);

// GET /api/chats
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const validUserId = mongoose.Types.ObjectId.isValid(req.user!._id?.toString())
      ? req.user!._id
      : new mongoose.Types.ObjectId('65a000000000000000000000');

    const chats = await ChatSession.find({ user: validUserId })
      .sort({ updatedAt: -1 })
      .select('-messages');

    res.json({ success: true, data: chats });
  })
);

// POST /api/chats — create new chat session
router.post(
  '/',
  authorize('Admin', 'Employee', 'Member'),
  asyncHandler(async (req: Request, res: Response) => {
    const { agentId, title } = req.body;
    const validUserId = mongoose.Types.ObjectId.isValid(req.user!._id?.toString())
      ? req.user!._id
      : new mongoose.Types.ObjectId('65a000000000000000000000');

    let chatTitle = title || 'New AI Consultation';
    if (agentId && mongoose.Types.ObjectId.isValid(agentId)) {
      const agent = await Agent.findById(agentId);
      if (agent) chatTitle = `Chat with ${agent.name}`;
    }

    const chat = await ChatSession.create({
      title: chatTitle,
      user: validUserId,
      agent: (agentId && mongoose.Types.ObjectId.isValid(agentId)) ? agentId : null,
      messages: [],
    });

    await auditService.log(req, 'CHAT_CREATE', chatTitle);

    res.status(201).json({ success: true, data: chat });
  })
);

// GET /api/chats/:id — get chat with messages
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    let chat = null;
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      chat = await ChatSession.findOne({
        _id: rawId,
        user: req.user!._id,
      });
    }
    if (!chat) throw new AppError('Chat not found.', 404);

    res.json({ success: true, data: chat });
  })
);

// POST /api/chats/:id/messages — send message & generate RAG response with vector citations
router.post(
  '/:id/messages',
  authorize('Admin', 'Employee', 'Member'),
  asyncHandler(async (req: Request, res: Response) => {
    const { content } = req.body;
    if (!content) throw new AppError('Message content is required.', 400);

    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    let chat = null;
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      chat = await ChatSession.findOne({
        _id: rawId,
        user: req.user!._id,
      });
    }

    if (!chat) {
      chat = await ChatSession.create({
        title: 'New AI Consultation',
        user: req.user!._id,
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
    const userRole = (req.user!.role || '').toUpperCase();
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const ragResult = await ragService.retrieveDepartmentContext(
      content,
      req.user!.department,
      isSuperAdmin,
      8,
      12000
    );

    const agent = chat.agent ? await Agent.findById(chat.agent) : null;
    const agentName = agent?.name || 'Enterprise AI Assistant';
    const agentDept = agent?.department || req.user!.department;

    let aiResponse: string | null = null;
    let isNotFound = ragResult.status === 'NOT_FOUND';

    if (!isNotFound) {
      aiResponse = await ragService.generateGroqLLMResponse(
        content,
        ragResult.contextText,
        agentName,
        req.user!.department,
        req.user!.role
      );

      // Fallback to local grounded RAG synthesizer if Groq API key is not configured or offline
      if (!aiResponse || aiResponse.trim() === 'NOT_FOUND' || aiResponse.includes('Information on this topic is not available')) {
        aiResponse = ragService.generateLocalRAGResponse(
          content,
          ragResult.contextText,
          ragResult.sources,
          agentName,
          req.user!.department
        );
      }
    }

    if (isNotFound || !aiResponse) {
      aiResponse = `The requested information was not found in the authorized **${req.user!.department}** department documents.`;
    }

    chat.messages.push({
      sender: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    await chat.save();
    await auditService.log(req, 'CHAT_QUERY', `Query to ${agentName} (${req.user!.department})`);

    const parseCategoriesFromContext = (contextText: string) => {
      const categories: Array<{ name: string; items: string[] }> = [];
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
  })
);

// DELETE /api/chats/:id
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    if (!rawId || rawId === 'undefined' || !mongoose.Types.ObjectId.isValid(rawId)) {
      return res.json({ success: true, message: 'Invalid or temp chat skipped.' });
    }

    const chat = await ChatSession.findOneAndDelete({
      _id: rawId,
      user: req.user!._id,
    });
    if (!chat) throw new AppError('Chat not found.', 404);

    res.json({ success: true, message: 'Chat deleted.' });
  })
);

export default router;
