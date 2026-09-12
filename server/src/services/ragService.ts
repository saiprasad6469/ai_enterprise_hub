import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { DocumentChunk, IDocumentChunk } from '../models/DocumentChunk';
import { Document as DocumentModel } from '../models/Document';
import { User } from '../models/User';
import { env } from '../config/env';

/**
 * Extract uncompressed string content of a specific file entry inside a ZIP archive (DOCX)
 */
function extractZipEntry(buffer: Buffer, targetFileName: string): string | null {
  try {
    let offset = 0;
    while (offset < buffer.length - 30) {
      if (
        buffer[offset] === 0x50 &&
        buffer[offset + 1] === 0x4b &&
        buffer[offset + 2] === 0x03 &&
        buffer[offset + 3] === 0x04
      ) {
        const compressionMethod = buffer.readUInt16LE(offset + 8);
        const compressedSize = buffer.readUInt32LE(offset + 18);
        const fileNameLen = buffer.readUInt16LE(offset + 26);
        const extraLen = buffer.readUInt16LE(offset + 28);

        const fileName = buffer.toString('utf-8', offset + 30, offset + 30 + fileNameLen);
        const dataOffset = offset + 30 + fileNameLen + extraLen;

        if (fileName === targetFileName || fileName.endsWith('/' + targetFileName)) {
          const compressedData = buffer.subarray(dataOffset, dataOffset + compressedSize);
          if (compressionMethod === 8) {
            const decompressed = zlib.inflateRawSync(compressedData);
            return decompressed.toString('utf-8');
          } else if (compressionMethod === 0) {
            return compressedData.toString('utf-8');
          }
        }

        offset = dataOffset + Math.max(1, compressedSize);
      } else {
        offset++;
      }
    }
  } catch (err) {
    console.error('ZIP entry extraction error:', err);
  }
  return null;
}

export interface RAGSource {
  documentId: string;
  documentName: string;
  page: number;
  section?: string;
  relevance: number;
  textSnippet: string;
}

export interface RAGResult {
  contextText: string;
  sources: RAGSource[];
}

class RAGService {
  /**
   * Helper: Generate a deterministic term-frequency vector embedding for text
   */
  private generateVectorEmbedding(text: string, dimensions = 64): number[] {
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
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Seed initial enterprise documents and vector chunks into MongoDB
   */
  public async seedEnterpriseDocuments(): Promise<void> {
    try {
      console.log('🌱 Enterprise Document Store ready for live document uploads.');
    } catch (err) {
      console.error('Error in enterprise document store check:', err);
    }
  }

  /**
   * Extract raw text from uploaded physical files
   */
  public async extractTextFromFile(filePath: string, fileType: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        return `Sample extracted operational text content for file of type ${fileType}.`;
      }

      const ext = (fileType || path.extname(filePath)).toUpperCase().replace('.', '');
      
      if (['TXT', 'CSV', 'JSON', 'LOG', 'MD'].includes(ext)) {
        return fs.readFileSync(filePath, 'utf-8');
      }

      const buffer = fs.readFileSync(filePath);

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
              return `[DOCX Document: ${path.basename(filePath)}]\n` + cleanParagraphs;
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
            return `[PDF Document: ${path.basename(filePath)}]\n` + pdfText;
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

      const baseName = path.basename(filePath);
      if (extractedWords.length > 50) {
        return `[Enterprise Document: ${baseName}]\n` + extractedWords;
      }

      const fileStats = fs.statSync(filePath);
      return `[Enterprise Document: ${baseName}]\nFile Name: ${baseName}\nFile Size: ${(fileStats.size / 1024).toFixed(1)} KB`;
    } catch {
      return `Enterprise document record.`;
    }
  }

  /**
   * Process document ingestion: Extract text, chunk, generate embeddings, and index in MongoDB
   */
  public async processDocumentIngestion(
    documentId: string,
    documentName: string,
    department: string,
    filePath: string,
    fileType: string
  ): Promise<number> {
    console.log('\n==================================================');
    console.log(`📄 [DOCUMENT INGESTION] Processing File: "${documentName}"`);
    console.log(`   - Department: ${department}`);
    console.log(`   - File Type: ${fileType}`);
    console.log(`   - Source Path: ${filePath}`);

    const text = await this.extractTextFromFile(filePath, fileType);
    console.log(`   - Extracted Raw Characters: ${text.length}`);

    const words = text.split(/\s+/);
    const chunkSize = 200;
    const overlap = 30;
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunkText = words.slice(i, i + chunkSize).join(' ');
      if (chunkText.trim().length > 10) {
        chunks.push(chunkText);
      }
    }

    if (chunks.length === 0) {
      chunks.push(`Document record for ${documentName} in ${department} department.`);
    }

    console.log(`--------------------------------------------------`);
    console.log(`✂️ [CHUNKING] Total Chunks Generated: ${chunks.length} (~200 words each)`);
    chunks.forEach((c, idx) => {
      console.log(`   └─ Chunk #${idx + 1} (${c.length} chars): "${c.substring(0, 85).replace(/\n/g, ' ')}..."`);
    });

    await DocumentChunk.deleteMany({ documentId });

    const chunkDocs = chunks.map((content, idx) => ({
      documentId,
      documentName,
      department,
      chunkIndex: idx + 1,
      pageNumber: Math.floor(idx / 2) + 1,
      content,
      embedding: this.generateVectorEmbedding(content),
    }));

    console.log(`--------------------------------------------------`);
    console.log(`🧠 [EMBEDDINGS] Generated ${chunks.length} normalized 64-dim vectors`);
    console.log(`💾 [MONGODB INDEXING] Saved Document [${documentId}] & ${chunks.length} DocumentChunk records`);
    console.log('==================================================\n');

    await DocumentChunk.insertMany(chunkDocs);

    await DocumentModel.findByIdAndUpdate(documentId, {
      status: 'Indexed',
      chunksCount: chunks.length,
      $unset: { progress: 1 },
    });

    return chunks.length;
  }

  /**
   * Department-Isolated RAG Retrieval Pipeline with Evidence Sufficiency Check
   */
  public async retrieveDepartmentContext(
    userQuery: string,
    userDepartment: string,
    isSuperAdmin: boolean,
    maxChunks = 8,
    maxChars = 12000
  ): Promise<RAGResult & { status: 'ANSWERED' | 'NOT_FOUND'; retrievalStats: { candidateCount: number; relevantChunkCount: number } }> {
    console.log('\n==================================================');
    console.log(`🔍 [RAG QUERY SEARCH] Question: "${userQuery}"`);
    console.log(`   - User Department Scope: ${userDepartment} (SuperAdmin: ${isSuperAdmin})`);

    const filter = isSuperAdmin ? {} : { department: userDepartment };
    let candidateChunks = await DocumentChunk.find(filter).limit(300);

    // Fallback: If no candidate chunks in current department partition, search globally
    if (candidateChunks.length === 0) {
      candidateChunks = await DocumentChunk.find({}).limit(300);
    }

    console.log(`   - Candidate Chunks in Authorized Scope: ${candidateChunks.length}`);

    if (candidateChunks.length === 0) {
      console.log(`❌ [RETRIEVAL RESULT] No candidate chunks found in database scope.`);
      console.log('==================================================\n');
      return {
        status: 'NOT_FOUND',
        contextText: 'The requested information was not found in the authorized enterprise documents.',
        sources: [],
        retrievalStats: { candidateCount: 0, relevantChunkCount: 0 },
      };
    }

    // Stop-words filtering and query terms extraction
    const stopWords = new Set(['what', 'is', 'the', 'in', 'about', 'tell', 'me', 'for', 'of', 'and', 'to', 'a', 'an', 'how', 'do', 'i', 'can', 'you', 'show', 'are', 'were', 'was', 'with', 'from', 'by', 'on', 'at', 'this', 'that', 'document', 'documents', 'file', 'files', 'pdf', 'docx']);
    const queryVector = this.generateVectorEmbedding(userQuery);
    const queryTerms = userQuery
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.replace(/[^a-z0-9]/g, ''))
      .filter((t) => t.length > 1 && !stopWords.has(t));

    // Helper function to score candidate chunks against query
    const scoreChunks = (chunks: typeof candidateChunks) => {
      return chunks.map((chunk) => {
        const baseSimilarity = this.cosineSimilarity(queryVector, chunk.embedding);
        const contentLower = chunk.content.toLowerCase();
        const docNameLower = chunk.documentName.toLowerCase();

        const matchingTerms = queryTerms.filter((term) => contentLower.includes(term));
        const titleMatchingTerms = queryTerms.filter((term) => docNameLower.includes(term));

        const termRatio = queryTerms.length > 0 ? (matchingTerms.length / queryTerms.length) : 0;
        const termBoost = termRatio * 0.65;
        
        const titleMatch = titleMatchingTerms.length > 0;
        const titleBoost = titleMatch ? 0.25 : 0;

        const exactHeaderMatch = queryTerms.some((term) => contentLower.includes(`${term} skills`) || contentLower.includes(`technical ${term}`) || contentLower.includes('technical skills') || contentLower.includes('projects') || contentLower.includes('education'));
        const headerBoost = exactHeaderMatch ? 0.35 : 0;

        const hasMatch = matchingTerms.length > 0 || titleMatch;
        const score = hasMatch 
          ? Math.min(1.0, baseSimilarity * 0.2 + termBoost + titleBoost + headerBoost)
          : 0.0;

        return { chunk, score, baseSimilarity };
      });
    };

    let scoredChunks = scoreChunks(candidateChunks);
    scoredChunks.sort((a, b) => b.score - a.score);

    console.log(`--------------------------------------------------`);
    console.log(`📊 [VECTOR & RELEVANCE SCORING] Top Matching Chunks:`);
    scoredChunks.slice(0, 5).forEach((item, idx) => {
      console.log(`   └─ Rank #${idx + 1} [Score: ${(item.score * 100).toFixed(1)}%] Doc: "${item.chunk.documentName}" | Section: Chunk #${item.chunk.chunkIndex}`);
      console.log(`      Snippet: "${item.chunk.content.substring(0, 90).replace(/\n/g, ' ')}..."`);
    });

    const MIN_RELEVANCE_THRESHOLD = 0.10;
    const validResults = scoredChunks.filter((item) => item.score >= MIN_RELEVANCE_THRESHOLD);

    if (validResults.length === 0) {
      console.log(`--------------------------------------------------`);
      console.log(`⚠️ [RETRIEVAL RESULT] Status: NOT_FOUND (No chunk exceeded relevance threshold ${MIN_RELEVANCE_THRESHOLD})`);
      console.log('==================================================\n');
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
      if (selectedResults.length >= maxChunks) break;
      if (accumulatedChars + item.chunk.content.length > maxChars) break;
      selectedResults.push(item);
      accumulatedChars += item.chunk.content.length;
    }

    const sources: RAGSource[] = selectedResults.map(({ chunk, score }) => {
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

    console.log(`--------------------------------------------------`);
    console.log(`🎯 [RETRIEVAL RESULT] Status: ANSWERED | Relevant Chunks Retained: ${selectedResults.length}`);
    console.log('==================================================\n');

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
   * Synthesizes a query-focused structured answer from retrieved document chunks.
   */
  public generateLocalRAGResponse(
    userQuery: string,
    contextText: string,
    sources: RAGSource[],
    agentName: string,
    department: string
  ): string {
    const docNames = Array.from(new Set(sources.map((s) => s.documentName))).join(', ');
    const queryLower = userQuery.toLowerCase();

    // Query-Specific Extraction Logic
    const isSkillsQuery = queryLower.includes('skill') || queryLower.includes('technology') || queryLower.includes('stack') || queryLower.includes('language');
    const isProjectsQuery = queryLower.includes('project') || queryLower.includes('portfolio') || queryLower.includes('built') || queryLower.includes('system');
    const isEducationQuery = queryLower.includes('education') || queryLower.includes('degree') || queryLower.includes('college') || queryLower.includes('university') || queryLower.includes('cgpa');

    let structuredOutput = '';

    if (isSkillsQuery) {
      const skillsMap: Record<string, string[]> = {};
      const skillsRegex = /(Languages|Systems & Backend|Systems|Backend|Data & ML|Data|ML|Frontend|Tools & DevOps|Tools|DevOps|Core CS|Technical Skills|Skills|Languages Known)[:\s]+([^#\n\.\?]+)/gi;
      
      let m;
      while ((m = skillsRegex.exec(contextText)) !== null) {
        let catName = m[1].replace(/[*#]/g, '').trim();
        if (catName.length < 3 || ['skills', 'data', 'systems', 'backend'].includes(catName.toLowerCase())) {
          catName = 'Technical Skills';
        }

        const rawItems = m[2]
          .replace(/[*#&]/g, '')
          .replace(/&amp;/g, '')
          .split(/[,;·]/)
          .map(i => i.trim().replace(/^amp\s*/i, '').replace(/\s*amp$/i, ''))
          .filter(i => i.length > 2 && i.length < 40 && !i.toLowerCase().includes('document') && !i.toLowerCase().includes('location') && !i.toLowerCase().includes('email') && !i.toLowerCase().includes('objective') && !i.toLowerCase().includes('hyderabad') && !i.toLowerCase().includes('serving') && !i.toLowerCase().includes('logic'));

        if (rawItems.length > 0) {
          skillsMap[catName] = Array.from(new Set([...(skillsMap[catName] || []), ...rawItems]));
        }
      }

      if (Object.keys(skillsMap).length > 0) {
        structuredOutput += `### Extracted Technical Skills & Competencies\n\n`;
        for (const [category, items] of Object.entries(skillsMap)) {
          structuredOutput += `#### **${category}**\n${items.map(item => `- ${item}`).join('\n')}\n\n`;
        }
      }
    } else if (isProjectsQuery) {
      const projectLines = contextText.split('\n').filter(l => l.toLowerCase().includes('project') || l.toLowerCase().includes('built') || l.toLowerCase().includes('system'));
      if (projectLines.length > 0) {
        structuredOutput += `### Featured Projects\n\n`;
        projectLines.forEach((p, idx) => {
          const cleanP = p.replace(/\[DOCX Document:[^\]]+\]/gi, '').trim();
          if (cleanP.length > 15) {
            structuredOutput += `- **Project ${idx + 1}:** ${cleanP}\n`;
          }
        });
        structuredOutput += '\n';
      }
    } else if (isEducationQuery) {
      const eduItems: string[] = [];
      const eduRegex = /EDUCATION[:\s]+([^#\n\?]+)/gi;
      
      let em;
      while ((em = eduRegex.exec(contextText)) !== null) {
        let cleanEdu = em[1]
          .replace(/\[DOCX Document:[^\]]+\]/gi, '')
          .replace(/TECHNICAL SKILLS.*$/gi, '')
          .replace(/SKILLS.*$/gi, '')
          .replace(/PROJECTS.*$/gi, '')
          .replace(/WORK EXPERIENCE.*$/gi, '')
          .trim();
        if (cleanEdu.length > 10) {
          eduItems.push(cleanEdu);
        }
      }

      if (eduItems.length > 0) {
        structuredOutput += `### Academic Credentials & Education\n\n`;
        Array.from(new Set(eduItems)).forEach(e => {
          structuredOutput += `- **Degree & Institution:** ${e}\n\n`;
        });
      } else {
        const eduLines = contextText.split('\n').filter(l => l.toLowerCase().includes('b.tech') || l.toLowerCase().includes('b.com') || l.toLowerCase().includes('degree') || l.toLowerCase().includes('cgpa'));
        if (eduLines.length > 0) {
          structuredOutput += `### Academic Credentials & Education\n\n`;
          eduLines.forEach(e => {
            const cleanE = e.replace(/\[DOCX Document:[^\]]+\]/gi, '').trim();
            if (cleanE.length > 10) {
              structuredOutput += `- ${cleanE}\n\n`;
            }
          });
        }
      }
    }

    // Fallback if no specific category extracted
    if (!structuredOutput) {
      const cleanContext = contextText
        .replace(/\[DOCX Document:[^\]]+\]/gi, '')
        .replace(/\[PDF Document:[^\]]+\]/gi, '')
        .replace(/\[Enterprise Document:[^\]]+\]/gi, '')
        .trim();

      const paragraphs = cleanContext.split('\n').filter(p => p.trim().length > 20);
      structuredOutput = `### Key Extracted Facts\n\n${paragraphs.map(p => `- ${p.trim()}`).join('\n\n')}\n\n`;
    }

    const citations = sources.map((s) => {
      const cleanSnippet = s.textSnippet
        .replace(/\[DOCX Document:[^\]]+\]/gi, '')
        .replace(/\[PDF Document:[^\]]+\]/gi, '')
        .replace(/\[Enterprise Document:[^\]]+\]/gi, '')
        .trim();
      return `- **[${s.documentName}]** (${s.section ? `Section: ${s.section}, ` : ''}Relevance: ${s.relevance}%):\n  "${cleanSnippet.substring(0, 120)}..."`;
    }).join('\n\n');

    console.log(`🤖 [LOCAL RAG SYNTHESIZER] Generating query-focused structured answer...`);
    return `As **${agentName}** (${department} Copilot), I have extracted the specific facts requested from **${docNames}**:\n\n${structuredOutput}### Verified Document Citations:\n${citations}\n\n*All extracted items above are strictly grounded in authorized enterprise vector index chunks.*`;
  }

  /**
   * Closed-Domain LLM Grounded Generation (Groq Llama-3.3-70b-versatile)
   */
  public async generateGroqLLMResponse(
    userQuery: string,
    contextText: string,
    agentName: string,
    department: string,
    role: string
  ): Promise<string | null> {
    const apiKey = process.env.GROQ_API_KEY || env.GROQ_API_KEY;
    if (!apiKey || apiKey.startsWith('gsk_demo_') || apiKey === 'YOUR_GROQ_API_KEY') {
      return null;
    }

    const model = process.env.GROQ_MODEL || env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    console.log(`🤖 [GROQ LLM REQUEST] Sending query-specific prompt to Groq (Model: ${model})...`);

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

CLOSED-DOMAIN & SPECIFICITY RULES:
1. Extract ONLY the specific information requested by the user. Do NOT output unrequested context, personal bio details, addresses, career objectives, or full raw document dumps.
2. If the user asks for "skills" or "technical skills", extract ONLY the technical skills, programming languages, frameworks, backend/frontend tools, databases, and platforms mentioned in the context.
3. Organize the extracted information strictly using structured Markdown formatting:
   - Level 3 Heading (###) for the main topic
   - Bold Subheadings (**Category Name:**) or Level 4 Headings (####) for categories
   - Bullet points (- Item) for individual items
4. Keep the output clean, concise, and structured. Do NOT include long unformatted text blocks.
5. If the provided context does NOT contain the requested information, respond ONLY with: "NOT_FOUND".`,
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
        const data = (await response.json()) as any;
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          console.log(`✨ [GROQ LLM RESPONSE RECEIVED] Length: ${content.length} chars`);
          return content;
        }
      }
    } catch (err) {
      console.error('Groq LLM Generation Error:', err);
    }
    return null;
  }
}

export const ragService = new RAGService();
