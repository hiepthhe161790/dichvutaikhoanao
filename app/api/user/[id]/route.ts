import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

// PUT /api/user/[id] - Cập nhật thông tin người dùng
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await request.json();
    const user = await User.findByIdAndUpdate(params.id, body, { new: true });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/user/[id] - Xóa người dùng
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = await User.findByIdAndDelete(params.id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
