import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { connectDB } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import User from '@/lib/models/User';
import Settings from '@/lib/models/Settings';
import { resend } from '@/lib/resend';
import { calculateBonusPercentage } from '@/lib/utils/bonus-utils';
import { logAction } from '@/lib/utils/logger';
import { sendTelegramAlert } from '@/lib/notifications/telegram';



export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, method = 'payos', bankAccountId } = body;

    const numericAmount = parseInt(amount);
    if (isNaN(numericAmount) || numericAmount < 10000) {
      return NextResponse.json(
        { success: false, error: 'Số tiền nạp tối thiểu là 10.000 VNĐ' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check user active status
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'User is inactive or blocked' },
        { status: 403 }
      );
    }

    // Calculate bonus amount
    const tierBonusPercent = calculateBonusPercentage(numericAmount);
    const adminBonusPercent = user.bonusPercentage || 0;
    const bonusPercent = Math.max(tierBonusPercent, adminBonusPercent);
    const bonusAmount = (numericAmount * bonusPercent) / 100;

    // Generate unique orderCode (timestamp in seconds + random 4 digits)
    let orderCode = Math.floor(Date.now() / 1000) * 10000 + Math.floor(Math.random() * 10000);
    let exists = await Invoice.findOne({ orderCode });
    while (exists) {
      orderCode = Math.floor(Date.now() / 1000) * 10000 + Math.floor(Math.random() * 10000);
      exists = await Invoice.findOne({ orderCode });
    }

    const description = `nap tien ${orderCode}`;
    let safeDescription = description;
    if (safeDescription.length > 25) safeDescription = safeDescription.slice(0, 25);

    let checkoutUrl = '';
    let qrCode = '';

    if (method === 'payos') {
      const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
      const clientId = process.env.PAYOS_CLIENT_ID;
      const apiKey = process.env.PAYOS_API_KEY;

      if (!checksumKey || !clientId || !apiKey) {
        console.error('Missing PayOS config in environment variables');
        return NextResponse.json(
          { success: false, error: 'Missing PayOS configuration on server' },
          { status: 500 }
        );
      }

      // Determine cancelUrl and returnUrl based on APP URL or fallback origin
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const cancelUrl = `${origin}/deposit?status=cancelled`;
      const returnUrl = `${origin}/deposit?status=success`;

      const rawData = `amount=${numericAmount}&cancelUrl=${cancelUrl}&description=${safeDescription}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
      const signature = crypto.createHmac('sha256', checksumKey).update(rawData).digest('hex');

      try {
        const payosRes = await axios.post('https://api-merchant.payos.vn/v2/payment-requests', {
          orderCode,
          amount: numericAmount,
          description: safeDescription,
          cancelUrl,
          returnUrl,
          signature
        }, {
          headers: {
            'x-client-id': clientId,
            'x-api-key': apiKey
          }
        });

        if (payosRes.data && payosRes.data.data) {
          checkoutUrl = payosRes.data.data.checkoutUrl;
          qrCode = payosRes.data.data.qrCode;
        } else {
          throw new Error(payosRes.data?.desc || 'Failed to create payment link on PayOS');
        }
      } catch (payosErr: any) {
        console.error('PayOS integration error:', payosErr.response?.data || payosErr.message);
        return NextResponse.json(
          { success: false, error: 'Không thể tạo mã QR thanh toán PayOS' },
          { status: 502 }
        );
      }
    }

    // Create invoice record in database
    const invoice = new Invoice({
      userId: user._id.toString(),
      orderCode,
      amount: numericAmount,
      bonus: bonusAmount,
      totalAmount: numericAmount + bonusAmount,
      status: 'pending',
      description: safeDescription,
      paymentMethod: method === 'payos' ? 'payos' : 'manual',
      ...(bankAccountId && { bankAccountId }),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      ...(qrCode && { qrCode }),
      ...(checkoutUrl && { checkoutUrl }),
    });

    const savedInvoice = await invoice.save();

    // Trigger email notification for manual deposit
    if (method === 'manual' && resend) {
      (async () => {
        try {
          const settings = await Settings.findOne();
          if (settings && settings.platformEmail) {
            const userDisplay = `${user.fullName} (${user.email})`;
            const emailName = process.env.EMAIL_NAME || 'Admin Notification';
            const emailSender = process.env.EMAIL_VERIFIED_SENDER || 'onboarding@resend.dev';
            
            console.log('\n--- SENDING NOTIFICATION EMAIL ---');
            await resend.emails.send({
              from: `${emailName} <${emailSender}>`,
              to: [settings.platformEmail],
              subject: `💰 Yêu cầu nạp tiền mới: ${orderCode}`,
              html: `
                <h2>Yêu cầu nạp tiền thủ công mới</h2>
                <p><strong>Người dùng:</strong> ${userDisplay}</p>
                <p><strong>Mã giao dịch:</strong> ${orderCode}</p>
                <p><strong>Số tiền:</strong> ${numericAmount.toLocaleString('vi-VN')} VNĐ</p>
                <p><strong>Nội dung CK:</strong> ${safeDescription}</p>
                <br/>
                <p>Vui lòng kiểm tra tài khoản ngân hàng và duyệt yêu cầu trên trang Quản trị.</p>
              `
            });
          }
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
        }
      })();
    }

    // Ghi audit log tạo yêu cầu nạp tiền
    await logAction({
      action: method === 'payos' ? 'create_deposit_payos' : 'create_deposit_manual',
      actor: user._id.toString(),
      actorRole: 'customer',
      target: 'transaction',
      targetId: savedInvoice._id.toString(),
      changes: [
        { field: 'amount', oldValue: 0, newValue: numericAmount },
        { field: 'method', oldValue: '', newValue: method }
      ],
      status: 'success'
    });

    // Bắn thông báo Telegram Alert bất đồng bộ
    (async () => {
      const telegramMessage = `<b>💰 Yêu cầu nạp tiền mới</b>\n` +
        `• <b>Người dùng:</b> ${user.fullName} (${user.email})\n` +
        `• <b>Mã hóa đơn:</b> <code>${orderCode}</code>\n` +
        `• <b>Số tiền:</b> ${numericAmount.toLocaleString('vi-VN')} VNĐ\n` +
        `• <b>Hình thức:</b> ${method === 'payos' ? 'PayOS QR' : 'Chuyển khoản thủ công'}\n` +
        `• <b>Nội dung CK ngân hàng:</b> <code>${safeDescription}</code>`;
      await sendTelegramAlert(telegramMessage);
    })();

    return NextResponse.json({
      success: true,
      message: 'Deposit request created successfully',
      data: {
        orderCode,
        amount: numericAmount,
        bonus: bonusAmount,
        totalAmount: numericAmount + bonusAmount,
        status: 'pending',
        checkoutUrl,
        qrCode,
        invoiceId: savedInvoice._id
      }
    });

  } catch (error) {
    console.error('Deposit endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
