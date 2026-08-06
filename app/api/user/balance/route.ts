import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

// GET /api/user/balance - Lấy số dư tài khoản
export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware headers
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user balance from database
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: user.balance,
        discount: 5, // TODO: implement discount logic
        currency: 'VND',
      },
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

