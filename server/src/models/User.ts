import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface IUser extends MongoDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  employeeId?: string;
  designation?: string;
  passwordHash: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'SuperAdmin' | 'Admin' | 'Employee';
  department: string;
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
    employeeId: { type: String, trim: true, index: true },
    designation: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'SuperAdmin', 'Admin', 'Employee'], 
      default: 'Employee' 
    },
    department: {
      type: String,
      default: 'Engineering',
    },
    status: { type: String, enum: ['Active', 'Inactive', 'Invited'], default: 'Active' },
    avatar: { type: String },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.index({ organization: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
