import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { hashPassword, isStrongPassword } from '@/lib/auth';

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
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin yêu cầu' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!isStrongPassword(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và chữ số',
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordCode: code.toUpperCase().trim(),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu không hợp lệ hoặc mã xác nhận sai' },
        { status: 400 }
      );
    }

    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
      return NextResponse.json(
        { success: false, error: 'Mã xác nhận đã hết hạn' },
        { status: 400 }
      );
    }

    // Update password and clear reset code fields
    user.password = await hashPassword(newPassword);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể đặt lại mật khẩu. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
