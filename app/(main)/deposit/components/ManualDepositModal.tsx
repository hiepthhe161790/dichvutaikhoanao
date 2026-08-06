"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, BanknotesIcon, GiftIcon, ReceiptPercentIcon, CheckCircleIcon, BuildingLibraryIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import VietQRCode from "@/app/components/VietQRCode";
import { useAuth } from "@/lib/hooks/useAuth";
import { calculateBonusPercentage } from "@/lib/utils/bonus-utils";

interface ManualDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateInvoice: (amount: number) => void;
  prefilledAmount?: number;
}

export function ManualDepositModal({ isOpen, onClose, onCreateInvoice, prefilledAmount }: ManualDepositModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>("");
  const [numericAmount, setNumericAmount] = useState<number>(0);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [isManualSubmitted, setIsManualSubmitted] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch active bank accounts for manual payment
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setIsLoadingBanks(true);
        const res = await fetch("/api/admin/bank-accounts");
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setBankAccounts(data.data);
          setSelectedBankId(data.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch bank accounts:", err);
      } finally {
        setIsLoadingBanks(false);
      }
    };
    if (isOpen) {
      fetchBanks();
    }
  }, [isOpen]);

  const tierBonusPercent = calculateBonusPercentage(numericAmount);
  const adminBonusPercent = user?.bonusPercentage || 0;
  const bonusPercent = Math.max(tierBonusPercent, adminBonusPercent);
  
  const bonusAmount = (numericAmount * bonusPercent) / 100;
  const totalReceived = numericAmount + bonusAmount;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setAmount(value);
    setNumericAmount(parseInt(value) || 0);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("vi-VN");
  };

  const handleGenerateQR = async () => {
    if (numericAmount >= 10000 && selectedBankId) {
      try {
        setIsSubmitting(true);
        const response = await fetch("/api/user/balance/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: numericAmount,
            method: "manual",
            bankAccountId: selectedBankId
          })
        });
        const resData = await response.json();
        
        if (resData.success && resData.data) {
          setOrderCode(resData.data.orderCode.toString());
        } else {
          throw new Error(resData.error || "Lỗi tạo yêu cầu nạp tiền");
        }
      } catch (error) {
        console.error("Error creating manual deposit request:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleManualSubmit = async () => {
    if (numericAmount < 10000 || !selectedBankId || !orderCode) return;
    
    // Hóa đơn đã được lưu ở DB khi tạo QR. Bấm submit chỉ xác nhận hiển thị ở Client.
    setIsManualSubmitted(true);
    onCreateInvoice(numericAmount);
  };

  const handleClose = () => {
    setAmount("");
    setNumericAmount(0);
    setOrderCode(null);
    setIsManualSubmitted(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (prefilledAmount) {
        setAmount(prefilledAmount.toString());
        setNumericAmount(prefilledAmount);
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, prefilledAmount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-slate-700 w-full max-w-lg animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 px-6 py-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-amber-400/20 to-yellow-400/20 animate-shimmer"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <BuildingLibraryIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white">Nạp Tiền Thủ Công</h3>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Payment Method Info */}
          <div className="flex items-center justify-center p-3 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-xl">
            <div className="flex items-center gap-2">
              <BuildingLibraryIcon className="w-6 h-6 text-orange-600" />
              <span className="text-orange-700 dark:text-orange-300 font-medium text-sm">
                Duyệt thủ công bởi Admin (5-15 phút)
              </span>
            </div>
          </div>

          {/* Bank Selection */}
          {!orderCode && (
            <div className="space-y-3">
              <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium">
                Chọn ngân hàng chuyển đến
              </label>
              {isLoadingBanks ? (
                <div className="h-14 animate-pulse bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
              ) : bankAccounts.length > 0 ? (
                <select
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium"
                >
                  {bankAccounts.map((bank) => (
                    <option key={bank._id} value={bank._id}>
                      {bank.bankName} - {bank.accountNumber} ({bank.accountName})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">
                  Hệ thống chưa cấu hình tài khoản ngân hàng.
                </div>
              )}
            </div>
          )}

          {/* Amount input */}
          {!orderCode && (
            <div className="space-y-3">
              <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium">
                Số tiền muốn nạp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Nhập số tiền (VND)"
                  className="w-full px-5 py-4 border-2 border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600 focus:border-orange-500 text-lg font-medium"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                  VNĐ
                </div>
              </div>
              {amount && (
                <p className="text-sm text-gray-600 dark:text-gray-400 pl-2">
                  = {formatNumber(numericAmount)} đồng
                </p>
              )}
            </div>
          )}

          {/* Quick amount buttons */}
          {!orderCode && (
            <div className="grid grid-cols-3 gap-2">
              {[50000, 100000, 200000, 500000, 1000000, 2000000].map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => {
                    setAmount(quickAmount.toString());
                    setNumericAmount(quickAmount);
                  }}
                  className="px-3 py-2 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {formatNumber(quickAmount)}
                </button>
              ))}
            </div>
          )}

          {/* QR Code Display (Manual VietQR) */}
          {orderCode && (
            <div className="space-y-4 p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl border-2 border-gray-200 dark:border-slate-700">
              {isManualSubmitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircleIcon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    Đã Gửi Yêu Cầu
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Vui lòng chờ Admin kiểm tra và cộng tiền vào tài khoản của bạn (thường mất 5-15 phút).
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                      Quét mã để chuyển khoản
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Vui lòng chuyển đúng số tiền và nội dung bên dưới
                    </p>
                  </div>
                  
                  <div className="flex justify-center bg-white p-2 rounded-xl">
                    {(() => {
                      const bank = bankAccounts.find(b => b._id === selectedBankId);
                      if (!bank) return null;
                      return (
                        <VietQRCode
                          bankCode={bank.bankCode}
                          accountNumber={bank.accountNumber}
                          accountName={bank.accountName}
                          amount={numericAmount}
                          description={`NAP TIEN ${orderCode}`}
                          size="compact2"
                          className="w-full max-w-xs"
                        />
                      );
                    })()}
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Lưu ý quan trọng:</strong>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                          <li>Chỉ click nút bên dưới <strong>SAU KHI</strong> bạn đã chuyển khoản thành công.</li>
                          <li>Admin sẽ đối soát thủ công nên có thể mất vài phút.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Payment info */}
          <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-200 dark:border-slate-700">
            {/* Amount to pay */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2">
                <ReceiptPercentIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Số tiền cần thanh toán:
                </span>
              </div>
              <span className="text-blue-700 dark:text-blue-400 font-bold">
                {formatNumber(numericAmount)} đ
              </span>
            </div>

            {/* Bonus info */}
            {bonusPercent > 0 && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-700">
                <div className="flex items-center gap-2">
                  <GiftIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Khuyến mãi (+{bonusPercent}%):
                  </span>
                </div>
                <span className="text-orange-700 dark:text-orange-400 font-bold">
                  +{formatNumber(bonusAmount)} đ
                </span>
              </div>
            )}

            {/* Total received */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-lg">
              <div className="flex items-center gap-2">
                <BanknotesIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Số tiền nhận được:
                </span>
              </div>
              <span className="text-green-700 dark:text-green-400 font-bold text-lg">
                {formatNumber(totalReceived)} đ
              </span>
            </div>
          </div>

          {/* Minimum amount note */}
          {numericAmount > 0 && numericAmount < 10000 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                ⚠️ Số tiền nạp tối thiểu là 10.000 VNĐ
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Đóng
          </button>
          
          {!isManualSubmitted ? (
            orderCode ? (
              <button
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Đang xử lý..." : "Tôi Đã Chuyển Khoản"}
              </button>
            ) : (
              <button
                onClick={handleGenerateQR}
                disabled={numericAmount < 10000 || !selectedBankId}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  numericAmount >= 10000 && selectedBankId
                    ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                    : "bg-gray-300 dark:bg-slate-800 text-gray-500 dark:text-gray-600 cursor-not-allowed"
                }`}
              >
                Tạo mã chuyển khoản
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
