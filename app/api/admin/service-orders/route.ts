import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ServiceOrder from '@/lib/models/ServiceOrder';
import User from '@/lib/models/User';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// GET /api/admin/service-orders - Lấy tất cả đơn dịch vụ (Admin)
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Check admin
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let isAdmin = false;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      isAdmin = decoded.role === 'admin';
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    // Build query
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (platform && platform !== 'all') query.platform = platform;
    if (userId) query.userId = new mongoose.Types.ObjectId(userId);
    
    if (search) {
      // Find matching users first
      const matchedUsers = await User.find({
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = matchedUsers.map(u => u._id);

      query.$or = [
        { serviceType: { $regex: search, $options: 'i' } },
        { serverName: { $regex: search, $options: 'i' } },
        { link: { $regex: search, $options: 'i' } } // optional search in link
      ];

      if (mongoose.Types.ObjectId.isValid(search) || search.length === 24) {
        query.$or.push({ _id: new mongoose.Types.ObjectId(search) });
      }

      if (userIds.length > 0) {
        query.$or.push({ userId: { $in: userIds } });
      }
    }

    const total = await ServiceOrder.countDocuments(query);
    const orders = await ServiceOrder.find(query)
      .populate('userId', 'email username fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Calculate statistics
    const stats = await ServiceOrder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Get service orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service orders' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/service-orders - Cập nhật trạng thái đơn (Admin)
export async function PUT(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Check admin
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let isAdmin = false;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      isAdmin = decoded.role === 'admin';
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, status, failureReason, refundAmount } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const order = await ServiceOrder.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
    order.status = status;
    
    if (status === 'processing' && !order.processStartedAt) {
      order.processStartedAt = new Date();
    }

    if (status === 'completed' && !order.processCompletedAt) {
      order.processCompletedAt = new Date();
    }

    if (status === 'failed' && failureReason) {
      order.failureReason = failureReason;
    }

    if (status === 'refunded' && refundAmount) {
      order.refundAmount = refundAmount;
      // Refund to user wallet
      const user = await User.findById(order.userId);
      if (user) {
        user.balance += refundAmount;
        await user.save();
      }
    }

    await order.save();

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Update service order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/service-orders - Xóa đơn (Admin)
export async function DELETE(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Check admin
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let isAdmin = false;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      isAdmin = decoded.role === 'admin';
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    await ServiceOrder.findByIdAndDelete(orderId);

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Delete service order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
