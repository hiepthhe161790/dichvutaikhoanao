import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ExternalOrderLog from '@/lib/models/ExternalOrderLog';

// GET /api/admin/external-order-logs — Lịch sử giao dịch với provider ngoài
export async function GET(request: NextRequest) {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ success: false, error: 'DB unavailable' }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const query: Record<string, unknown> = {};
  if (providerId) query.providerId = providerId;
  if (status) query.status = status;

  const total = await ExternalOrderLog.countDocuments(query);
  const logs = await ExternalOrderLog.find(query)
    .populate('providerId', 'name slug')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return NextResponse.json({
    success: true,
    data: logs,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}
