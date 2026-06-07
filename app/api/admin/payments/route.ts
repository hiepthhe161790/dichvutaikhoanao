import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import User from '@/lib/models/User';
import { getTokenFromCookies } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';

// GET /api/admin/payments - Lấy danh sách giao dịch
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    await connectDB();

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (method) {
      query.paymentMethod = method;
    }
    if (search) {
      // Try parsing as number for orderCode search
      const searchNum = parseInt(search);
      if (!isNaN(searchNum)) {
        query.orderCode = searchNum;
      } else {
        // Search by user details
        const matchedUsers = await User.find({
          $or: [
            { email: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');
        const userIds = matchedUsers.map(u => u._id);
        query.userId = { $in: userIds };
      }
    }

    // Get total count
    const total = await Invoice.countDocuments(query);

    // Get invoices
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get user info for these invoices
    const userIds = invoices.map(inv => inv.userId).filter(id => id);
    const users = await User.find({ _id: { $in: userIds } }).select('email fullName username');
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    // Format data for frontend
    const transactions = invoices.map((invoice: any) => {
      const user = userMap.get(invoice.userId);
      return {
        id: invoice._id,
        transactionId: invoice._id.toString().slice(-12).toUpperCase(),
        userName: user?.fullName || user?.username || user?.email || 'Unknown',
        userEmail: user?.email || 'Unknown',
        type: 'deposit', // All invoices are deposits
        amount: invoice.amount,
        bonus: invoice.bonus || 0,
        totalAmount: (invoice.amount || 0) + (invoice.bonus || 0),
        status: invoice.status, // pending, completed, failed
        time: new Date(invoice.createdAt).toLocaleString('vi-VN'),
        date: invoice.createdAt,
        description: invoice.description || '',
        orderCode: invoice.orderCode,
        paymentMethod: invoice.paymentMethod || 'payos',
      };
    });

    // Calculate stats
    const [depositStats, completedStats] = await Promise.all([
      Invoice.aggregate([
        {
          $match: { status: 'completed' },
        },
        {
          $group: {
            _id: null,
            totalDeposit: { $sum: '$amount' },
            totalBonus: { $sum: '$bonus' },
            count: { $sum: 1 },
          },
        },
      ]),
      Invoice.countDocuments({ status: 'completed' }),
    ]);

    const pendingCount = await Invoice.countDocuments({ status: 'pending' });

    const stats = {
      totalDeposit: depositStats[0]?.totalDeposit || 0,
      totalBonus: depositStats[0]?.totalBonus || 0,
      totalWithdraw: 0, // No withdrawal in current system
      pendingCount,
      completedCount: completedStats,
    };

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        stats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments data' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/payments - Cập nhật trạng thái giao dịch
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin token
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { invoiceId, status } = body;

    if (!invoiceId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing invoiceId or status' },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const existingInvoice = await Invoice.findById(invoiceId);

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const oldStatus = existingInvoice.status;
    const newStatus = status;
    const creditAmount = (existingInvoice.amount || 0) + (existingInvoice.bonus || 0);

    // Xử lý logic cộng/trừ tiền khi thay đổi trạng thái
    if (oldStatus !== newStatus) {
      if (newStatus === 'completed') {
        // Chuyển sang duyệt -> Cộng tiền
        await User.findByIdAndUpdate(existingInvoice.userId, {
          $inc: { balance: creditAmount },
        });
      } else if (oldStatus === 'completed') {
        // Từ duyệt chuyển về trạng thái khác -> Trừ tiền đã cộng để tránh cộng dồn khi duyệt lại
        await User.findByIdAndUpdate(existingInvoice.userId, {
          $inc: { balance: -creditAmount },
        });
      }
    }

    // Cập nhật trạng thái mới
    existingInvoice.status = newStatus;
    existingInvoice.paymentDate = newStatus === 'completed' ? new Date() : undefined;

    const invoice = await existingInvoice.save();

    // Get user info
    const user = await User.findById(invoice.userId).select('email username');

    return NextResponse.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: {
        ...invoice.toObject(),
        userId: user, // Replace userId string with user object
      },
    });
  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}
