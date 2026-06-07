import mongoose from 'mongoose';

// Import all models to ensure they're registered
import './models';

// Skip initialization during build
const isBuild =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  (process.env.NODE_ENV === 'production' && process.env.__VERCEL_BUILD_RUNNING === 'true');

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI && !isBuild) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Global cache để tái sử dụng connection giữa các hot-reload
let cached = (global as any).mongoose || { conn: null, promise: null };
(global as any).mongoose = cached;

export async function connectDB() {
  if (isBuild) return null;
  if (!MONGODB_URI) { console.error('MONGODB_URI not defined'); return null; }

  // Nếu đã có connection VÀ readyState = 1 (connected), dùng lại
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Nếu chưa có promise đang chạy, tạo mới
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        // Cho phép retry để tránh race condition lần đầu
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 30000,
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        // Reset promise để lần sau có thể thử lại
        cached.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
    // Đợi connection thực sự ready (readyState = 1)
    if (cached.conn && mongoose.connection.readyState !== 1) {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
        mongoose.connection.once('connected', () => { clearTimeout(timeout); resolve(); });
        mongoose.connection.once('error', (err) => { clearTimeout(timeout); reject(err); });
      });
    }
    return cached.conn;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    cached.conn = null;
    cached.promise = null;
    return null;
  }
}
