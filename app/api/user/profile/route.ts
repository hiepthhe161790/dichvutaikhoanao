import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Invoice from '@/lib/models/Invoice';
import CardDeposit from '@/lib/models/CardDeposit';
import { verifyToken, getTokenFromCookies } from '@/lib/jwt';

// GET /api/user/profile - Lấy thông tin profile
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Lấy token từ header hoặc cookies
    let token: string | null | undefined = request.headers
      .get('authorization')
      ?.replace('Bearer ', '');

    if (!token) {
      token = await getTokenFromCookies();
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Xác thực token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Lấy user từ database
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'User is inactive or blocked' },
        { status: 403 }
      );
    }

    // Tính toán thống kê tài chính từ orders collection
    const stats = await User.aggregate([
      { $match: { _id: user._id } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      {
        $project: {
          totalPurchased: {
            $size: {
              $filter: {
                input: '$orders',
                as: 'order',
                cond: { $eq: ['$$order.status', 'completed'] }
              }
            }
          },
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$orders',
                    as: 'order',
                    cond: { $eq: ['$$order.status', 'completed'] }
                  }
                },
                as: 'order',
                in: '$$order.totalPrice'
              }
            }
          }
        }
      }
    ]);

    const userStats = stats[0] || { totalPurchased: 0, totalSpent: 0 };

    // Tính tổng tiền nạp (từ Invoice hoàn thành và CardDeposit hoàn thành)
    const bankDeposits = await Invoice.aggregate([
      { $match: { userId: user._id.toString(), status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalBankDeposits = bankDeposits[0]?.total || 0;

    const cardDeposits = await CardDeposit.aggregate([
      { $match: { userId: user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$actualAmount' } } }
    ]);
    const totalCardDeposits = cardDeposits[0]?.total || 0;

    const totalDeposited = totalBankDeposits + totalCardDeposits;

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        balance: user.balance,
        totalPurchased: userStats.totalPurchased,
        totalSpent: userStats.totalSpent,
        totalDeposited,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Cập nhật profile
export async function PUT(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Lấy token từ header hoặc cookies
    let token: string | null | undefined = request.headers
      .get('authorization')
      ?.replace('Bearer ', '');

    if (!token) {
      token = await getTokenFromCookies();
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Xác thực token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullName, phone, email } = body;

    // Validation
    if (!fullName || !phone || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (Vietnam phone number)
    const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Lấy user từ database
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'User is inactive or blocked' },
        { status: 403 }
      );
    }

    // Cập nhật thông tin
    user.fullName = fullName;
    user.phone = phone;
    user.email = email;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        balance: user.balance,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
