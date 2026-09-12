import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface INotification extends MongoDoc {
  title: string;
  description: string;
  category: 'System' | 'Security' | 'Billing' | 'Workflow';
  read: boolean;
  recipient: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['System', 'Security', 'Billing', 'Workflow'], default: 'System' },
    read: { type: Boolean, default: false },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
