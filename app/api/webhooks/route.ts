
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Webhook from '@/lib/models/Webhook';
import Invoice from '@/lib/models/Invoice';
import User from '@/lib/models/User';
import crypto from 'crypto';
import { webhookLimiter, getClientIP } from '@/lib/rate-limiter';
import { calculateBonusPercentage } from '@/lib/utils/bonus-utils';
import { redis, isRedisEnabled } from '@/lib/redis';
import { sendTelegramAlert } from '@/lib/notifications/telegram';
import { logAction } from '@/lib/utils/logger';



interface WebhookRequestData {
  code?: string;
  desc?: string;
  success?: boolean;
  signature?: string; // Add signature at root level
  data: {
    accountNumber: string;
    amount: number;
    description: string;
    reference: string;
    transactionDateTime: string;
    virtualAccountNumber?: string;
    counterAccountBankId?: string;
    counterAccountBankName?: string;
    counterAccountName?: string;
    counterAccountNumber?: string;
    virtualAccountName?: string;
    currency?: string;
    orderCode?: string | number; // Support both string and number for int64
    paymentLinkId?: string;
    code?: string;
    desc?: string;
  };
}

// Verify PayOS webhook signature
function verifyWebhookSignature(webhookData: WebhookRequestData): boolean {
  try {
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    if (!checksumKey) {
      console.warn('[Webhook] PAYOS_CHECKSUM_KEY not configured');
      return false;
    }

    const signature = webhookData.signature;
    if (!signature) {
      console.warn('[Webhook] No signature provided');
      return false;
    }

    // Build data string for signature verification (same order as PayOS docs)
    const dataString = `amount=${webhookData.data.amount}&description=${webhookData.data.description}&orderCode=${webhookData.data.orderCode}&reference=${webhookData.data.reference}&transactionDateTime=${webhookData.data.transactionDateTime}&accountNumber=${webhookData.data.accountNumber}`;
    
    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', checksumKey)
      .update(dataString)
      .digest('hex');

    const isValid = signature === expectedSignature;
    if (!isValid) {
      console.warn('[Webhook] Signature mismatch!', {
        received: signature.substring(0, 16) + '...',
        expected: expectedSignature.substring(0, 16) + '...'
      });
    }

    return isValid;
  } catch (error) {
    console.error('[Webhook] Signature verification error:', error);
    return false;
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const description: string | null = searchParams.get('description');
    const amount: string | null = searchParams.get('amount');
    const orderCode: string | null = searchParams.get('orderCode');
    const page: string | null = searchParams.get('page');
    const limitParam: string | null = searchParams.get('limit');

    let query: any = {};
    let limit: number = 10;
    let skip: number = 0;

    // If description and amount provided, search for specific transaction (VietQR)
    if (description && amount) {
      query = {
        'data.description': { $regex: description, $options: "i" },
        'data.amount': parseInt(amount)
      };
      limit = 5;
    }
    // If orderCode provided, check Redis cache first
    else if (orderCode) {
      if (isRedisEnabled && redis) {
        try {
          const cachedStatus = await redis.get<string>(`payment-status:${orderCode}`);
          if (cachedStatus === 'done') {
            return NextResponse.json({
              success: true,
              data: "done",
              webhooks: []
            });
          }
        } catch (redisError) {
          console.error('[Webhook] Redis cache get error:', redisError);
        }
      }

      query = {
        'data.orderCode': parseInt(orderCode)
      };
      limit = 1;
    }
    else {
      // Handle pagination for list view
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limitParam ? parseInt(limitParam) : 10;
      limit = Math.min(limitNum, 100);
      skip = (pageNum - 1) * limit;
    }

    const webhooks = await Webhook.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // If searching for specific transaction, return simplified response
    if ((description && amount) || orderCode) {
      if (webhooks.length > 0) {
        const status = "done";
        
        return NextResponse.json({
          success: true,
          data: "done",
          webhooks: webhooks
        });
      } else {
        return NextResponse.json({
          success: true,
          data: "none"
        });
      }
    }

    // Regular list response with pagination info
    const total = await Webhook.countDocuments(query);
    return NextResponse.json({
      success: true,
      data: webhooks,
      pagination: {
        page: page ? parseInt(page) : 1,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    // Rate limit check
    const clientIP = getClientIP(req);
    const limitKey = `webhook-${clientIP}`;

    const isAllowed = await webhookLimiter.isAllowed(limitKey);
    if (!isAllowed) {
      const resetTime = Math.ceil(((await webhookLimiter.getResetTime(limitKey)) - Date.now()) / 1000);
      return NextResponse.json(
        { 
          success: false,
          error: 'Webhook rate limit exceeded'
        },
        { 
          status: 429,
          headers: { 'Retry-After': resetTime.toString() }
        }
      );
    }

    const webhookData: WebhookRequestData = await req.json();

    // Check if it is a PayOS webhook confirmation/test request
    if (!webhookData.data || 
        webhookData.data === null ||
        webhookData.data.amount === undefined ||
        webhookData.data.orderCode === undefined ||
        webhookData.data?.description === 'Ma xac thuc webhook' || 
        webhookData.data?.description?.includes('Ma xac thuc')) {
      console.log('[Webhook] Received webhook confirmation/test request. Approving automatically.');
      return NextResponse.json({
        success: true,
        message: 'Webhook URL confirmed successfully'
      });
    }

    // Verify webhook signature
    const isSignatureValid = verifyWebhookSignature(webhookData);
    if (!isSignatureValid) {
      console.error('[Webhook] Invalid webhook signature detected - rejecting request');
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Check if webhook already exists (prevent duplicates)
    const existingWebhook = await Webhook.findOne({
      'data.reference': webhookData.data.reference,
      'data.amount': webhookData.data.amount
    });

    if (existingWebhook) {
      return NextResponse.json({
        success: true,
        message: "Webhook already exists",
        data: existingWebhook
      });
    }

    // Create webhook document with signature at root level
    const webhook = new Webhook({
      code: webhookData.code || '00',
      desc: webhookData.desc || 'success',
      success: webhookData.success !== undefined ? webhookData.success : true,
      data: webhookData.data, // Store the data object from PayOS
      signature: webhookData.signature, // Move signature to root level
      // Track signature validity (for monitoring/debugging)
      isSignatureValid: isSignatureValid,
    });

    const savedWebhook = await webhook.save();

    // Check if payment was successful (code "00" or success true)
    const isPaymentSuccessful = (webhookData.code === '00' || webhookData.code === '0') && 
                               (webhookData.success !== false);

    if (isPaymentSuccessful && webhookData.data.orderCode) {
      
      try {
        const orderCode = parseInt(webhookData.data.orderCode.toString());
        
        // 1. Find and update invoice
        const invoice = await Invoice.findOne({ orderCode });
        if (invoice && invoice.status === 'pending') {
          // Verify paid amount matches invoice amount!
          if (webhookData.data.amount !== invoice.amount) {
            console.error(`[Webhook] Paid amount mismatch! Webhook amount: ${webhookData.data.amount}, Invoice amount: ${invoice.amount}`);
            
            // Update invoice status to failed due to mismatch
            invoice.status = 'failed';
            await invoice.save();
            
            await Webhook.findByIdAndUpdate(savedWebhook._id, { 
              status: 'expired',
              updatedAt: new Date()
            });
            
            return NextResponse.json({
              success: false,
              error: "Payment amount mismatch"
            }, { status: 400 });
          }

          invoice.status = 'completed';
          invoice.paymentDate = new Date();
          await invoice.save();
          
          // 2. Update user balance and totalSpent
          const user = await User.findById(invoice.userId);
          if (user) {
            user.balance += invoice.totalAmount; // Add total amount (amount + bonus)
            user.totalSpent += invoice.amount; // Add only the payment amount to totalSpent
            // Only auto-assign bonusPercentage if admin hasn't manually set it yet
            if (!user.bonusPercentage || user.bonusPercentage === 0) {
              user.bonusPercentage = calculateBonusPercentage(invoice.amount);
            }
            // Otherwise keep the admin-configured value
            await user.save();

            // Ghi audit log nạp tiền thành công qua webhook
            await logAction({
              action: 'deposit_webhook',
              actor: user._id.toString(),
              actorRole: 'customer',
              target: 'transaction',
              targetId: invoice._id.toString(),
              changes: [
                { field: 'amount', oldValue: 0, newValue: invoice.amount },
                { field: 'bonus', oldValue: 0, newValue: invoice.bonus },
                { field: 'totalAmount', oldValue: 0, newValue: invoice.totalAmount }
              ],
              status: 'success'
            });

            // Bắn thông báo Telegram Alert bất đồng bộ
            (async () => {
              const telegramMessage = `<b>✅ Nạp tiền thành công (Tự động)</b>\n` +
                `• <b>Người dùng:</b> ${user.fullName} (${user.email})\n` +
                `• <b>Mã hóa đơn:</b> <code>${invoice.orderCode}</code>\n` +
                `• <b>Số tiền nạp:</b> ${invoice.amount.toLocaleString('vi-VN')} VNĐ\n` +
                `• <b>Tiền thưởng:</b> ${invoice.bonus.toLocaleString('vi-VN')} VNĐ\n` +
                `• <b>Tổng nhận:</b> ${invoice.totalAmount.toLocaleString('vi-VN')} VNĐ`;
              await sendTelegramAlert(telegramMessage);
            })();
          } else {
            console.error(`[Webhook] User not found for invoice: ${invoice.userId}`);
          }
          
          // 3. Update webhook status to completed
          await Webhook.findByIdAndUpdate(savedWebhook._id, { 
            status: 'completed',
            updatedAt: new Date()
          });

          // Update Redis payment cache
          if (isRedisEnabled && redis) {
            try {
              await redis.set(`payment-status:${orderCode}`, 'done', { ex: 3600 }); // cache for 1 hour
            } catch (redisError) {
              console.error('[Webhook] Redis cache set error:', redisError);
            }
          }
        } else {
          console.warn(`[Webhook] Invoice ${orderCode} not found or not in pending state`);
        }
      } catch (updateError) {
        console.error('[Webhook] Update database error:', updateError);
      }
    } else {
    }

    return NextResponse.json({
      success: true,
      message: "Webhook received successfully",
      data: savedWebhook
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
