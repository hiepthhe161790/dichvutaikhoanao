import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/logout - Đăng xuất
export async function POST(request: NextRequest) {
  try {
    // TODO: Clear httpOnly cookie
    // TODO: Invalidate token (add to blacklist if using)

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
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
