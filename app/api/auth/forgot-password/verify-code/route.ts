import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin yêu cầu' },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordCode: code.toUpperCase().trim(),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Mã xác nhận không chính xác' },
        { status: 400 }
      );
    }

    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
      return NextResponse.json(
        { success: false, error: 'Mã xác nhận đã hết hạn' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mã xác nhận hợp lệ.',
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi hệ thống' },
      { status: 500 }
    );
  }
}
