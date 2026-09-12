import mongoose, { Document as MongoDoc } from 'mongoose';
export interface IApiKey extends MongoDoc {
    name: string;
    keyHash: string;
    keyPrefix: string;
    scopes: string[];
    status: 'Active' | 'Revoked';
    userId: mongoose.Types.ObjectId;
    organization?: mongoose.Types.ObjectId;
    lastUsed?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ApiKey: mongoose.Model<IApiKey, {}, {}, {}, mongoose.Document<unknown, {}, IApiKey, {}, {}> & IApiKey & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ApiKey.d.ts.map