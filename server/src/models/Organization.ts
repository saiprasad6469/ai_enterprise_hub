import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface IOrganization extends MongoDoc {
  name: string;
  slug: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  plan: 'Free' | 'Pro' | 'Enterprise';
  settings: {
    maxUsers: number;
    maxStorage: number;
    aiModelsEnabled: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    plan: { type: String, enum: ['Free', 'Pro', 'Enterprise'], default: 'Free' },
    settings: {
      maxUsers: { type: Number, default: 10 },
      maxStorage: { type: Number, default: 10737418240 }, // 10GB
      aiModelsEnabled: [{ type: String }],
    },
  },
  { timestamps: true }
);

organizationSchema.index({ slug: 1 });

export const Organization = mongoose.model<IOrganization>('Organization', organizationSchema);
