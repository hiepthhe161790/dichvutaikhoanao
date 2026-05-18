import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import { getTokenFromCookies } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';

/**
 * POST /api/invoices/create-from-deposit
 *
 * Called by DepositModal when user creates an invoice (PayOS or manual VietQR).
 *
 * Body:
 * {
 *   orderCode: number,
 *   amount: number,
 *   bonus: number,
 *   description: string,
 *   paymentMethod: 'payos' | 'manual',
 *   bankAccountId?: string,  // for manual payments
 *   qrCode?: string,         // for payos
 *   checkoutUrl?: string     // for payos
 * }
 *
 * Auth: Middleware sets x-user-id header
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
    const {
      orderCode,
      amount,
      bonus = 0,
      description,
      paymentMethod = 'payos',
      bankAccountId,
      qrCode,
      checkoutUrl,
    } = body;

    if (!orderCode || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderCode, amount' },
        { status: 400 }
      );
    }

    if (!['payos', 'manual'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'paymentMethod must be payos or manual' },
        { status: 400 }
      );
    }

    // Check if invoice already exists by orderCode
    const existing = await Invoice.findOne({ orderCode });
    if (existing) {
      return NextResponse.json(
        { success: true, message: 'Invoice already exists', data: existing },
        { status: 200 }
      );
    }

    const invoice = new Invoice({
      userId,
      orderCode,
      amount,
      bonus,
      totalAmount: amount + bonus,
      status: 'pending',
      description: description || `Nạp tiền ${amount.toLocaleString('vi-VN')} VNĐ`,
      paymentMethod,
      ...(bankAccountId && { bankAccountId }),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      ...(qrCode && { qrCode }),
      ...(checkoutUrl && { checkoutUrl }),
    });

    const saved = await invoice.save();

    return NextResponse.json(
      { success: true, message: 'Invoice created successfully', data: saved },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
