import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface IWorkflowRun {
  runAt: Date;
  duration: string;
  status: 'Completed' | 'Failed' | 'Running';
  triggerBy: string;
}

export interface IWorkflow extends MongoDoc {
  name: string;
  description: string;
  status: 'Running' | 'Paused' | 'Failed' | 'Completed';
  steps: string[];
  runs: IWorkflowRun[];
  lastRun?: Date;
  organization?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const workflowRunSchema = new Schema<IWorkflowRun>(
  {
    runAt: { type: Date, default: Date.now },
    duration: { type: String },
    status: { type: String, enum: ['Completed', 'Failed', 'Running'], default: 'Running' },
    triggerBy: { type: String },
  },
  { _id: true }
);

const workflowSchema = new Schema<IWorkflow>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Running', 'Paused', 'Failed', 'Completed'], default: 'Completed' },
    steps: [{ type: String }],
    runs: [workflowRunSchema],
    lastRun: { type: Date },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

workflowSchema.index({ organization: 1 });

export const Workflow = mongoose.model<IWorkflow>('Workflow', workflowSchema);
