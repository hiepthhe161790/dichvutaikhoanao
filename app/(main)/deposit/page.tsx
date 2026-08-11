"use client";

import { useState } from "react";
import { BankStatusAlert } from "./components/BankStatusAlert";
import { PromotionTable } from "./components/PromotionTable";
import { DepositModal } from "./components/DepositModal";
import { ManualDepositModal } from "./components/ManualDepositModal";
import { toast } from "sonner";
import { CreditCardIcon, SparklesIcon, BuildingLibraryIcon, BoltIcon, LockClosedIcon, GiftIcon } from "@heroicons/react/24/outline";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useSettingsContext } from "@/lib/context/SettingsContext";
import { ProtectedRoute } from "@/lib/components/ProtectedRoute";
import { useEffect } from "react";

export default function DepositPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const { refreshBalance } = useAuthContext();
  const { settings, loading, refreshSettings } = useSettingsContext();

  useEffect(() => {
    refreshSettings();
  }, []);

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
            <h1 className="text-gray-900 dark:text-gray-100 flex items-center gap-2 flex-wrap">
              Nạp Tiền Vào Tài Khoản
              {loading ? (
                <span className="w-24 h-5 bg-gray-100 dark:bg-slate-800 rounded-full animate-pulse"></span>
              ) : settings?.enableAutoDeposit ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  CỔNG NẠP ONLINE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                  TỰ ĐỘNG BẢO TRÌ
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Nạp tiền nhanh chóng và nhận khuyến mãi hấp dẫn
            </p>
          </div>
        </div>

        {/* 2 Columns Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3 width) - Actions & Tables */}
          <div className="lg:col-span-2 space-y-8">
            {/* Deposit by Invoice Section */}
            <div className="space-y-6">
              <div className="text-center md:text-left space-y-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Phương Thức Nạp Tiền
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chọn phương thức nạp tiền phù hợp với bạn
                </p>
              </div>

              {/* Deposit Methods Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* PayOS Button */}
                {loading ? (
                  <div className="h-48 bg-gray-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
                ) : settings?.enableAutoDeposit ? (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl shadow-xl border border-purple-200 dark:border-purple-700/50 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden text-left"
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
                          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Thanh toán tự động qua cổng PayOS</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Hỗ trợ quét mã QR ngân hàng cực nhanh. Tiền vào tài khoản tự động sau 10-30 giây khi giao dịch thành công.
                      </p>

                      <div className="flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-2 transition-transform">
                        Bắt đầu nạp &rarr;
                      </div>
                    </div>
                  </button>
                ) : null}

                {/* Manual Bank Transfer Method */}
                {loading ? (
                  <div className="h-48 bg-gray-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
                ) : settings?.enableManualDeposit ? (
                  <button
                    onClick={() => setIsManualModalOpen(true)}
                    className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl shadow-xl border border-orange-200 dark:border-orange-700/50 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden text-left"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-amber-600/20 to-yellow-600/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>

                    <div className="relative space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <BuildingLibraryIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nạp Thủ Công</h3>
                          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Chuyển khoản VietQR nội dung chỉ định</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Chuyển khoản trực tiếp tới tài khoản ngân hàng admin qua mã QR chỉ định nội dung. Admin duyệt đơn sau 1-5 phút.
                      </p>

                      <div className="flex items-center text-sm font-semibold text-orange-600 dark:text-orange-400 group-hover:translate-x-2 transition-transform">
                        Bắt đầu nạp &rarr;
                      </div>
                    </div>
                  </button>
                ) : null}
              </div>
            </div>

            {/* Promotion Table */}
            <div>
              <PromotionTable />
            </div>
          </div>

          {/* Right Column (1/3 width) - Sidebar Guidelines & Warnings */}
          <div className="space-y-6">
            <BankStatusAlert />
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 hover:shadow-lg transition-all group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-indigo-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <BoltIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
              <h4 className="text-blue-900 dark:text-blue-200 mb-2">Tự Động & Siêu Tốc</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Xử lý giao dịch nạp tiền 24/7 chỉ trong vài giây
              </p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 hover:shadow-lg transition-all group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-emerald-400/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <LockClosedIcon className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
              <h4 className="text-green-900 dark:text-green-200 mb-2">An Toàn Tuyệt Đối</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Mã hóa SSL và bảo mật cao nhất
              </p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5 hover:shadow-lg transition-all group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-pink-400/10 to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <GiftIcon className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
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
