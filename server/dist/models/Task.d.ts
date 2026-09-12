import mongoose, { Document as MongoDoc } from 'mongoose';
export interface ITask extends MongoDoc {
    title: string;
    department: string;
    assignedTo: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Pending' | 'In Progress' | 'Completed';
    dueDate: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Task: mongoose.Model<ITask, {}, {}, {}, mongoose.Document<unknown, {}, ITask, {}, {}> & ITask & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Task.d.ts.map