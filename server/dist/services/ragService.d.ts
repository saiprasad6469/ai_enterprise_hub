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
declare class RAGService {
    /**
     * Helper: Generate a deterministic term-frequency vector embedding for text
     */
    private generateVectorEmbedding;
    /**
     * Helper: Compute cosine similarity between two vector embeddings
     */
    private cosineSimilarity;
    /**
     * Seed initial enterprise documents and vector chunks into MongoDB
     */
    seedEnterpriseDocuments(): Promise<void>;
    /**
     * Extract raw text from uploaded physical files
     */
    extractTextFromFile(filePath: string, fileType: string): Promise<string>;
    /**
     * Process document ingestion: Extract text, chunk, generate embeddings, and index in MongoDB
     */
    processDocumentIngestion(documentId: string, documentName: string, department: string, filePath: string, fileType: string): Promise<number>;
    /**
     * Department-Isolated RAG Retrieval Pipeline with Evidence Sufficiency Check
     */
    retrieveDepartmentContext(userQuery: string, userDepartment: string, isSuperAdmin: boolean, maxChunks?: number, maxChars?: number): Promise<RAGResult & {
        status: 'ANSWERED' | 'NOT_FOUND';
        retrievalStats: {
            candidateCount: number;
            relevantChunkCount: number;
        };
    }>;
    /**
     * Grounded Local RAG Response Synthesizer
     * Synthesizes a structured answer from retrieved document chunks when Groq API key is offline/demo.
     */
    generateLocalRAGResponse(userQuery: string, contextText: string, sources: RAGSource[], agentName: string, department: string): string;
    /**
     * Closed-Domain LLM Grounded Generation (Groq Llama-3.3-70b-versatile)
     */
    generateGroqLLMResponse(userQuery: string, contextText: string, agentName: string, department: string, role: string): Promise<string | null>;
}
export declare const ragService: RAGService;
export {};
//# sourceMappingURL=ragService.d.ts.map