import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Category from '@/lib/models/Category';
import { getCache, setCache } from '@/lib/cache-helper';

// GET /api/categories - Lấy danh sách categories (có cache)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status') || 'active';

    // Create unique cache key for parameters
    const cacheKey = `categories:${platform || ''}:${status}`;
    
    try {
      const cachedResponse = await getCache<any>(cacheKey);
      if (cachedResponse) {
        return NextResponse.json(cachedResponse);
      }
    } catch (err) {
      console.error('[Categories API] Cache read error:', err);
    }

    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const query: any = {};
    if (platform) query.platform = platform;
    if (status) query.status = status;

    const categories = await Category.find(query)
      .sort({ displayOrder: 1 })
      .exec();

    const responseData = {
      success: true,
      data: categories,
    };

    try {
      // Cache categories list for 60 seconds
      await setCache(cacheKey, responseData, 60);
    } catch (err) {
      console.error('[Categories API] Cache write error:', err);
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get categories' },
      { status: 500 }
    );
  }
}
