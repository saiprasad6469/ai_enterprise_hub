import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface IUser extends MongoDoc {
  name: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'Employee';
  department: 'Engineering' | 'Legal' | 'HR' | 'Marketing' | 'Operations' | 'Finance';
  status: 'Active' | 'Inactive' | 'Invited';
  avatar?: string;
  organization?: mongoose.Types.ObjectId;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Employee'], default: 'Employee' },
    department: {
      type: String,
      enum: ['Engineering', 'Legal', 'HR', 'Marketing', 'Operations', 'Finance'],
      default: 'Engineering',
    },
    status: { type: String, enum: ['Active', 'Inactive', 'Invited'], default: 'Active' },
    avatar: { type: String },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ organization: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
