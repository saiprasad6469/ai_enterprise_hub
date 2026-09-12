import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { ChatSession } from '../models/ChatSession';
import { Agent } from '../models/Agent';
import { DocumentModel } from '../models/Document';
import { AppError } from '../utils/AppError';

const router = Router();
router.use(authenticate);

// GET /api/chats
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const chats = await ChatSession.find({ userId: req.user!._id })
      .sort({ updatedAt: -1 })
      .select('-messages');

    res.json({ success: true, data: chats });
  })
);

// POST /api/chats — create new chat session
router.post(
  '/',
  authorize('Admin', 'Member'),
  asyncHandler(async (req: Request, res: Response) => {
    const { agentId, title } = req.body;

    let chatTitle = title || 'New AI Consultation';
    if (agentId) {
      const agent = await Agent.findById(agentId);
      if (agent) chatTitle = `Chat with ${agent.name}`;
    }

    const chat = await ChatSession.create({
      title: chatTitle,
      userId: req.user!._id,
      agentId,
      messages: [],
      organization: req.user!.organization,
    });

    res.status(201).json({ success: true, data: chat });
  })
);

// GET /api/chats/:id — get chat with messages
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const chat = await ChatSession.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });
    if (!chat) throw new AppError('Chat not found.', 404);

    res.json({ success: true, data: chat });
  })
);

// POST /api/chats/:id/messages — send message & get AI response
router.post(
  '/:id/messages',
  authorize('Admin', 'Member'),
  asyncHandler(async (req: Request, res: Response) => {
    const { content } = req.body;
    if (!content) throw new AppError('Message content is required.', 400);

    const chat = await ChatSession.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });
    if (!chat) throw new AppError('Chat not found.', 404);

    // Add user message
    chat.messages.push({
      sender: 'user',
      content,
      timestamp: new Date(),
    });

    // Generate AI response (mock — extensible for OpenAI/Gemini/Claude)
    const agent = chat.agentId ? await Agent.findById(chat.agentId) : null;
    const agentName = agent?.name || 'Enterprise Assistant';
    const agentDept = agent?.department || 'Enterprise Ops';

    let aiResponse = `As ${agentName} specializing in ${agentDept}, I have analyzed your query.\n\n`;
    aiResponse += `**Analysis Summary:**\n\n`;
    aiResponse += `1. **Context Match**: Found relevant references across your documents.\n`;
    aiResponse += `2. **Verification**: Parameter lookups executed.\n\n`;
    aiResponse += `\`\`\`javascript\nconst config = {\n  model: "${agent?.model || 'GPT-4o'}",\n  temperature: 0.2,\n};\n\`\`\`\n\n`;
    aiResponse += `Is there anything specific you would like me to elaborate on?`;

    // Build mock citations from existing documents
    const docs = await DocumentModel.find().limit(2);
    const citations = docs.map((d, i) => ({
      docName: d.name,
      page: i + 1,
      textSnippet: `Relevant reference from ${d.name} regarding your query.`,
    }));

    chat.messages.push({
      sender: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      citations,
    });

    await chat.save();

    // Return the last two messages (user + assistant)
    const lastMessages = chat.messages.slice(-2);
    res.json({ success: true, data: { messages: lastMessages } });
  })
);

// DELETE /api/chats/:id
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const chat = await ChatSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!._id,
    });
    if (!chat) throw new AppError('Chat not found.', 404);

    res.json({ success: true, message: 'Chat deleted.' });
  })
);

export default router;
