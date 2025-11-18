"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Transaction } from "../data/mockData";
import { toast } from "sonner";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function TransactionModal({ isOpen, onClose, transaction }: TransactionModalProps) {
  const [status, setStatus] = useState<"approved" | "rejected">("approved");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "approved") {
      toast.success("Đã duyệt giao dịch thành công");
    } else {
      toast.error("Đã từ chối giao dịch");
    }
    onClose();
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-900 dark:text-white">Duyệt giao dịch</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Transaction Info */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Mã giao dịch:</span>
              <span className="text-sm text-gray-900 dark:text-white font-mono font-medium">
                {transaction.transactionId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Người dùng:</span>
              <span className="text-sm text-gray-900 dark:text-white font-medium">
                {transaction.userName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Loại giao dịch:</span>
              <span className={`text-sm font-medium ${
                transaction.type === "deposit" ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"
              }`}>
                {transaction.type === "deposit" ? "Nạp tiền" : "Rút tiền"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Số tiền:</span>
              <span className="text-sm text-gray-900 dark:text-white font-bold">
                {transaction.amount.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Thời gian:</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {transaction.time}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Status Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="approved">Duyệt (Approved)</option>
                <option value="rejected">Từ chối (Rejected)</option>
              </select>
            </div>

            {/* Note Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ghi chú
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Nhập ghi chú (không bắt buộc)"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  status === "approved"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg text-white"
                    : "bg-gradient-to-r from-red-600 to-orange-600 hover:shadow-lg text-white"
                }`}
              >
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
