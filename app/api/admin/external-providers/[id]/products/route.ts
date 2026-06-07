import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Provider from '@/lib/models/Provider';
import { apiEngine } from '@/lib/integrations/engine';
import type { IProviderConfig } from '@/lib/integrations/types';

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/external-providers/[id]/products
 * 
 * Lấy danh sách sản phẩm từ provider để admin có thể chọn mapping.
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ success: false, error: 'DB unavailable' }, { status: 503 });

  const provider = await Provider.findById(id);
  if (!provider) return NextResponse.json({ success: false, error: 'Không tìm thấy provider' }, { status: 404 });

  if (!provider.endpoints?.getProducts) {
    return NextResponse.json(
      { success: false, error: 'Provider này chưa cấu hình endpoint getProducts' },
      { status: 400 }
    );
  }

  try {
    const products = await apiEngine.fetchProductList(provider as unknown as IProviderConfig);
    return NextResponse.json({ success: true, data: products, total: products.length });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lấy sản phẩm thất bại' },
      { status: 500 }
    );
  }
}
