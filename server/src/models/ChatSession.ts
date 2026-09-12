import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

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

const chatSessionSchema = new Schema<IChatSession>(
  {
    title: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    agent: { type: Schema.Types.ObjectId, ref: 'Agent', default: null },
    messages: [
      {
        sender: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

chatSessionSchema.index({ user: 1 });
chatSessionSchema.index({ updatedAt: -1 });

export const ChatSession = mongoose.model<IChatSession>('ChatSession', chatSessionSchema);
