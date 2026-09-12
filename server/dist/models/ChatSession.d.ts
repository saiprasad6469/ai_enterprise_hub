import mongoose, { Document as MongoDoc } from 'mongoose';
export interface IChatSession extends MongoDoc {
    title: string;
    user: mongoose.Types.ObjectId;
    agent?: mongoose.Types.ObjectId;
    messages: {
        sender: 'user' | 'assistant';
        content: string;
        timestamp: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const ChatSession: mongoose.Model<IChatSession, {}, {}, {}, mongoose.Document<unknown, {}, IChatSession, {}, {}> & IChatSession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ChatSession.d.ts.map