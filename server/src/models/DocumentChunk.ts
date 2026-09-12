import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

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

const documentChunkSchema = new Schema<IDocumentChunk>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

// Compound index for department-isolated RAG search
documentChunkSchema.index({ department: 1, documentId: 1 });

export const DocumentChunk = mongoose.model<IDocumentChunk>('DocumentChunk', documentChunkSchema);
