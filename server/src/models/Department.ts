import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface IDepartment extends MongoDoc {
  name: string;
  code: string;
  head: string;
  budget: string;
  membersCount: number;
  activeProjects: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    head: { type: String, required: true },
    budget: { type: String, default: '$100,000' },
    membersCount: { type: Number, default: 0 },
    activeProjects: { type: Number, default: 0 },
    description: { type: String },
  },
  { timestamps: true }
);

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
