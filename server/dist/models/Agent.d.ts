import mongoose from 'mongoose';
export interface IAgent {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    department: string;
    model: string;
    status: 'Active' | 'Maintenance' | 'Disabled';
    promptTemplate?: string;
    lastUsed?: Date;
    organization?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Agent: mongoose.Model<IAgent, {}, {}, {}, mongoose.Document<unknown, {}, IAgent, {}, {}> & IAgent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Agent.d.ts.map