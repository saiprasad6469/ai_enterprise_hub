import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';

// Set public DNS resolvers (Google & Cloudflare) to prevent Windows / ISP 'querySrv ECONNREFUSED' errors
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore in restricted environments
}

function sanitizeMongoUri(uri: string): string {
  if (!uri || !uri.startsWith('mongodb')) return uri;

  try {
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);
    if (match) {
      const [, proto, username, rawPassword, rest] = match;
      if (rest.includes('@')) {
        const lastAtIndex = uri.lastIndexOf('@');
        const firstColonIndex = uri.indexOf(':', proto.length);
        const user = uri.substring(proto.length, firstColonIndex);
        const pass = uri.substring(firstColonIndex + 1, lastAtIndex);
        const hostAndRest = uri.substring(lastAtIndex + 1);
        return `${proto}${encodeURIComponent(decodeURIComponent(user))}:${encodeURIComponent(decodeURIComponent(pass))}@${hostAndRest}`;
      }
    }
  } catch {
    // Return original URI if parsing fails
  }
  return uri;
}

export async function connectDB(): Promise<boolean> {
  // Disable command buffering globally so queries fail cleanly when disconnected
  mongoose.set('bufferCommands', false);

  if (!env.MONGODB_URI || env.MONGODB_URI.includes('<db_password>')) {
    console.log('🔑 MongoDB connection ready! Configure your MONGODB_URI in .env file.');
    console.log('⚡ Server running cleanly in zero-error mode.');
    return false;
  }

  const finalUri = sanitizeMongoUri(env.MONGODB_URI);

  try {
    const conn = await mongoose.connect(finalUri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected.');
    });

    return true;
  } catch (error: any) {
    if (error.message?.includes('querySrv ECONNREFUSED')) {
      console.error('❌ MongoDB DNS SRV error: Unable to resolve MongoDB Atlas cluster hostname via local DNS.');
    } else if (error.message?.includes('bad auth') || error.message?.includes('authentication failed')) {
      console.error('❌ MongoDB Authentication Error: Invalid database username or password in MONGODB_URI.');
      console.error('👉 Please verify your Database User credentials in MongoDB Atlas -> Security -> Database Access.');
    } else if (error.message?.includes('Server selection timed out') || error.message?.includes('ETIMEDOUT') || error.message?.includes('ENOTFOUND')) {
      console.error('❌ MongoDB Network Error: Could not connect to Atlas cluster.');
      console.error('👉 Please ensure your IP address is whitelisted in MongoDB Atlas -> Network Access (e.g. 0.0.0.0/0).');
    } else {
      console.error(`❌ MongoDB connection error (${error.message}).`);
    }
    console.warn('⚡ Running server in fallback mode without active database connection.');
    return false;
  }
}

