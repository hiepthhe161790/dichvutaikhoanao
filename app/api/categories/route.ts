import { NextRequest, NextResponse } from 'next/server';
import { categories } from '@/app/data/products';

// GET /api/categories - Lấy danh sách danh mục
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
