import mongoose, { Schema, Document as MongoDoc } from 'mongoose';
import crypto from 'crypto';

export interface IApiKey extends MongoDoc {
  name: string;
  keyHash: string;
  keyPrefix: string;
  scopes: string[];
  status: 'Active' | 'Revoked';
  userId: mongoose.Types.ObjectId;
  organization?: mongoose.Types.ObjectId;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>(
  {
    name: { type: String, required: true, trim: true },
    keyHash: { type: String, required: true },
    keyPrefix: { type: String, required: true },
    scopes: [{ type: String }],
    status: { type: String, enum: ['Active', 'Revoked'], default: 'Active' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
    lastUsed: { type: Date },
  },
  { timestamps: true }
);

apiKeySchema.index({ userId: 1 });
apiKeySchema.index({ keyPrefix: 1 });

// Static helper to generate a new API key
apiKeySchema.statics.generateKey = function () {
  const raw = `aeh_live_${crypto.randomBytes(24).toString('hex')}`;
  const prefix = raw.substring(0, 13);
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, prefix, hash };
};

export const ApiKey = mongoose.model<IApiKey>('ApiKey', apiKeySchema);
