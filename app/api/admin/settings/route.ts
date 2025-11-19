import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { verifyToken } from '@/lib/jwt';

// GET /api/admin/settings - Lấy settings hiện tại
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // const token = authHeader.substring(7);
    // const decoded = verifyToken(token);

    // if (!decoded || decoded.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Admin access required' },
    //     { status: 403 }
    //   );
    // }

    await connectDB();

    // Lấy settings, nếu chưa có thì tạo mặc định
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        platformName: settings.platformName,
        platformEmail: settings.platformEmail,
        platformPhone: settings.platformPhone,
        serviceFee: settings.serviceFee.toString(),
        minDeposit: settings.minDeposit.toString(),
        maxDeposit: settings.maxDeposit.toString(),
        minWithdraw: settings.minWithdraw.toString(),
        maxWithdraw: settings.maxWithdraw.toString(),
        withdrawFee: settings.withdrawFee.toString(),
        promoCode: settings.promoCode,
        promoDiscount: settings.promoDiscount.toString(),
        promoMinAmount: settings.promoMinAmount.toString(),
      }
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Cập nhật settings
export async function PUT(request: NextRequest) {
  try {
    // Verify admin token
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // const token = authHeader.substring(7);
    // const decoded = verifyToken(token);

    // if (!decoded || decoded.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Admin access required' },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const {
      platformName,
      platformEmail,
      platformPhone,
      serviceFee,
      minDeposit,
      maxDeposit,
      minWithdraw,
      maxWithdraw,
      withdrawFee,
      promoCode,
      promoDiscount,
      promoMinAmount
    } = body;

    // Validation
    if (!platformName || !platformEmail || !platformPhone) {
      return NextResponse.json(
        { error: 'Platform name, email and phone are required' },
        { status: 400 }
      );
    }

    // Convert string numbers to numbers and validate
    const numericFields = {
      serviceFee: parseFloat(serviceFee),
      minDeposit: parseInt(minDeposit),
      maxDeposit: parseInt(maxDeposit),
      minWithdraw: parseInt(minWithdraw),
      maxWithdraw: parseInt(maxWithdraw),
      withdrawFee: parseFloat(withdrawFee),
      promoDiscount: parseFloat(promoDiscount),
      promoMinAmount: parseInt(promoMinAmount)
    };

    // Check for invalid numbers
    for (const [key, value] of Object.entries(numericFields)) {
      if (isNaN(value) || value < 0) {
        return NextResponse.json(
          { error: `${key} must be a valid positive number` },
          { status: 400 }
        );
      }
    }

    // Validate ranges
    if (numericFields.serviceFee > 100 || numericFields.withdrawFee > 100 || numericFields.promoDiscount > 100) {
      return NextResponse.json(
        { error: 'Percentage values cannot exceed 100%' },
        { status: 400 }
      );
    }

    if (numericFields.minDeposit >= numericFields.maxDeposit) {
      return NextResponse.json(
        { error: 'Minimum deposit must be less than maximum deposit' },
        { status: 400 }
      );
    }

    if (numericFields.minWithdraw >= numericFields.maxWithdraw) {
      return NextResponse.json(
        { error: 'Minimum withdraw must be less than maximum withdraw' },
        { status: 400 }
      );
    }

    await connectDB();

    // Tìm và cập nhật settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Update fields
    settings.platformName = platformName;
    settings.platformEmail = platformEmail;
    settings.platformPhone = platformPhone;
    settings.serviceFee = numericFields.serviceFee;
    settings.minDeposit = numericFields.minDeposit;
    settings.maxDeposit = numericFields.maxDeposit;
    settings.minWithdraw = numericFields.minWithdraw;
    settings.maxWithdraw = numericFields.maxWithdraw;
    settings.withdrawFee = numericFields.withdrawFee;
    settings.promoCode = promoCode;
    settings.promoDiscount = numericFields.promoDiscount;
    settings.promoMinAmount = numericFields.promoMinAmount;

    await settings.save();

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        platformName: settings.platformName,
        platformEmail: settings.platformEmail,
        platformPhone: settings.platformPhone,
        serviceFee: settings.serviceFee.toString(),
        minDeposit: settings.minDeposit.toString(),
        maxDeposit: settings.maxDeposit.toString(),
        minWithdraw: settings.minWithdraw.toString(),
        maxWithdraw: settings.maxWithdraw.toString(),
        withdrawFee: settings.withdrawFee.toString(),
        promoCode: settings.promoCode,
        promoDiscount: settings.promoDiscount.toString(),
        promoMinAmount: settings.promoMinAmount.toString(),
      }
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}