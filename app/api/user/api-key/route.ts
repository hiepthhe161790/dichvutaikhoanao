import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { verifyToken, getTokenFromCookies } from '@/lib/jwt';
import crypto from 'crypto';

// Hàm helper để tạo API key
const generateApiKey = () => {
  return 'sk_live_' + crypto.randomBytes(32).toString('hex');
};

// Hàm băm SHA-256 của API Key
const hashApiKey = (key: string): string => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

// GET /api/user/api-key - Lấy API key hiện tại (nếu có)
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 });
    }

    let token: string | null | undefined = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) token = await getTokenFromCookies();
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });

    // Cần gọi select('+apiKey') vì mặc định apiKey là select: false
    const user = await User.findById(payload.userId).select('+apiKey');
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    // Trả về mặt nạ nếu có API Key, không trả về mã hash thật
    return NextResponse.json({
      success: true,
      apiKey: user.apiKey ? 'sk_live_********************************' : null,
      apiEnabled: user.apiEnabled
    });
  } catch (error) {
    console.error('Get API key error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get API key' }, { status: 500 });
  }
}

// POST /api/user/api-key - Tạo mới hoặc reset API key
export async function POST(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 });
    }

    let token: string | null | undefined = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) token = await getTokenFromCookies();
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });

    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    // Tạo API Key mới
    const newApiKey = generateApiKey();
    // Băm khóa trước khi lưu vào DB
    user.apiKey = hashApiKey(newApiKey);
    
    // Nếu chưa được bật, tự động bật API
    if (user.apiEnabled === undefined) {
      user.apiEnabled = true;
    }
    
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'API Key generated successfully',
      apiKey: newApiKey, // Trả về khóa thô chỉ một lần duy nhất này để hiển thị
      apiEnabled: user.apiEnabled
    });
  } catch (error) {
    console.error('Generate API key error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate API key' }, { status: 500 });
  }
}
