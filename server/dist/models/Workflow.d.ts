import mongoose, { Document as MongoDoc } from 'mongoose';
export interface IWorkflowRun {
    runAt: Date;
    duration: string;
    status: 'Completed' | 'Failed' | 'Running';
    triggerBy: string;
}
export interface IWorkflow extends MongoDoc {
    name: string;
    description: string;
    status: 'Running' | 'Paused' | 'Failed' | 'Completed';
    steps: string[];
    runs: IWorkflowRun[];
    lastRun?: Date;
    organization?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Workflow: mongoose.Model<IWorkflow, {}, {}, {}, mongoose.Document<unknown, {}, IWorkflow, {}, {}> & IWorkflow & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Workflow.d.ts.map