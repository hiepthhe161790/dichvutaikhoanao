import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Provider from '@/lib/models/Provider';
import { encrypt } from '@/lib/crypto';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/external-providers/[id]
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ success: false, error: 'DB unavailable' }, { status: 503 });

  const provider = await Provider.findById(id).select('-authValue');
  if (!provider) return NextResponse.json({ success: false, error: 'Không tìm thấy' }, { status: 404 });

  return NextResponse.json({ success: true, data: provider });
}

// PUT /api/admin/external-providers/[id] — Cập nhật
export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ success: false, error: 'DB unavailable' }, { status: 503 });

  const body = await request.json();

  // Không cho update slug (vì có thể dùng làm reference)
  const { slug: _slug, ...updateData } = body;

  // Nếu authValue trống, giữ nguyên giá trị cũ
  if (!updateData.authValue) {
    delete updateData.authValue;
  } else {
    // Nếu có gửi lên authValue mới, tiến hành mã hóa
    updateData.authValue = encrypt(updateData.authValue);
  }

  const provider = await Provider.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  ).select('-authValue');

  if (!provider) return NextResponse.json({ success: false, error: 'Không tìm thấy' }, { status: 404 });

  return NextResponse.json({ success: true, data: provider });
}

// DELETE /api/admin/external-providers/[id]
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ success: false, error: 'DB unavailable' }, { status: 503 });

  const result = await Provider.findByIdAndDelete(id);
  if (!result) return NextResponse.json({ success: false, error: 'Không tìm thấy' }, { status: 404 });

  return NextResponse.json({ success: true, message: 'Đã xóa provider' });
}
