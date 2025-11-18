import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
// adminMiddleware
import { adminMiddleware } from '@/lib/middleware/auth';
// GET /api/user - Lấy danh sách người dùng
export async function GET(request: NextRequest) {
  // Check admin middleware
//   const isAdmin = await adminMiddleware(request);
//   if (!isAdmin) {
//     return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
//   }
  try {
    await connectDB();
    const users = await User.find({}, {
      _id: 1,
      name: 1,
      email: 1,
      avatar: 1,
      role: 1,
      status: 1,
      balance: 1,
      phone: 1,
      fullName: 1,
      password: 1,
      totalPurchased: 1,
      totalSpent: 1,
      createdAt: 1,
      updatedAt: 1,
      lastLogin: 1
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/user - Tạo mới người dùng
export async function POST(request: NextRequest) {
  // Check admin middleware
  const isAdmin = await adminMiddleware(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }
  try {
    await connectDB();
    const body = await request.json();
    const user = new User(body);
    await user.save();
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}
