import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settings from '@/lib/models/Settings';

// GET /api/settings - Lấy settings công khai cho user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Lấy settings, nếu chưa có thì tạo mặc định
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    // Chỉ trả về thông tin công khai cho user
    return NextResponse.json({
      success: true,
      data: {
        platformName: settings.platformName,
        platformEmail: settings.platformEmail,
        platformPhone: settings.platformPhone,
        serviceFee: settings.serviceFee,
        minDeposit: settings.minDeposit,
        maxDeposit: settings.maxDeposit,
        minWithdraw: settings.minWithdraw,
        maxWithdraw: settings.maxWithdraw,
        withdrawFee: settings.withdrawFee,
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