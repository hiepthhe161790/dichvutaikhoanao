import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Account from '@/lib/models/Account';
import Product from '@/lib/models/Product';
import { decrypt } from '@/lib/encryption';

// GET /api/accounts?productId=xxx&page=1&limit=50&status=available
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Missing productId' },
        { status: 400 }
      );
    }

    // Kiểm tra product tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Build query
    const query: any = { productId };
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Account.countDocuments(query);
    const accountsRaw = await Account.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const accounts = accountsRaw.map((acc: any) => {
      if (acc.password) {
        acc.password = decrypt(acc.password);
      }
      if (acc.emailPassword) {
        acc.emailPassword = decrypt(acc.emailPassword);
      }
      if (acc.raw) {
        acc.raw = decrypt(acc.raw);
      }
      return acc;
    });

    return NextResponse.json({
      success: true,
      data: accounts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get accounts' },
      { status: 500 }
    );
  }
}
