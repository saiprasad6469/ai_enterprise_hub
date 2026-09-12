import mongoose, { Document as MongoDoc } from 'mongoose';
export interface IDocument extends MongoDoc {
    name: string;
    originalName: string;
    type: string;
    size: number;
    path: string;
    uploadedBy: mongoose.Types.ObjectId;
    department?: string;
    status: 'Uploading' | 'Processing' | 'Indexing' | 'Indexed' | 'Failed' | 'Processed';
    progress?: number;
    chunksCount?: number;
    organization?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Document: mongoose.Model<IDocument, {}, {}, {}, mongoose.Document<unknown, {}, IDocument, {}, {}> & IDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Document.d.ts.map