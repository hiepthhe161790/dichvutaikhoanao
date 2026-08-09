import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import User from '@/lib/models/User';
import Webhook from '@/lib/models/Webhook';
import { getTokenFromCookies } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';
import { calculateBonusPercentage } from '@/lib/utils/bonus-utils';
import { sendTelegramAlert } from '@/lib/notifications/telegram';
import { logAction } from '@/lib/utils/logger';
import axios from 'axios';

// Cấu hình Next.js Route Handler để tránh lưu đệm
export const dynamic = 'force-dynamic';

// Hàm kiểm tra quyền truy cập (chỉ cho phép Vercel Cron và Admin hệ thống)
async function checkAuth(req: NextRequest): Promise<boolean> {
  // 1. Kiểm tra Vercel Cron Token (Authorization: Bearer CRON_SECRET)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // 2. Kiểm tra token đăng nhập Admin trên Cookies (dành cho kích hoạt thủ công để debug)
  const token = getTokenFromCookies(req);
  if (token) {
    try {
      const decoded = verifyToken(token) as any;
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId).lean() as any;
        if (user && user.role === 'admin') {
          return true;
        }
      }
    } catch (err) {
      console.warn('[PayOS Reconcile Cron] Admin auth check failed:', err);
    }
  }

  return false;
}

// Xử lý logic đối soát hóa đơn PayOS
async function runReconciliation() {
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;

  if (!checksumKey || !clientId || !apiKey) {
    throw new Error('Cấu hình PayOS trên máy chủ chưa đầy đủ');
  }

  // Quét các hóa đơn PayOS đang ở trạng thái 'pending' được tạo trong vòng 7 ngày qua
  const pendingInvoices = await Invoice.find({
    status: 'pending',
    paymentMethod: 'payos',
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  console.log(`[PayOS Reconcile Cron] Tìm thấy ${pendingInvoices.length} hóa đơn PayOS đang chờ xử lý.`);
  
  const results = {
    checked: pendingInvoices.length,
    completed: 0,
    cancelled: 0,
    failed: 0,
    errors: 0,
    details: [] as any[]
  };

  for (const invoice of pendingInvoices) {
    try {
      console.log(`[PayOS Reconcile Cron] Đang kiểm tra hóa đơn orderCode ${invoice.orderCode}...`);
      
      // Gọi API đối tác PayOS để lấy thông tin liên kết thanh toán
      const payosRes = await axios.get(`https://api-merchant.payos.vn/v2/payment-requests/${invoice.orderCode}`, {
        headers: {
          'x-client-id': clientId,
          'x-api-key': apiKey
        },
        timeout: 10000 // giới hạn thời gian chờ 10 giây
      });

      if (payosRes.data && payosRes.data.code === '00' && payosRes.data.data) {
        const payosData = payosRes.data.data;
        const payosStatus = payosData.status; // PAID, PENDING, CANCELLED

        if (payosStatus === 'PAID') {
          // BẢO MẬT: Cập nhật trạng thái hóa đơn nguyên tử (findOneAndUpdate) để chống cộng tiền trùng lặp
          const updatedInvoice = await Invoice.findOneAndUpdate(
            { orderCode: invoice.orderCode, status: 'pending' },
            { $set: { status: 'completed', paymentDate: new Date() } },
            { new: true }
          );

          if (updatedInvoice) {
            // Cập nhật thành công — Cộng số dư ví cho người dùng
            const user = await User.findById(invoice.userId);
            if (user) {
              user.balance += invoice.totalAmount;
              user.totalSpent += invoice.amount;
              // Tính toán phần trăm thưởng nếu chưa được admin đặt thủ công
              if (!user.bonusPercentage || user.bonusPercentage === 0) {
                user.bonusPercentage = calculateBonusPercentage(invoice.amount);
              }
              await user.save();

              // Ghi audit log hệ thống
              await logAction({
                action: 'deposit_reconcile_cron',
                actor: user._id.toString(),
                actorRole: 'system',
                target: 'transaction',
                targetId: invoice._id.toString(),
                changes: [
                  { field: 'amount', oldValue: 0, newValue: invoice.amount },
                  { field: 'bonus', oldValue: 0, newValue: invoice.bonus },
                  { field: 'totalAmount', oldValue: 0, newValue: invoice.totalAmount }
                ],
                status: 'success'
              });

              // Gửi thông báo đến Telegram Alert ở background
              (async () => {
                const telegramMessage = `<b>✅ Đối soát nạp tiền thành công (Tự động qua Cron)</b>\n` +
                  `• <b>Người dùng:</b> ${user.fullName} (${user.email})\n` +
                  `• <b>Mã hóa đơn:</b> <code>${invoice.orderCode}</code>\n` +
                  `• <b>Số tiền nạp:</b> ${invoice.amount.toLocaleString('vi-VN')} VNĐ\n` +
                  `• <b>Tiền thưởng:</b> ${invoice.bonus.toLocaleString('vi-VN')} VNĐ\n` +
                  `• <b>Tổng nhận:</b> ${invoice.totalAmount.toLocaleString('vi-VN')} VNĐ\n` +
                  `<i>Trạng thái: Được đối soát thành công từ hệ thống Cronjob 5 phút.</i>`;
                await sendTelegramAlert(telegramMessage);
              })();

              results.completed++;
              results.details.push({ orderCode: invoice.orderCode, status: 'completed', amount: invoice.amount });

              // Tạo một tài liệu Webhook giả lập để khớp các dữ liệu báo cáo giao dịch sau này
              const firstTx = payosData.transactions?.[0] || {};
              const webhook = new Webhook({
                code: '00',
                desc: 'success',
                success: true,
                data: {
                  accountNumber: firstTx.accountNumber || '',
                  amount: payosData.amountPaid || invoice.amount,
                  description: firstTx.description || invoice.description,
                  reference: firstTx.reference || `RECONCILE-${invoice.orderCode}`,
                  transactionDateTime: firstTx.transactionDateTime || new Date().toISOString(),
                  orderCode: invoice.orderCode,
                  paymentLinkId: payosData.id
                },
                signature: 'reconciled_by_cron',
                isSignatureValid: true,
                status: 'completed'
              });
              await webhook.save().catch((e: any) => console.error('[PayOS Reconcile Cron] Lỗi lưu webhook log:', e));
            } else {
              console.error(`[PayOS Reconcile Cron] Không tìm thấy người dùng ${invoice.userId} cho hóa đơn ${invoice.orderCode}`);
              results.errors++;
            }
          } else {
            console.log(`[PayOS Reconcile Cron] Hóa đơn ${invoice.orderCode} đã được xử lý thành công trước đó bởi tiến trình khác.`);
          }
        } else if (payosStatus === 'CANCELLED' || payosStatus === 'EXPIRED') {
          // Cập nhật trạng thái thất bại cho hóa đơn nếu bị hủy trên PayOS
          const updatedInvoice = await Invoice.findOneAndUpdate(
            { orderCode: invoice.orderCode, status: 'pending' },
            { $set: { status: 'failed' } },
            { new: true }
          );
          if (updatedInvoice) {
            results.cancelled++;
            results.details.push({ orderCode: invoice.orderCode, status: 'failed' });
            console.log(`[PayOS Reconcile Cron] Hóa đơn ${invoice.orderCode} đã bị hủy trên PayOS, cập nhật thành failed.`);
          }
        } else {
          // Hóa đơn vẫn đang chờ thanh toán
          results.details.push({ orderCode: invoice.orderCode, status: 'still_pending' });
        }
      } else {
        console.warn(`[PayOS Reconcile Cron] PayOS trả về mã lỗi cho orderCode ${invoice.orderCode}:`, payosRes.data);
        results.errors++;
      }
    } catch (err: any) {
      console.error(`[PayOS Reconcile Cron] Lỗi khi đối soát hóa đơn ${invoice.orderCode}:`, err.response?.data || err.message);
      results.errors++;
      results.details.push({ orderCode: invoice.orderCode, status: 'error', error: err.message });
    }
  }

  return results;
}

// Handler GET
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const authorized = await checkAuth(req);
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const results = await runReconciliation();
    return NextResponse.json({ success: true, ...results });
  } catch (error: any) {
    console.error('[PayOS Reconcile Cron] GET Handler Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Handler POST
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const authorized = await checkAuth(req);
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const results = await runReconciliation();
    return NextResponse.json({ success: true, ...results });
  } catch (error: any) {
    console.error('[PayOS Reconcile Cron] POST Handler Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
