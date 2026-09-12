import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting reconnection...');
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    // Don't crash the server — let it run with degraded state for development
    console.warn('⚠️  Server running without database. API calls requiring DB will fail.');
  }
}
