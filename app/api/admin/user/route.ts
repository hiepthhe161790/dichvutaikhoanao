import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { hashPassword } from '@/lib/auth';

// GET /api/user - Lấy danh sách người dùng (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;

    const total = await User.countDocuments(query);
    const users = await User.find(query, {
      _id: 1,
      name: 1,
      email: 1,
      avatar: 1,
      role: 1,
      status: 1,
      balance: 1,
      bonusPercentage: 1,
      phone: 1,
      fullName: 1,
      password: 1,
      totalPurchased: 1,
      totalSpent: 1,
      createdAt: 1,
      updatedAt: 1,
      lastLogin: 1
    }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    return NextResponse.json({ 
      success: true, 
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/user - Tạo mới người dùng (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Hash password nếu có
    if (body.password) {
      body.password = await hashPassword(body.password);
    }
    
    const user = new User(body);
    await user.save();
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}
