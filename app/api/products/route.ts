import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { getCache, setCache } from '@/lib/cache-helper';

// GET /api/products - Lấy danh sách sản phẩm từ MongoDB (có cache)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Create unique cache key for the query parameters
  const cacheKey = `products:${platform || ''}:${category || ''}:${status || ''}:${page}:${limit}`;
  
  try {
    const cachedResponse = await getCache<any>(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse);
    }
  } catch (err) {
    console.error('[Products API] Cache read error:', err);
  }

  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 });
  }

  const query: any = {};
  if (platform) query.platform = platform;
  if (category) query.category = category;
  if (status) query.status = status;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .skip((page - 1) * limit)
    .limit(limit);

  const responseData = {
    success: true,
    data: products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  try {
    // Cache for 30 seconds
    await setCache(cacheKey, responseData, 30);
  } catch (err) {
    console.error('[Products API] Cache write error:', err);
  }

  return NextResponse.json(responseData);
}

