"use client";

import { useState } from "react";
import { transactions, Transaction } from "../data/mockData";
import { StatCard } from "../components/StatCard";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface PaymentsPageProps {
  onOpenTransactionModal: (transaction: Transaction) => void;
}

export function PaymentsPage({ onOpenTransactionModal }: PaymentsPageProps) {
  const [transactionList] = useState(transactions);

  // Calculate stats
  const totalDeposit = transactionList
    .filter(t => t.type === "deposit" && t.status === "approved")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdraw = transactionList
    .filter(t => t.type === "withdraw" && t.status === "approved")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const pendingCount = transactionList.filter(t => t.status === "pending").length;
  const completedCount = transactionList.filter(t => t.status === "approved").length;

  const getTypeBadge = (type: string) => {
    return type === "deposit"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return badges[status as keyof typeof badges];
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: "Đang xử lý",
      approved: "Đã duyệt",
      rejected: "Từ chối",
    };
    return texts[status as keyof typeof texts];
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<ArrowDownTrayIcon className="w-7 h-7 text-blue-600" />}
          title="Tổng nạp"
          value={`${(totalDeposit / 1000000).toFixed(1)}M`}
          subtitle="Đã được duyệt"
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={<ArrowUpTrayIcon className="w-7 h-7 text-orange-600" />}
          title="Tổng rút"
          value={`${(totalWithdraw / 1000000).toFixed(1)}M`}
          subtitle="Đã được duyệt"
          color="text-orange-600"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
        />
        <StatCard
          icon={<ClockIcon className="w-7 h-7 text-yellow-600" />}
          title="Đang xử lý"
          value={pendingCount.toString()}
          subtitle="Giao dịch chờ duyệt"
          color="text-yellow-600"
          bgColor="bg-yellow-50 dark:bg-yellow-900/20"
        />
        <StatCard
          icon={<CheckCircleIcon className="w-7 h-7 text-green-600" />}
          title="Đã hoàn thành"
          value={completedCount.toString()}
          subtitle="Giao dịch thành công"
          color="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/20"
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-900 dark:text-white">Danh sách giao dịch</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tổng số {transactionList.length} giao dịch
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  ID Giao dịch
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  User
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Loại giao dịch
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Số tiền
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Thời gian
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {transactionList.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                    index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-gray-50/50 dark:bg-slate-800/50"
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="text-gray-900 dark:text-white font-mono font-medium">
                      {transaction.transactionId}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{transaction.userName}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(transaction.type)}`}>
                      {transaction.type === "deposit" ? "Nạp tiền" : "Rút tiền"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-900 dark:text-white font-bold">
                    {transaction.amount.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(transaction.status)}`}>
                      {getStatusText(transaction.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{transaction.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => onOpenTransactionModal(transaction)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
