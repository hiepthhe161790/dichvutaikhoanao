import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { redis, isRedisEnabled } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    services: {
      database: 'DOWN',
      redis: 'DISABLED',
    },
  };

  try {
    // 1. Check MongoDB Connection
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      status.services.database = 'UP';
    }
  } catch (err: any) {
    status.status = 'DEGRADED';
    status.services.database = `ERROR: ${err.message}`;
  }

  try {
    // 2. Check Redis Connection
    if (isRedisEnabled && redis) {
      const start = Date.now();
      await redis.ping();
      const latency = Date.now() - start;
      status.services.redis = `UP (${latency}ms)`;
    }
  } catch (err: any) {
    status.status = 'DEGRADED';
    status.services.redis = `ERROR: ${err.message}`;
  }

  // Return HTTP 200 if all services are UP, otherwise 500
  const isHealthy = status.services.database === 'UP';
  const httpStatus = isHealthy ? 200 : 500;

  return NextResponse.json(status, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
    },
  });
}
