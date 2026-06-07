import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/lib/models/Order';
import Account from '@/lib/models/Account';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import { getTokenFromCookies } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';
import mongoose from 'mongoose';

// GET /api/orders - Lấy danh sách đơn hàng của user
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Get user from token
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
    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (status) {
      query.status = status;
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
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Tạo đơn hàng mới (mua hàng)
export async function POST(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Get user from token
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
    const userId = decoded.userId;

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    // Validate input
    if (!productId || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid productId or quantity' },
        { status: 400 }
      );
    }

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate total price
    const totalPrice = product.price * quantity;

    // 1. Early User Check (Non-atomic, for quick rejection)
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    if (user.balance < totalPrice) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient balance. Need ${totalPrice - user.balance} more` 
        },
        { status: 400 }
      );
    }

    // 2. Find available account IDs (Optimistic fetch)
    const potentialAccounts = await Account.find({
      productId,
      status: 'available'
    }).limit(quantity);

    if (potentialAccounts.length < quantity) {
      return NextResponse.json(
        { success: false, error: `Only ${potentialAccounts.length} accounts available` },
        { status: 400 }
      );
    }

    const potentialIds = potentialAccounts.map(acc => acc._id);

    // 3. [ATOMIC STEP 1] Try to lock exact accounts
    const lockResult = await Account.updateMany(
      { _id: { $in: potentialIds }, status: 'available' },
      { $set: { status: 'locked_temp', lockedBy: userId, lockedAt: new Date() } }
    );

    if (lockResult.modifiedCount < quantity) {
      // Race condition lost! Someone else bought some of these exact accounts.
      // Rollback the locks we DID manage to acquire.
      if (lockResult.modifiedCount > 0) {
        await Account.updateMany(
          { _id: { $in: potentialIds }, status: 'locked_temp', lockedBy: userId },
          { $set: { status: 'available' }, $unset: { lockedBy: "", lockedAt: "" } }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Accounts were just purchased by someone else. Please try again.' },
        { status: 409 }
      );
    }

    // 4. [ATOMIC STEP 2] Deduct balance safely
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: totalPrice } },
      { $inc: { balance: -totalPrice, totalPurchased: quantity, totalSpent: totalPrice } },
      { new: true }
    );

    if (!updatedUser) {
      // Balance was deducted somewhere else in the last millisecond. Rollback locks.
      await Account.updateMany(
        { _id: { $in: potentialIds }, status: 'locked_temp', lockedBy: userId },
        { $set: { status: 'available' }, $unset: { lockedBy: "", lockedAt: "" } }
      );
      return NextResponse.json(
        { success: false, error: 'Insufficient balance.' },
        { status: 400 }
      );
    }

    // 5. Success! Both accounts and money are secured. Create Order.
    const accountsData = potentialAccounts.map(account => ({
      username: account.username,
      password: account.password,
      email: account.email,
      emailPassword: account.emailPassword,
      phone: account.phone,
      additionalInfo: account.additionalInfo,
    }));

    const order = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
      accountId: potentialIds[0],
      quantity: quantity,
      totalPrice: totalPrice,
      status: 'completed',
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
      accounts: accountsData,
      notes: `Purchased ${quantity} account(s) from ${product.title}`,
    });

    await order.save();

    // 6. Mark accounts as fully sold
    await Account.updateMany(
      { _id: { $in: potentialIds } },
      { 
        $set: { status: 'sold', soldAt: new Date(), soldTo: new mongoose.Types.ObjectId(userId) },
        $unset: { lockedBy: "", lockedAt: "" }
      }
    );

    // 7. Update product count
    const updatedAvailableCount = await Account.countDocuments({
      productId,
      status: 'available',
    });

    await Product.findByIdAndUpdate(productId, {
      availableCount: updatedAvailableCount,
      status: updatedAvailableCount > 0 ? 'available' : 'soldout',
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully purchased ${quantity} account(s)`,
        data: {
          orderId: order._id,
          quantity,
          totalPrice: order.totalPrice,
          accounts: accountsData,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
