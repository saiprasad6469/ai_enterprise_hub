import mongoose, { Document as MongooseDocument } from 'mongoose';
export interface IDocumentChunk extends MongooseDocument {
    documentId: mongoose.Types.ObjectId;
    documentName: string;
    department: string;
    chunkIndex: number;
    pageNumber: number;
    section?: string;
    content: string;
    embedding: number[];
    createdAt: Date;
}
export declare const DocumentChunk: mongoose.Model<IDocumentChunk, {}, {}, {}, mongoose.Document<unknown, {}, IDocumentChunk, {}, {}> & IDocumentChunk & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=DocumentChunk.d.ts.map