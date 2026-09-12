import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface IDocument extends MongoDoc {
  name: string;
  originalName: string;
  type: string;
  size: number;
  path: string;
  uploadedBy: mongoose.Types.ObjectId;
  department?: string;
  status: 'Uploading' | 'Processing' | 'Indexing' | 'Indexed' | 'Failed' | 'Processed';
  progress?: number;
  chunksCount?: number;
  organization?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: String },
    status: { 
      type: String, 
      enum: ['Uploading', 'Processing', 'Indexing', 'Indexed', 'Failed', 'Processed'], 
      default: 'Processing' 
    },
    progress: { type: Number, default: 0 },
    chunksCount: { type: Number, default: 0 },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  },
  { timestamps: true }
);

documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ organization: 1 });
documentSchema.index({ department: 1 });

export const Document = mongoose.model<IDocument>('Document', documentSchema);
