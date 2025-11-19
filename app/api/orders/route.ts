import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/lib/models/Order';
import Account from '@/lib/models/Account';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';
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

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

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

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

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

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate total price
    const totalPrice = product.price * quantity;

    // Check balance
    if (user.balance < totalPrice) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient balance. Need ${totalPrice - user.balance} more` 
        },
        { status: 400 }
      );
    }

    // Get available accounts
    const availableAccounts = await Account.find({
      productId,
      status: 'available'
    }).limit(quantity);

    if (availableAccounts.length < quantity) {
      return NextResponse.json(
        { success: false, error: `Only ${availableAccounts.length} accounts available` },
        { status: 400 }
      );
    }

    // Create ONE order with all accounts
    const accountIds = [];
    const accountsData = [];

    for (const account of availableAccounts) {
      accountIds.push(account._id);
      accountsData.push({
        username: account.username,
        password: account.password,
        email: account.email,
        emailPassword: account.emailPassword,
        phone: account.phone,
        additionalInfo: account.additionalInfo,
      });
    }

    // Create single order
    const order = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
      accountId: availableAccounts[0]._id, // Reference first account
      quantity: quantity,
      totalPrice: product.price * quantity,
      status: 'completed',
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
      accounts: accountsData, // Store all accounts
      notes: `Purchased ${quantity} account(s) from ${product.title}`,
    });

    await order.save();

    // Mark accounts as sold
    await Account.updateMany(
      { _id: { $in: accountIds } },
      {
        status: 'sold',
        soldAt: new Date(),
        soldTo: new mongoose.Types.ObjectId(userId),
      }
    );

    // Deduct balance from user
    user.balance -= totalPrice;
    user.totalPurchased = (user.totalPurchased || 0) + quantity;
    user.totalSpent = (user.totalSpent || 0) + totalPrice;
    await user.save();

    // Update product availableCount
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
