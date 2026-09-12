import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface IAgent {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  department: string;
  model: string;
  status: 'Active' | 'Maintenance' | 'Disabled';
  promptTemplate?: string;
  lastUsed?: Date;
  organization?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const agentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    department: { type: String, required: true },
    model: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Maintenance', 'Disabled'], default: 'Active' },
    promptTemplate: { type: String },
    lastUsed: { type: Date },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

agentSchema.index({ organization: 1 });

export const Agent = mongoose.model<IAgent>('Agent', agentSchema);
