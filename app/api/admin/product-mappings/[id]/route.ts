import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ProductProviderMapping from '@/lib/models/ProductProviderMapping';

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/admin/product-mappings/[id]
export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ success: false, error: 'DB unavailable' }, { status: 503 });

  const { externalProductId, priority, isActive } = await request.json();

  const mapping = await ProductProviderMapping.findByIdAndUpdate(
    id,
    { $set: { externalProductId, priority, isActive } },
    { new: true }
  ).populate([
    { path: 'localProductId', select: 'title platform' },
    { path: 'providerId', select: 'name slug status' },
  ]);

  if (!mapping) return NextResponse.json({ success: false, error: 'Không tìm thấy' }, { status: 404 });

  return NextResponse.json({ success: true, data: mapping });
}

// DELETE /api/admin/product-mappings/[id]
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ success: false, error: 'DB unavailable' }, { status: 503 });

  const result = await ProductProviderMapping.findByIdAndDelete(id);
  if (!result) return NextResponse.json({ success: false, error: 'Không tìm thấy' }, { status: 404 });

  return NextResponse.json({ success: true, message: 'Đã xóa mapping' });
}
