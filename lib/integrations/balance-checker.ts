import { sendTelegramAlert } from '@/lib/notifications/telegram';
import { apiEngine } from './engine';
import Provider from '@/lib/models/Provider';
import type { IProviderConfig } from './types';
import { connectDB } from '@/lib/db';

/**
 * Check balance of an external provider asynchronously and send Telegram alert if low.
 * This runs in the background and does not block the user response.
 */
export async function checkAndAlertLowBalance(providerId: string): Promise<void> {
  try {
    await connectDB();
    const providerDoc = await Provider.findById(providerId);
    if (!providerDoc || providerDoc.status !== 'active') return;

    // Chuyển doc sang config structure
    const providerConfig = providerDoc.toObject() as unknown as IProviderConfig;
    if (!providerConfig.endpoints.getProfile) {
      console.log(`[BalanceChecker] Provider ${providerDoc.name} does not have getProfile endpoint configured.`);
      return;
    }

    // Lấy số dư mới nhất từ API đối tác ngoài
    const connResult = await apiEngine.testConnection(providerConfig);
    if (!connResult.ok || connResult.balance === undefined) {
      console.warn(`[BalanceChecker] Failed to fetch balance for provider ${providerDoc.name}: ${connResult.error}`);
      return;
    }

    // Cập nhật số dư vào DB
    providerDoc.lastKnownBalance = connResult.balance;
    await providerDoc.save();

    // Kiểm tra và cảnh báo số dư thấp
    const alertLimit = providerConfig.lowBalanceAlert || 100000; // Mặc định cảnh báo ở mức 100k VND
    if (connResult.balance < alertLimit) {
      const message = 
        `⚠️ <b>CẢNH BÁO: Số dư đối tác thấp</b>\n` +
        `• Nhà cung cấp: <b>${providerDoc.name}</b>\n` +
        `• Số dư hiện tại: <pre>${connResult.balance.toLocaleString('vi-VN')} đ</pre>\n` +
        `• Hạn mức cảnh báo: <pre>${alertLimit.toLocaleString('vi-VN')} đ</pre>\n` +
        `👉 Vui lòng nạp thêm tiền để tránh gián đoạn dịch vụ đại lý/reseller!`;
      
      await sendTelegramAlert(message);
    }
  } catch (error) {
    console.error('[BalanceChecker] Error checking balance:', error);
  }
}
