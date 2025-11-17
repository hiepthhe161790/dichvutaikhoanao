import { NextRequest, NextResponse } from 'next/server';

// GET /api/user/balance - Lấy số dư tài khoản
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication
    // TODO: Get user balance from database

    return NextResponse.json({
      success: true,
      data: {
        balance: 134,
        discount: 5,
        currency: 'VND',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST /api/user/balance/deposit - Nạp tiền
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, method } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid amount',
        },
        { status: 400 }
      );
    }

    if (!method) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment method is required',
        },
        { status: 400 }
      );
    }

    // TODO: Add authentication
    // TODO: Create payment transaction
    // TODO: Generate payment QR/link based on method
    // TODO: Save transaction to database

    return NextResponse.json({
      success: true,
      message: 'Deposit request created',
      data: {
        transactionId: 'txn-' + Date.now(),
        amount,
        method,
        status: 'pending',
        paymentUrl: 'https://payment.example.com/xxx',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
