import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface IAuditLog extends MongoDoc {
  user: mongoose.Types.ObjectId;
  action: string;
  target: string;
  ipAddress: string;
  status: 'Success' | 'Failed';
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    target: { type: String, required: true },
    ipAddress: { type: String, default: 'unknown' },
    status: { type: String, enum: ['Success', 'Failed'], default: 'Success' },
  },
  { timestamps: true }
);

auditLogSchema.index({ user: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
