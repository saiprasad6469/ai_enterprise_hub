import mongoose, { Document as MongoDoc } from 'mongoose';
export interface INotification extends MongoDoc {
    title: string;
    description: string;
    category: 'System' | 'Security' | 'Billing' | 'Workflow';
    read: boolean;
    recipient: mongoose.Types.ObjectId | null;
    createdAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map