import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../jwt';

// Middleware để verify JWT token
export async function authMiddleware(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');

    if (!token) {
      // Try to get from cookies
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
          return acc;
        }, {} as Record<string, string>);
        token = cookies['auth_token'] || cookies['token'];
      }
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - No token provided',
        },
        { status: 401 }
      );
    }

    // Verify JWT token signature statelessly
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - Invalid token',
        },
        { status: 401 }
      );
    }

    // Create new request with user info in headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);
    requestHeaders.set('x-user-email', decoded.email);

    // Return NextResponse.next() with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
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
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');

    if (!token) {
      // Try to get from cookies
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
          return acc;
        }, {} as Record<string, string>);
        token = cookies['auth_token'] || cookies['token'];
      }
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - No token provided',
        },
        { status: 401 }
      );
    }

    // Verify JWT token signature statelessly
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - Invalid token',
        },
        { status: 401 }
      );
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden - Admin access required',
        },
        { status: 403 }
      );
    }

    // Create new request with user info in headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);
    requestHeaders.set('x-user-email', decoded.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Admin middleware error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized - Invalid token',
      },
      { status: 401 }
    );
  }
}

