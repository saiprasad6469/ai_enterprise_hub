import mongoose, { Document as MongoDoc } from 'mongoose';
export interface IAuditLog extends MongoDoc {
    user?: mongoose.Types.ObjectId;
    action: string;
    target: string;
    ipAddress: string;
    status: 'Success' | 'Failed';
    createdAt: Date;
}
export declare const AuditLog: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, {}> & IAuditLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditLog.d.ts.map