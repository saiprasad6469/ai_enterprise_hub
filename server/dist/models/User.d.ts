import mongoose, { Document as MongoDoc } from 'mongoose';
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
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map