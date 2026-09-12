import mongoose, { Document as MongoDoc } from 'mongoose';
export interface IOrganization extends MongoDoc {
    name: string;
    slug: string;
    owner: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    plan: 'Free' | 'Pro' | 'Enterprise';
    settings: {
        maxUsers: number;
        maxStorage: number;
        aiModelsEnabled: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Organization: mongoose.Model<IOrganization, {}, {}, {}, mongoose.Document<unknown, {}, IOrganization, {}, {}> & IOrganization & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Organization.d.ts.map