import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';

/**
 * POST /api/invoices/create-from-deposit
 * 
 * Called by DepositModal when user clicks "Tạo mã QR"
 * Creates an invoice record for tracking
 * 
 * Body:
 * {
 *   orderCode: number,
 *   amount: number,
 *   bonus: number,
 *   description: string,
 *   qrCode?: string,
 *   checkoutUrl?: string
 * }
 * 
 * Auth: Middleware sets x-user-id header - userId will be extracted from there
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    // Get userId from middleware header (not from client body)
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - x-user-id not set by middleware' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderCode, amount, bonus = 0, description, qrCode, checkoutUrl } = body;

    if (!orderCode || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderCode, amount' },
        { status: 400 }
      );
    }

    // Check if invoice already exists by orderCode
    const existing = await Invoice.findOne({ orderCode });
    if (existing) {
      return NextResponse.json(
        {
          success: true,
          message: 'Invoice already exists',
          data: existing
        },
        { status: 200 }
      );
    }

    // Create invoice with userId from authenticated header
    const invoice = new Invoice({
      userId,
      orderCode,
      amount,
      bonus,
      totalAmount: amount + bonus,
      status: 'pending',
      description: description || `Nạp tiền ${amount.toLocaleString('vi-VN')} VNĐ`,
      paymentMethod: 'payos',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      qrCode,
      checkoutUrl
    });

    const saved = await invoice.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Invoice created successfully',
        data: saved
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}
