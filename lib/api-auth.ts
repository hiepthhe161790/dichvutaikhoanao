import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

export async function authenticateApiKey(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return { user: null, error: 'Database not available', status: 503 };
    }

    // Lấy API Key từ Header
    // Hỗ trợ cả 2 dạng:
    // 1. Authorization: Bearer <API_KEY>
    // 2. x-api-key: <API_KEY>
    let apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        apiKey = authHeader.replace('Bearer ', '');
      }
    }

    if (!apiKey) {
      return { user: null, error: 'API Key is missing', status: 401 };
    }

    // Tìm user theo apiKey
    const user = await User.findOne({ apiKey }).select('+apiKey +apiEnabled');
    
    if (!user) {
      return { user: null, error: 'Invalid API Key', status: 401 };
    }

    if (!user.apiEnabled) {
      return { user: null, error: 'API access is disabled for this account', status: 403 };
    }

    if (user.status !== 'active') {
      return { user: null, error: 'Account is not active', status: 403 };
    }

    return { user, error: null, status: 200 };
  } catch (error) {
    console.error('API Auth error:', error);
    return { user: null, error: 'Internal Server Error', status: 500 };
  }
}
