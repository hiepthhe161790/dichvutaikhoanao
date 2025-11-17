import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/register - Đăng ký tài khoản
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Validate
    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username, email, and password are required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 6 characters',
        },
        { status: 400 }
      );
    }

    // TODO: Check if user exists
    // TODO: Hash password
    // TODO: Create user in database
    // TODO: Generate JWT token

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: {
          userId: 'user-' + Date.now(),
          username,
          email,
        },
      },
      { status: 201 }
    );
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
