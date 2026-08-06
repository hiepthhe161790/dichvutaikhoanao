import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { verifyPassword, isValidEmail, sanitizeUser } from '@/lib/auth';
import { generateToken, setTokenCookie } from '@/lib/jwt';
import { loginLimiter, getClientIP } from '@/lib/rate-limiter';
import { logAction } from '@/lib/utils/logger';


// POST /api/auth/login - Đăng nhập
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
    let { email, phone, password } = body;

    // Validation
    if (!password || (!email && !phone)) {
      return NextResponse.json(
        { success: false, error: 'Email/phone and password are required' },
        { status: 400 }
      );
    }

    // Rate limit check
    const clientIP = getClientIP(request);
    const limitKey = email
      ? `login-email-${email.toLowerCase()}`
      : `login-phone-${clientIP}-${phone}`;

    const isAllowed = await loginLimiter.isAllowed(limitKey);
    if (!isAllowed) {
      const remaining = await loginLimiter.getRemaining(limitKey);
      const resetTime = Math.ceil(((await loginLimiter.getResetTime(limitKey)) - Date.now()) / 1000);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: resetTime
        },
        { 
          status: 429,
          headers: { 'Retry-After': resetTime.toString() }
        }
      );
    }
    const query = email
      ? { email: email.toLowerCase() }
      : { phone };

    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email/phone or password' },
        { status: 401 }
      );
    }

    // Kiểm tra status user
    if (user.status === 'blocked') {
      return NextResponse.json(
        { success: false, error: 'Your account has been blocked' },
        { status: 403 }
      );
    }

    if (user.status === 'pending') {
      return NextResponse.json(
        { success: false, error: 'Your account is pending verification' },
        { status: 403 }
      );
    }

    // Kiểm tra password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email/phone or password' },
        { status: 401 }
      );
    }

    // Cập nhật lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Tạo JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Lưu token vào cookies
    await setTokenCookie(token);

    const sanitizedUser = sanitizeUser(user);

    // Ghi audit log đăng nhập
    await logAction({
      action: 'login',
      actor: user._id.toString(),
      actorRole: user.role === 'admin' ? 'admin' : 'customer',
      target: 'user',
      targetId: user._id.toString(),
      ipAddress: clientIP,
      status: 'success'
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: sanitizedUser,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
