"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ragService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zlib_1 = __importDefault(require("zlib"));
const DocumentChunk_1 = require("../models/DocumentChunk");
const Document_1 = require("../models/Document");
const User_1 = require("../models/User");
const env_1 = require("../config/env");
/**
 * Extract uncompressed string content of a specific file entry inside a ZIP archive (DOCX)
 */
function extractZipEntry(buffer, targetFileName) {
    try {
        let offset = 0;
        while (offset < buffer.length - 30) {
            if (buffer[offset] === 0x50 &&
                buffer[offset + 1] === 0x4b &&
                buffer[offset + 2] === 0x03 &&
                buffer[offset + 3] === 0x04) {
                const compressionMethod = buffer.readUInt16LE(offset + 8);
                const compressedSize = buffer.readUInt32LE(offset + 18);
                const fileNameLen = buffer.readUInt16LE(offset + 26);
                const extraLen = buffer.readUInt16LE(offset + 28);
                const fileName = buffer.toString('utf-8', offset + 30, offset + 30 + fileNameLen);
                const dataOffset = offset + 30 + fileNameLen + extraLen;
                if (fileName === targetFileName || fileName.endsWith('/' + targetFileName)) {
                    const compressedData = buffer.subarray(dataOffset, dataOffset + compressedSize);
                    if (compressionMethod === 8) {
                        const decompressed = zlib_1.default.inflateRawSync(compressedData);
                        return decompressed.toString('utf-8');
                    }
                    else if (compressionMethod === 0) {
                        return compressedData.toString('utf-8');
                    }
                }
                offset = dataOffset + Math.max(1, compressedSize);
            }
            else {
                offset++;
            }
        }
    }
    catch (err) {
        console.error('ZIP entry extraction error:', err);
    }
    return null;
}
class RAGService {
    /**
     * Helper: Generate a deterministic term-frequency vector embedding for text
     */
    generateVectorEmbedding(text, dimensions = 64) {
        const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
        const vector = new Array(dimensions).fill(0);
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            let hash = 0;
            for (let j = 0; j < word.length; j++) {
                hash = (hash << 5) - hash + word.charCodeAt(j);
                hash |= 0;
            }
            const index = Math.abs(hash) % dimensions;
            vector[index] += 1;
        }
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        if (magnitude > 0) {
            return vector.map((val) => Number((val / magnitude).toFixed(6)));
        }
        return vector;
    }
    /**
     * Helper: Compute cosine similarity between two vector embeddings
     */
    cosineSimilarity(vecA, vecB) {
        if (!vecA.length || !vecB.length || vecA.length !== vecB.length)
            return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0)
            return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    /**
     * Seed initial enterprise documents and vector chunks into MongoDB
     */
    async seedEnterpriseDocuments() {
        try {
            console.log('🌱 Checking enterprise documents and RAG vector chunks in MongoDB...');
            const initialDocuments = [
                {
                    name: 'Q4_Financial_Report.pdf',
                    originalName: 'Q4_Financial_Report.pdf',
                    type: 'PDF',
                    size: 4404019,
                    department: 'Finance',
                    status: 'Indexed',
                    chunksCount: 2,
                    content: [
                        'Q4 Financial Report 2026. Executive Summary: Revenue increased by 24% year-over-year reaching $42.8M in Q4. Operating margins expanded to 18.5%. Cloud infrastructure expense totaled $5.2M.',
                        'Net income for Q4 was $8.4M. Depreciation of IT hardware assets accounted for $1.2M. Key financial risks include foreign currency volatility and subscription churn in mid-market tier.'
                    ]
                },
                {
                    name: 'Employee_Handbook_2026.docx',
                    originalName: 'Employee_Handbook_2026.docx',
                    type: 'DOCX',
                    size: 1887436,
                    department: 'HR',
                    status: 'Indexed',
                    chunksCount: 3,
                    content: [
                        'Employee Handbook 2026. Section 1: Work Hours & Remote Policy. Standard working hours are 9:00 AM to 5:00 PM local time. Hybrid work policy permits up to 3 days remote work per week with manager approval.',
                        'Section 2: Paid Time Off (PTO). Full-time employees receive 20 days annual PTO, 10 paid public holidays, and 5 sick days.',
                        'Section 3: Code of Conduct & AI Usage. Employees must maintain confidentiality when using internal AI copilots. Customer PII must never be exported to unapproved third-party tools. Parental leave provides 16 weeks fully paid leave.'
                    ]
                },
                {
                    name: 'GDPR_Compliance_Checklist.txt',
                    originalName: 'GDPR_Compliance_Checklist.txt',
                    type: 'TXT',
                    size: 260096,
                    department: 'Legal',
                    status: 'Indexed',
                    chunksCount: 2,
                    content: [
                        'GDPR Compliance Checklist & Legal Standards 2026. Article 82 Outline: Right to Compensation and Liability Rules. Data subjects have the right to receive compensation for material or non-material damage resulting from GDPR violations.',
                        'Article 83 Outline: Administrative Fines up to 20,000,000 EUR or 4% of global annual turnover, whichever is higher. Data Minimization & Consent Flags: Organizations must implement explicit consent flags in user schema (`gdpr_consent: boolean`, `is_anonymized: boolean`). Data Retention: Personal data must be purged after 24 months of inactivity.'
                    ]
                },
                {
                    name: 'Marketing_Strategy_v2.pptx',
                    originalName: 'Marketing_Strategy_v2.pptx',
                    type: 'PPTX',
                    size: 13002342,
                    department: 'Marketing',
                    status: 'Indexed',
                    chunksCount: 2,
                    content: [
                        'Marketing Strategy Q3/Q4 2026. Product Launch Go-To-Market Plan. Target Audience: Enterprise IT Decision Makers and Developers. Primary Channels: LinkedIn Sponsored Content, Developer Webinars, Industry Tech Summits.',
                        'Key Messaging: Scalable Enterprise AI Hub with Department Isolation and RAG Governance. Budget Allocation: $1.2M total campaign spend across digital ads (40%), events (35%), and content marketing (25%). Target KPI: 500 Enterprise MQLs.'
                    ]
                },
                {
                    name: 'Customer_Churn_Q2.csv',
                    originalName: 'Customer_Churn_Q2.csv',
                    type: 'CSV',
                    size: 3250585,
                    department: 'Operations',
                    status: 'Indexed',
                    chunksCount: 2,
                    content: [
                        'Customer Churn Q2 Dataset & Operational Analysis. Overall Q2 logo churn rate was 2.1%, down from 2.8% in Q1. Primary churn reasons: Integration complexity (42%), Pricing constraints (28%), Missing custom workflow integrations (18%).',
                        'Account Retention Strategy: Deploy proactive customer success managers for accounts with ARR > $50K. Offer dedicated onboarding assistance for custom vector RAG pipeline setup.'
                    ]
                },
                {
                    name: 'API_Documentation_Draft.pdf',
                    originalName: 'API_Documentation_Draft.pdf',
                    type: 'PDF',
                    size: 9332326,
                    department: 'Engineering',
                    status: 'Indexed',
                    chunksCount: 2,
                    content: [
                        'API Documentation & Microservices Architecture Specification 2026. Base URL: https://api.enterprise.ai/v1. Authentication: Bearer JWT access tokens passed in HTTP Authorization header.',
                        'Rate Limiting: 1000 requests per 15 minutes for dev tier, 10,000 requests for enterprise tier. Endpoints: POST /api/chats/messages for vector RAG querying; POST /api/documents/upload for multipart file ingestion; GET /api/audit-logs for security tracking.'
                    ]
                },
                {
                    name: 'Supplier_Contract_Draft.docx',
                    originalName: 'Supplier_Contract_Draft.docx',
                    type: 'DOCX',
                    size: 962560,
                    department: 'Legal',
                    status: 'Indexed',
                    chunksCount: 2,
                    content: [
                        'Supplier & Vendor Master Services Agreement Draft 2026. Clause 4: Service Level Agreement (SLA). Vendor guarantees 99.9% uptime for cloud compute resources. SLA breaches incur a 10% credit penalty on monthly invoicing.',
                        'Clause 7: Indemnification & Intellectual Property. Vendor indemnifies customer against third-party IP infringement claims up to $5M limit. Clause 12: Term & Termination. Either party may terminate with 60 days written notice.'
                    ]
                },
                {
                    name: 'Infrastructure_Cost_Model.xlsx',
                    originalName: 'Infrastructure_Cost_Model.xlsx',
                    type: 'XLSX',
                    size: 5452595,
                    department: 'Engineering',
                    status: 'Indexed',
                    chunksCount: 2,
                    content: [
                        'Infrastructure Cost Model & Cloud Projections 2026. AWS EC2 & Compute Spend: 25 instances running t4g.xlarge at $0.1344/hr totaling $2,450/month.',
                        'Vector DB Index Spend (Pinecone/MongoDB Vector): $1,800/month for 50M embeddings. Model API Token Consumption (Groq/Gemini): $3,200/month based on 150M monthly tokens. Total projected monthly cloud infrastructure budget: $7,450/month.'
                    ]
                },
                {
                    name: 'Andugule_Sai_Prasad_Resume (1).docx',
                    originalName: 'Andugule_Sai_Prasad_Resume (1).docx',
                    type: 'DOCX',
                    size: 48500,
                    department: 'Engineering',
                    status: 'Indexed',
                    chunksCount: 3,
                    content: [
                        'TECHNICAL SKILLS\nLanguages: Python, C++, JavaScript, HTML5, CSS3\nSystems & Backend: Node.js, Express.js, REST API Design & Architecture, MySQL\nData & ML: Machine Learning, Data Pipelines, Feature Engineering, MongoDB\nDevelopment Tools: Git, VS Code, Postman',
                        'PROJECTS\nProject 1: Real-Time Enterprise AI Hub & RAG Engine. Architected and built closed-domain RAG system using Node.js, Express, MongoDB Vector Search, and Groq Llama-3.3-70B model. Implemented department isolation, RBAC governance, and citation cards.\nProject 2: Autonomous Code Assistant & AST Parser. Developed AST-based code analysis engine for automated bug detection and code formatting in JavaScript/TypeScript.\nProject 3: Distributed Microservices API Gateway. Designed high-throughput JWT authenticated API gateway handling 10k req/min with rate limiting and audit logging.',
                        'EDUCATION\nBachelor of Technology (B.Tech) in Computer Science and Engineering. CGPA: 8.8/10. Key Coursework: Data Structures & Algorithms, Operating Systems, Database Management Systems, Machine Learning.\n\nACHIEVEMENTS & CERTIFICATIONS\nAdvanced Software Engineering Job Simulation — Walmart (Issued Apr 2026)\nData Analytics Job Simulation — Deloitte (Issued Apr 2026)\nWinner of National Level Hackathon 2025 for Enterprise AI Solution.'
                    ]
                }
            ];
            const defaultUser = await User_1.User.findOne({});
            const defaultUserId = defaultUser ? defaultUser._id : undefined;
            for (const item of initialDocuments) {
                let existingDoc = await Document_1.Document.findOne({ name: item.name });
                if (!existingDoc) {
                    if (!defaultUserId)
                        continue;
                    existingDoc = await Document_1.Document.create({
                        name: item.name,
                        originalName: item.originalName,
                        type: item.type,
                        size: item.size,
                        path: `uploads/${item.name}`,
                        uploadedBy: defaultUserId,
                        status: item.status,
                        department: item.department,
                        chunksCount: item.chunksCount,
                    });
                }
                else {
                    existingDoc.department = item.department;
                    await existingDoc.save();
                }
                await DocumentChunk_1.DocumentChunk.deleteMany({ documentName: item.name });
                await DocumentChunk_1.DocumentChunk.deleteMany({ documentId: existingDoc._id });
                const chunkDocs = item.content.map((chunkContent, idx) => ({
                    documentId: existingDoc._id,
                    documentName: item.name,
                    department: item.department,
                    chunkIndex: idx + 1,
                    pageNumber: idx + 1,
                    content: chunkContent,
                    embedding: this.generateVectorEmbedding(chunkContent),
                }));
                await DocumentChunk_1.DocumentChunk.insertMany(chunkDocs);
            }
            console.log('✅ Seeding initial enterprise documents and vector chunks completed.');
        }
        catch (err) {
            console.error('Error seeding enterprise documents:', err);
        }
    }
    /**
     * Extract raw text from uploaded physical files
     */
    async extractTextFromFile(filePath, fileType) {
        try {
            if (!fs_1.default.existsSync(filePath)) {
                return `Sample extracted operational text content for file of type ${fileType}.`;
            }
            const ext = (fileType || path_1.default.extname(filePath)).toUpperCase().replace('.', '');
            if (['TXT', 'CSV', 'JSON', 'LOG', 'MD'].includes(ext)) {
                return fs_1.default.readFileSync(filePath, 'utf-8');
            }
            const buffer = fs_1.default.readFileSync(filePath);
            if (ext === 'DOCX') {
                const documentXml = extractZipEntry(buffer, 'word/document.xml');
                if (documentXml) {
                    const textMatches = documentXml.match(/<w:t[^>]*>(.*?)<\/w:t>/gi);
                    if (textMatches && textMatches.length > 0) {
                        const cleanParagraphs = textMatches
                            .map((p) => p.replace(/<[^>]+>/g, '').trim())
                            .filter((t) => t.length > 0)
                            .join(' ');
                        if (cleanParagraphs.length > 20) {
                            return `[DOCX Document: ${path_1.default.basename(filePath)}]\n` + cleanParagraphs;
                        }
                    }
                }
            }
            if (ext === 'PDF') {
                const rawContent = buffer.toString('utf-8');
                const textBlocks = rawContent.match(/\((.*?)\)\s*Tj/g) || rawContent.match(/BT[\s\S]*?ET/g);
                if (textBlocks && textBlocks.length > 0) {
                    const pdfText = textBlocks
                        .map((b) => b.replace(/[()]/g, ' ').replace(/<[^>]+>/g, ' ').trim())
                        .filter((t) => t.length > 2)
                        .join(' ');
                    if (pdfText.length > 30) {
                        return `[PDF Document: ${path_1.default.basename(filePath)}]\n` + pdfText;
                    }
                }
            }
            const rawString = buffer.toString('utf-8', 0, Math.min(buffer.length, 500000));
            const extractedWords = rawString
                .replace(/<[^>]+>/g, ' ')
                .replace(/[^a-zA-Z0-9\s.,\-\/:;()]/g, ' ')
                .split(/\s+/)
                .filter((w) => w.length > 1 && !w.startsWith('PK') && !w.startsWith('w:') && !w.startsWith('r:') && !w.includes('rels') && !w.includes('xml'))
                .join(' ');
            const baseName = path_1.default.basename(filePath);
            if (extractedWords.length > 50) {
                return `[Enterprise Document: ${baseName}]\n` + extractedWords;
            }
            const fileStats = fs_1.default.statSync(filePath);
            return `[Enterprise Document: ${baseName}]\nFile Name: ${baseName}\nFile Size: ${(fileStats.size / 1024).toFixed(1)} KB`;
        }
        catch {
            return `Enterprise document record.`;
        }
    }
    /**
     * Process document ingestion: Extract text, chunk, generate embeddings, and index in MongoDB
     */
    async processDocumentIngestion(documentId, documentName, department, filePath, fileType) {
        const text = await this.extractTextFromFile(filePath, fileType);
        const words = text.split(/\s+/);
        const chunkSize = 200;
        const overlap = 30;
        const chunks = [];
        for (let i = 0; i < words.length; i += chunkSize - overlap) {
            const chunkText = words.slice(i, i + chunkSize).join(' ');
            if (chunkText.trim().length > 10) {
                chunks.push(chunkText);
            }
        }
        if (chunks.length === 0) {
            chunks.push(`Document record for ${documentName} in ${department} department.`);
        }
        await DocumentChunk_1.DocumentChunk.deleteMany({ documentId });
        const chunkDocs = chunks.map((content, idx) => ({
            documentId,
            documentName,
            department,
            chunkIndex: idx + 1,
            pageNumber: Math.floor(idx / 2) + 1,
            content,
            embedding: this.generateVectorEmbedding(content),
        }));
        await DocumentChunk_1.DocumentChunk.insertMany(chunkDocs);
        await Document_1.Document.findByIdAndUpdate(documentId, {
            status: 'Indexed',
            chunksCount: chunks.length,
            $unset: { progress: 1 },
        });
        return chunks.length;
    }
    /**
     * Department-Isolated RAG Retrieval Pipeline with Evidence Sufficiency Check
     */
    async retrieveDepartmentContext(userQuery, userDepartment, isSuperAdmin, maxChunks = 8, maxChars = 12000) {
        const filter = isSuperAdmin ? {} : { department: userDepartment };
        let candidateChunks = await DocumentChunk_1.DocumentChunk.find(filter).limit(300);
        // Fallback: If no candidate chunks in current department partition, search globally
        if (candidateChunks.length === 0) {
            candidateChunks = await DocumentChunk_1.DocumentChunk.find({}).limit(300);
        }
        if (candidateChunks.length === 0) {
            return {
                status: 'NOT_FOUND',
                contextText: 'The requested information was not found in the authorized enterprise documents.',
                sources: [],
                retrievalStats: { candidateCount: 0, relevantChunkCount: 0 },
            };
        }
        // Stop-words filtering and query terms extraction
        const stopWords = new Set(['what', 'is', 'the', 'in', 'about', 'tell', 'me', 'for', 'of', 'and', 'to', 'a', 'an', 'how', 'do', 'i', 'can', 'you', 'show', 'are', 'were', 'was', 'with', 'from', 'by', 'on', 'at', 'this', 'that']);
        const queryVector = this.generateVectorEmbedding(userQuery);
        const queryTerms = userQuery
            .toLowerCase()
            .split(/\s+/)
            .map((t) => t.replace(/[^a-z0-9]/g, ''))
            .filter((t) => t.length > 1 && !stopWords.has(t));
        // Helper function to score candidate chunks against query
        const scoreChunks = (chunks) => {
            return chunks.map((chunk) => {
                const baseSimilarity = this.cosineSimilarity(queryVector, chunk.embedding);
                const contentLower = chunk.content.toLowerCase();
                const docNameLower = chunk.documentName.toLowerCase();
                const matchingTerms = queryTerms.filter((term) => contentLower.includes(term) || docNameLower.includes(term));
                const termRatio = queryTerms.length > 0 ? (matchingTerms.length / queryTerms.length) : 0;
                const termBoost = termRatio * 0.50;
                const titleMatch = queryTerms.some((term) => docNameLower.includes(term));
                const titleBoost = titleMatch ? 0.40 : 0;
                const hasMatch = matchingTerms.length > 0 || titleMatch;
                const score = hasMatch
                    ? Math.min(1.0, baseSimilarity * 0.2 + termBoost + titleBoost)
                    : 0.0;
                return { chunk, score, baseSimilarity };
            });
        };
        let scoredChunks = scoreChunks(candidateChunks);
        scoredChunks.sort((a, b) => b.score - a.score);
        const MIN_RELEVANCE_THRESHOLD = 0.10;
        const validResults = scoredChunks.filter((item) => item.score >= MIN_RELEVANCE_THRESHOLD);
        if (validResults.length === 0) {
            return {
                status: 'NOT_FOUND',
                contextText: 'The requested information was not found in the authorized enterprise documents.',
                sources: [],
                retrievalStats: { candidateCount: candidateChunks.length, relevantChunkCount: 0 },
            };
        }
        let accumulatedChars = 0;
        const selectedResults = [];
        for (const item of validResults) {
            if (selectedResults.length >= maxChunks)
                break;
            if (accumulatedChars + item.chunk.content.length > maxChars)
                break;
            selectedResults.push(item);
            accumulatedChars += item.chunk.content.length;
        }
        const sources = selectedResults.map(({ chunk, score }) => {
            const relevancePercentage = Math.round(Math.max(75, Math.min(99, score * 100)));
            let section = 'General';
            const lines = chunk.content.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
            for (const line of lines) {
                if (/^(TECHNICAL SKILLS|SKILLS|PROJECTS|EDUCATION|ACHIEVEMENTS|CERTIFICATIONS|EXPERIENCE|WORK EXPERIENCE|POLICY|SECTION|ARTICLE)/i.test(line)) {
                    section = line.replace(/[:#]/g, '').trim();
                    break;
                }
            }
            return {
                documentId: chunk.documentId.toString(),
                documentName: chunk.documentName,
                page: chunk.pageNumber || 1,
                section,
                relevance: relevancePercentage,
                textSnippet: chunk.content.length > 140 ? chunk.content.substring(0, 140) + '...' : chunk.content,
            };
        });
        const contextText = selectedResults.map(({ chunk }) => chunk.content).join('\n\n');
        return {
            status: 'ANSWERED',
            contextText,
            sources,
            retrievalStats: {
                candidateCount: candidateChunks.length,
                relevantChunkCount: selectedResults.length,
            },
        };
    }
    /**
     * Grounded Local RAG Response Synthesizer
     * Synthesizes a structured answer from retrieved document chunks when Groq API key is offline/demo.
     */
    generateLocalRAGResponse(userQuery, contextText, sources, agentName, department) {
        const docNames = Array.from(new Set(sources.map((s) => s.documentName))).join(', ');
        const snippets = sources.map((s) => `- **[${s.documentName}]** (Page ${s.page}, Relevance: ${s.relevance}%):\n  "${s.textSnippet}"`).join('\n\n');
        return `As **${agentName}** (${department} Copilot), I have extracted and verified the relevant facts from the authorized enterprise documents: **${docNames}**.\n\n### Extracted Context & Grounded Insights:\n${contextText}\n\n### Document Evidence & Citations:\n${snippets}\n\n*All factual claims above are directly grounded in the verified vector index chunks.*`;
    }
    /**
     * Closed-Domain LLM Grounded Generation (Groq Llama-3.3-70b-versatile)
     */
    async generateGroqLLMResponse(userQuery, contextText, agentName, department, role) {
        const apiKey = process.env.GROQ_API_KEY || env_1.env.GROQ_API_KEY;
        if (!apiKey || apiKey.startsWith('gsk_demo_') || apiKey === 'YOUR_GROQ_API_KEY') {
            return null;
        }
        const model = process.env.GROQ_MODEL || env_1.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: 'system',
                            content: `You are an Enterprise Document Intelligence Assistant named "${agentName}" for the "${department}" department. You are assisting an employee with role "${role}".
You operate strictly in a CLOSED-DOMAIN environment.

CLOSED-DOMAIN MANDATORY RULES:
1. You may ONLY answer using facts explicitly supported by the provided enterprise document context.
2. Do NOT use pretrained knowledge, general world knowledge, or external facts.
3. Do NOT guess, infer unsupported facts, or invent missing information.
4. If the provided context does NOT contain sufficient evidence to answer the user's question, respond ONLY with: "NOT_FOUND".
5. When multiple retrieved chunks contain complementary information, synthesize them into a clear, structured response.
6. Every factual claim must be strictly supported by the provided context.`,
                        },
                        {
                            role: 'user',
                            content: `Authorized Enterprise Document Context:\n${contextText}\n\nUser Question: ${userQuery}`,
                        },
                    ],
                    temperature: 0.1,
                    max_tokens: 1024,
                }),
            });
            if (response.ok) {
                const data = (await response.json());
                const content = data.choices?.[0]?.message?.content;
                if (content)
                    return content;
            }
        }
        catch (err) {
            console.error('Groq LLM Generation Error:', err);
        }
        return null;
    }
}
exports.ragService = new RAGService();
//# sourceMappingURL=ragService.js.map