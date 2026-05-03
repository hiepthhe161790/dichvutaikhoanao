import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';

// PATCH /api/admin/user/[id]/bonus - Update user bonus percentage
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    // Verify admin authorization
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only admin can update bonus percentage' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id } = await context.params;
    const { bonusPercentage } = body;

    // Validate bonus percentage
    if (typeof bonusPercentage !== 'number') {
      return NextResponse.json(
        { success: false, error: 'bonusPercentage must be a number' },
        { status: 400 }
      );
    }

    if (bonusPercentage < 0 || bonusPercentage > 100) {
      return NextResponse.json(
        { success: false, error: 'bonusPercentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Update user bonus percentage
    const user = await User.findByIdAndUpdate(
      id,
      { bonusPercentage },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Admin updated bonus for user ${id}: ${bonusPercentage}%`);

    return NextResponse.json({
      success: true,
      message: `Bonus percentage updated to ${bonusPercentage}%`,
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        bonusPercentage: user.bonusPercentage
      }
    });
  } catch (error) {
    console.error('Error updating bonus:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update bonus percentage' },
      { status: 500 }
    );
  }
}
