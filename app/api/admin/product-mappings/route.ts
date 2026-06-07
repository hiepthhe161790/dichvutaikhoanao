import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ProductProviderMapping from '@/lib/models/ProductProviderMapping';
import ExternalOrderLog from '@/lib/models/ExternalOrderLog';

// GET /api/admin/product-mappings — Danh sách mapping
export async function GET(request: NextRequest) {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ success: false, error: 'DB unavailable' }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const localProductId = searchParams.get('productId');

  const query: Record<string, unknown> = {};
  if (localProductId) query.localProductId = localProductId;

  const mappings = await ProductProviderMapping.find(query)
    .populate('localProductId', 'title platform')
    .populate('providerId', 'name slug status isHealthy lastKnownBalance')
    .sort({ localProductId: 1, priority: 1 });

  return NextResponse.json({ success: true, data: mappings });
}

// POST /api/admin/product-mappings — Tạo mapping mới
export async function POST(request: NextRequest) {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ success: false, error: 'DB unavailable' }, { status: 503 });

  const body = await request.json();
  const { localProductId, providerId, externalProductId, priority = 1 } = body;

  if (!localProductId || !providerId || !externalProductId) {
    return NextResponse.json(
      { success: false, error: 'Thiếu: localProductId, providerId, externalProductId' },
      { status: 400 }
    );
  }

  try {
    const mapping = await ProductProviderMapping.create({
      localProductId,
      providerId,
      externalProductId,
      priority,
      isActive: true,
    });

    const populated = await mapping.populate([
      { path: 'localProductId', select: 'title platform' },
      { path: 'providerId', select: 'name slug status' },
    ]);

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Mapping này đã tồn tại (sản phẩm + provider trùng)' },
        { status: 409 }
      );
    }
    throw error;
  }
}
