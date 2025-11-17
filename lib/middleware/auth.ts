import { NextRequest, NextResponse } from 'next/server';

// Middleware để verify JWT token
export async function authMiddleware(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - No token provided',
        },
        { status: 401 }
      );
    }

    // TODO: Verify JWT token
    // TODO: Decode user info from token
    // TODO: Check if token is blacklisted
    // TODO: Attach user info to request

    // For now, just pass through
    return null;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized - Invalid token',
      },
      { status: 401 }
    );
  }
}

// Middleware để check admin role
export async function adminMiddleware(request: NextRequest) {
  // TODO: Check if user has admin role
  // TODO: Return 403 if not admin

  return null;
}
