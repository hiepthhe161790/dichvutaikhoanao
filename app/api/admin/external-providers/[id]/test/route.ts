import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Provider from '@/lib/models/Provider';
import { apiEngine } from '@/lib/integrations/engine';
import type { IProviderConfig } from '@/lib/integrations/types';

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/external-providers/[id]/test
 * 
 * Kiểm tra kết nối tới provider:
 * - Gọi endpoint getProfile để lấy số dư
 * - Cập nhật trạng thái health trong DB
 * - Trả về kết quả ngay lập tức
 */
export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ success: false, error: 'DB unavailable' }, { status: 503 });

  const provider = await Provider.findById(id);
  if (!provider) return NextResponse.json({ success: false, error: 'Không tìm thấy provider' }, { status: 404 });

  const result = await apiEngine.testConnection(provider as unknown as IProviderConfig);

  // Cập nhật health status trong DB
  await Provider.findByIdAndUpdate(id, {
    isHealthy: result.ok,
    lastHealthCheck: new Date(),
    lastError: result.ok ? undefined : result.error,
    ...(result.balance !== undefined ? { lastKnownBalance: result.balance } : {}),
  });

  return NextResponse.json({
    success: true,
    data: {
      ok: result.ok,
      balance: result.balance,
      latencyMs: result.latencyMs,
      error: result.error,
    },
  });
}
