"use client";

import { useState } from "react";
import { BankStatusAlert } from "../components/BankStatusAlert";
import { PromotionTable } from "../components/PromotionTable";
import { DepositModal } from "../components/DepositModal";
import { ManualDepositModal } from "../components/ManualDepositModal";
import { toast } from "sonner";
import { CreditCardIcon, SparklesIcon, BuildingLibraryIcon } from "@heroicons/react/24/outline";
import { ProtectedRoute } from "@/lib/components/ProtectedRoute";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function DepositPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const { refreshBalance } = useAuthContext();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateInvoice = (amount: number) => {
    toast.success("Tạo hóa đơn thành công!", {
      description: `Số tiền: ${amount.toLocaleString("vi-VN")} VNĐ. Vui lòng chuyển khoản đúng nội dung.`,
      duration: 5000,
    });
    setIsModalOpen(false);
  };

  const handlePaymentSuccess = async () => {
    // Direct balance refresh from API
    console.log('💳 Payment success callback, refreshing balance...');
    try {
      await refreshBalance();
      console.log('✅ Balance refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing balance:', error);
      throw error;
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-4 lg:p-6 space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl blur opacity-50"></div>
            <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-xl shadow-lg">
              <CreditCardIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              Nạp Tiền Vào Tài Khoản
              <SparklesIcon className="w-6 h-6 text-yellow-500 animate-pulse" />
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Nạp tiền nhanh chóng và nhận khuyến mãi hấp dẫn
            </p>
          </div>
        </div>

        {/* Bank Status Alert */}
        <BankStatusAlert />

        {/* Promotion Table */}
        <div>
          <PromotionTable />
        </div>

        {/* Deposit by Invoice Section */}
        <div className="space-y-6">
        <div className="text-center space-y-2">
            <h2 className="text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
              <CreditCardIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Phương Thức Nạp Tiền
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Chọn phương thức nạp tiền phù hợp với bạn
            </p>
          </div>

          {/* Deposit Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* PayOS Method */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl shadow-xl border-2 border-purple-200 dark:border-purple-700/50 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-fuchsia-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-pink-600/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>

              <div className="relative space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg text-white font-bold text-2xl">
                    P
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      Nạp Tự Động
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-bold uppercase tracking-wider">
                        Khuyên Dùng
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Qua cổng PayOS</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-green-500">✓</span>
                    <span>Cộng tiền tự động siêu tốc 5s</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-green-500">✓</span>
                    <span>Quét mã QR tiện lợi</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-green-500">✓</span>
                    <span>Hỗ trợ mọi ngân hàng</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Manual Method */}
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl shadow-xl border-2 border-orange-200 dark:border-orange-700/50 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-amber-600/20 to-yellow-600/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>

              <div className="relative space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg text-white">
                    <BuildingLibraryIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Nạp Thủ Công
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Chuyển khoản trực tiếp</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-orange-500">!</span>
                    <span>Duyệt tay bởi Admin (5-15 phút)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-green-500">✓</span>
                    <span>Quét mã VietQR chuẩn xác</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-green-500">✓</span>
                    <span>Giải pháp dự phòng khi cổng lỗi</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-5 hover:shadow-lg transition-all group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="text-blue-900 dark:text-blue-200 mb-2">Nạp Tiền Nhanh</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Tự động cộng tiền sau 5-30 giây
              </p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-2xl p-5 hover:shadow-lg transition-all group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-emerald-400/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-3xl mb-3">🔒</div>
              <h4 className="text-green-900 dark:text-green-200 mb-2">An Toàn Tuyệt Đối</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Mã hóa SSL và bảo mật cao nhất
              </p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-2xl p-5 hover:shadow-lg transition-all group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-pink-400/10 to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-3xl mb-3">🎁</div>
              <h4 className="text-orange-900 dark:text-orange-200 mb-2">Khuyến Mãi Lớn</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Nhận thêm tới 5% khi nạp lớn
              </p>
            </div>
          </div>
        </div>

        {/* Deposit Modal (PayOS) */}
        <DepositModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onCreateInvoice={handleCreateInvoice}
          onPaymentSuccess={handlePaymentSuccess}
        />

        {/* Manual Deposit Modal (VietQR) */}
        <ManualDepositModal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
          onCreateInvoice={handleCreateInvoice}
        />
      </div>
    </ProtectedRoute>
  );
}
