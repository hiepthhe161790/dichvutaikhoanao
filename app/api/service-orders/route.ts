import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ServiceOrder from '@/lib/models/ServiceOrder';
import User from '@/lib/models/User';
import Transaction from '@/lib/models/Transaction';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import ServicePricing from '@/lib/models/ServicePricing';

// GET /api/service-orders - Lấy danh sách đơn dịch vụ
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
    const platform = searchParams.get('platform');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (status) {
      query.status = status;
    }
    if (platform) {
      query.platform = platform;
    }

    const total = await ServiceOrder.countDocuments(query);
    const orders = await ServiceOrder.find(query)
      .populate('userId', 'email username fullName')
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
    console.error('Get service orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service orders' },
      { status: 500 }
    );
  }
}

// POST /api/service-orders - Tạo đơn dịch vụ mới
export async function POST(request: NextRequest) {
  let userUpdated = false;
  let createdOrder: any = null;
  let createdTransaction: any = null;
  let previousBalance = 0;
  let previousTotalSpent = 0;
  let userId: string = '';

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
    const {
      serviceType,
      server,
      region,
      quality,
      productLinks,
      shippingInfo,
      note
    } = body;

    // Validation
    if (!serviceType || !server || !productLinks || productLinks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get service config dynamically
    const serviceConfig = await ServicePricing.findOne({ serviceType, isActive: true });
    if (!serviceConfig) {
      return NextResponse.json(
        { success: false, error: 'Invalid or inactive service type' },
        { status: 400 }
      );
    }

    // Validate product links
    for (const link of productLinks) {
      if (!link.url || !link.quantity || link.quantity < serviceConfig.minQuantity) {
        return NextResponse.json(
          { success: false, error: `Invalid product link. Minimum quantity is ${serviceConfig.minQuantity}` },
          { status: 400 }
        );
      }
      if (serviceConfig.maxQuantity && link.quantity > serviceConfig.maxQuantity) {
        return NextResponse.json(
          { success: false, error: `Invalid product link. Maximum quantity is ${serviceConfig.maxQuantity}` },
          { status: 400 }
        );
      }
    }

    // Get server config
    const serverConfig = serviceConfig.servers.find((s: any) => s.id === server && s.isActive);
    if (!serverConfig) {
      return NextResponse.json(
        { success: false, error: 'Invalid or inactive server' },
        { status: 400 }
      );
    }

    // Get quality config
    const qualityConfig = serviceConfig.qualityOptions.find((q: any) => q.id === (quality || 'standard') && q.isActive);
    const qualityMultiplier = qualityConfig?.priceMultiplier || 1.0;

    // Validate shipping info for buff orders
    const requiresShipping = serviceType.includes("order") || serviceType.includes("buff");
    if (requiresShipping) {
      if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.phoneNumber || 
          !shippingInfo.address || !shippingInfo.province) {
        return NextResponse.json(
          { success: false, error: 'Missing shipping information for buff order' },
          { status: 400 }
        );
      }
      if (shippingInfo.phoneNumber.length < 10) {
        return NextResponse.json(
          { success: false, error: 'Invalid phone number' },
          { status: 400 }
        );
      }
    }

    // Calculate total price
    const basePrice = serviceConfig.basePrice;
    const serverMultiplier = serverConfig.priceMultiplier;
    
    const totalPrice = productLinks.reduce((sum: number, link: any) => {
      const qty = parseInt(link.quantity) || 0;
      return sum + (qty * basePrice * serverMultiplier * qualityMultiplier);
    }, 0);

    // Get user and check balance
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
          error: `Insufficient balance. Need ${(totalPrice - user.balance).toLocaleString('vi-VN')}đ more`,
          required: totalPrice,
          current: user.balance,
          shortage: totalPrice - user.balance
        },
        { status: 400 }
      );
    }

    // Save previous values for rollback
    previousBalance = user.balance;
    previousTotalSpent = user.totalSpent || 0;

    // Deduct balance
    user.balance -= totalPrice;
    user.totalSpent = (user.totalSpent || 0) + totalPrice;
    await user.save();
    userUpdated = true;

    // Create service order
    const serviceOrder = new ServiceOrder({
      userId: new mongoose.Types.ObjectId(userId),
      serviceType,
      platform: serviceConfig.platform,
      server,
      serverId: serverConfig.id,
      serverName: serverConfig.name,
      priceMultiplier: serverMultiplier,
      estimatedTime: serverConfig.estimatedTime,
      region,
      quality: quality || 'standard',
      qualityMultiplier,
      productLinks,
      shippingInfo: requiresShipping ? shippingInfo : undefined,
      note,
      totalPrice,
      basePrice,
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: 'wallet'
    });

    createdOrder = await serviceOrder.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: new mongoose.Types.ObjectId(userId),
      type: 'purchase',
      method: 'wallet',
      amount: totalPrice,
      balanceBefore: previousBalance,
      balanceAfter: user.balance,
      status: 'completed',
      description: `Service order: ${serviceConfig.serviceName} - ${serverConfig.name}`,
      relatedOrderId: serviceOrder._id
    });

    createdTransaction = await transaction.save();

    return NextResponse.json({
      success: true,
      data: {
        order: createdOrder,
        transaction: createdTransaction
      },
      message: 'Service order created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create service order error:', error);

    // Rollback on error
    try {
      if (userUpdated) {
        const user = await User.findById(userId);
        if (user) {
          user.balance = previousBalance;
          user.totalSpent = previousTotalSpent;
          await user.save();
        }
      }
      if (createdOrder) {
        await ServiceOrder.findByIdAndDelete(createdOrder._id);
      }
      if (createdTransaction) {
        await Transaction.findByIdAndDelete(createdTransaction._id);
      }
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError);
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create service order' },
      { status: 500 }
    );
  }
}
