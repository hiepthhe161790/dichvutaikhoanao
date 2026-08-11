"use client";

import { CheckCircleIcon, PhoneIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useSettingsContext } from "@/lib/context/SettingsContext";

export function BankStatusAlert() {
  const { settings, loading } = useSettingsContext();
  const isAutoOnline = settings?.enableAutoDeposit;
  const zaloPhone = settings?.platformPhone;
  const zaloLink = zaloPhone ? `https://zalo.me/${zaloPhone}` : "https://zalo.me";

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6 space-y-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
        {loading ? (
          <div className="w-5 h-5 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
        ) : isAutoOnline ? (
          <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
        ) : (
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        )}
        Lưu ý nạp tiền
        {loading ? (
          <span className="ml-auto w-24 h-5 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse"></span>
        ) : isAutoOnline ? (
          <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            HỆ THỐNG ONLINE
          </span>
        ) : (
          <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
            TỰ ĐỘNG BẢO TRÌ
          </span>
        )}
      </h3>

      {/* Instructions */}
      <div className="space-y-3 text-xs text-gray-600 dark:text-gray-400">
        <p className="flex items-start gap-2">
          <span className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0">✓</span>
          <span>Vui lòng chuyển khoản <strong className="text-green-700 dark:text-green-300 font-semibold">CHÍNH XÁC SỐ TIỀN</strong> và <strong className="text-green-700 dark:text-green-300 font-semibold">NỘI DUNG</strong> trong hóa đơn.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0">✓</span>
          <span>Hệ thống cộng tiền tự động sau <strong className="text-green-700 dark:text-green-300 font-semibold">5-30 giây</strong> khi giao dịch thành công.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0">✓</span>
          <span>Nếu sau 5 phút chưa được cộng tiền, vui lòng liên hệ bộ phận hỗ trợ.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0">✓</span>
          <span>Không chuyển khoản qua ví điện tử để tránh bị ghi sai nội dung.</span>
        </p>
      </div>

      {/* Zalo Support */}
      <a
        href={zaloLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-sm"
      >
        <PhoneIcon className="w-4 h-4" />
        Liên hệ hỗ trợ Zalo
      </a>

      {/* Warning Box */}
      <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl">
        <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
          <strong className="font-semibold">Cảnh báo:</strong> Chúng tôi chỉ hỗ trợ nạp qua chuyển khoản ngân hàng (PayOS & Thủ công). Không hỗ trợ nạp trực tiếp qua ví điện tử MOMO, ViettelPay hay ZaloPay.
        </p>
      </div>
    </div>
  );
}
