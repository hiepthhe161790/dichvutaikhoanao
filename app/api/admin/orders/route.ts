import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import { getTokenFromCookies } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';
import mongoose from 'mongoose';

// GET /api/admin/orders
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Verify admin token
    const token = getTokenFromCookies(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      // Find matching users and products to filter orders
      const [matchedUsers, matchedProducts] = await Promise.all([
        User.find({
          $or: [
            { email: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } }
          ]
        }).select('_id'),
        Product.find({
          title: { $regex: search, $options: 'i' }
        }).select('_id')
      ]);

      const userIds = matchedUsers.map(u => u._id);
      const productIds = matchedProducts.map(p => p._id);

      query.$or = [];
      
      // If search matches ObjectId length, also search by Order _id
      if (mongoose.Types.ObjectId.isValid(search) || search.length === 24) {
         query.$or.push({ _id: new mongoose.Types.ObjectId(search) });
      } else if (search.length >= 8 && /^[a-fA-F0-9]+$/.test(search)) {
         // Also try matching the last 8 chars (which frontend uses for display) if possible, but MongoDB _id regex is complex.
         // We can fallback to fetching users/products
      }

      if (userIds.length > 0) query.$or.push({ userId: { $in: userIds } });
      if (productIds.length > 0) query.$or.push({ productId: { $in: productIds } });

      // If nothing matched, force an empty result by adding an impossible condition if $or is empty
      if (query.$or.length === 0) {
        query._id = null;
        delete query.$or;
      }
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('productId', 'title price platform')
      .populate('accountId')
      .populate('userId', '_id email username phone fullName balance totalSpent status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
