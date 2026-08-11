import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Get JWT secret and enforce it exists (fail-fast)
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is not set. ' +
      'Please set it in your .env or .env.local file before running this application.'
    );
  }
  return secret;
}

const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Tạo JWT token
export function generateToken(payload: JWTPayload): string {
  const secret = getJWTSecret();
  return jwt.sign(payload, secret, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// Xác thực JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = getJWTSecret();
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Lấy token từ cookies
export async function getTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
  } catch (error) {
    console.error('Get token from cookies error:', error);
    return null;
  }
}

// Lưu token vào cookies
export async function setTokenCookie(token: string, rememberMe: boolean = true): Promise<void> {
  try {
    const cookieStore = await cookies();
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };

    if (rememberMe) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60; // 30 days
    }

    await cookieStore.set('auth_token', token, cookieOptions);
  } catch (error) {
    console.error('Set token cookie error:', error);
  }
}

// Xóa token từ cookies
export async function clearTokenCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
  } catch (error) {
    console.error('Clear token cookie error:', error);
  }
}
