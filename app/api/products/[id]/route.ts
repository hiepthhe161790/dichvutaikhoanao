
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';

type Params = { params: { id: string } };

// GET /api/products/[id] - Lấy chi tiết sản phẩm từ MongoDB
export async function GET(request: Request, { params }: Params) {
  await connectDB();
  const product = await Product.findOne({ id: params.id });
  if (!product) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: product });
}

// PUT /api/products/[id] - Cập nhật sản phẩm
export async function PUT(request: Request, { params }: Params) {
  await connectDB();
  const body = await request.json();
  const product = await Product.findOneAndUpdate({ id: params.id }, body, { new: true });
  if (!product) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Product updated successfully', data: product });
}

// DELETE /api/products/[id] - Xóa sản phẩm
export async function DELETE(request: Request, { params }: Params) {
  await connectDB();
  const product = await Product.findOneAndDelete({ id: params.id });
  if (!product) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Product deleted successfully' });
}
