import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/login - Đăng nhập
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // TODO: Find user in database
    // TODO: Compare password with hashed password
    // TODO: Generate JWT token
    // TODO: Set httpOnly cookie

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: 'user-1',
        username: 'hoanghiep02',
        email,
        role: 'admin',
        balance: 134,
        token: 'jwt-token-here',
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
