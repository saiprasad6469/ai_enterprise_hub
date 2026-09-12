import mongoose, { Document as MongoDoc } from 'mongoose';
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
export declare const Department: mongoose.Model<IDepartment, {}, {}, {}, mongoose.Document<unknown, {}, IDepartment, {}, {}> & IDepartment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Department.d.ts.map