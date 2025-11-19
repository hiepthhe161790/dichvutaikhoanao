"use client";

import Link from "next/link";
import {
  EyeIcon,
  DocumentArrowDownIcon,
  DocumentChartBarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface HistoryItem {
  id: string;
  transactionId: string;
  product: string;
  quantity: number;
  paid: number;
  timeLeft: string;
  createdAt: string;
  account?: {
    username: string;
    password: string;
    email?: string;
  };
  accounts?: Array<{
    username: string;
    password: string;
    email?: string;
    emailPassword?: string;
    phone?: string;
  }>;
}

interface HistoryRowProps {
  item: HistoryItem;
  onViewDetail: (id: string) => void;
  onDownloadTxt: (id: string) => void;
  onDownloadExcel: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryRow({
  item,
  onViewDetail,
  onDownloadTxt,
  onDownloadExcel,
  onDelete,
}: HistoryRowProps) {
  return (
    <tr className="border-b border-gray-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-300 group">
      {/* # Column */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full group-hover:scale-150 transition-transform"></div>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{item.id}</span>
        </div>
      </td>

      {/* Transaction ID Column */}
      <td className="px-4 py-4">
        <div className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-700 rounded-lg inline-block border border-gray-200 dark:border-slate-600">
          <span className="text-gray-900 dark:text-gray-100 font-mono text-sm">
            {item.transactionId}
          </span>
        </div>
      </td>

      {/* Product Column */}
      <td className="px-4 py-4">
        <p className="text-blue-700 dark:text-blue-400 max-w-md hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
          {item.product}
        </p>
      </td>

      {/* Quantity Column */}
      <td className="px-4 py-4 text-center">
        <span className="px-3 py-1.5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-700 font-bold inline-block">
          {item.quantity}
        </span>
      </td>

      {/* Payment Column */}
      <td className="px-4 py-4 text-center">
        <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border-2 border-green-300 dark:border-green-700">
          <span className="text-green-600 dark:text-green-400 font-bold">
            {item.paid.toLocaleString("vi-VN")} đ
          </span>
        </div>
      </td>

      {/* Time Left Column */}
      <td className="px-4 py-4 text-center">
        <span className="px-3 py-1.5 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-700 font-bold inline-block">
          {item.timeLeft}
        </span>
      </td>

      {/* Created At Column */}
      <td className="px-4 py-4">
        <span className="text-gray-500 dark:text-gray-400 text-sm font-mono">
          {item.createdAt}
        </span>
      </td>

      {/* Actions Column */}
      <td className="px-4 py-4">
        <div className="flex gap-2 flex-wrap">
          {/* View Detail Button */}
          <button
            onClick={() => onViewDetail(item.id)}
            className="group/btn relative px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all duration-300 text-sm shadow-md hover:shadow-lg hover:scale-105 overflow-hidden"
            title="Xem thêm"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            <EyeIcon className="w-4 h-4 inline mr-1 relative z-10" />
            <span className="relative z-10">Xem</span>
          </button>

          {/* Download TXT Button */}
          {item.accounts && item.accounts.length > 0 && (
            <button
              onClick={() => onDownloadTxt(item.id)}
              className="group/btn relative px-3 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300 text-sm shadow-md hover:shadow-lg hover:scale-105 overflow-hidden"
              title="Tải TXT"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
              <DocumentArrowDownIcon className="w-4 h-4 inline mr-1 relative z-10" />
              <span className="relative z-10">TXT</span>
            </button>
          )}

          {/* Download Excel Button */}
          {item.accounts && item.accounts.length > 0 && (
            <button
              onClick={() => onDownloadExcel(item.id)}
              className="group/btn relative px-3 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg transition-all duration-300 text-sm shadow-md hover:shadow-lg hover:scale-105 overflow-hidden"
              title="Tải EXCEL"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
              <DocumentChartBarIcon className="w-4 h-4 inline mr-1 relative z-10" />
              <span className="relative z-10">Excel</span>
            </button>
          )}

          {/* Delete Button */}
          <button
            onClick={() => onDelete(item.id)}
            className="group/btn relative px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-lg transition-all duration-300 text-sm shadow-md hover:shadow-lg hover:scale-105 overflow-hidden"
            title="Xoá"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            <TrashIcon className="w-4 h-4 inline mr-1 relative z-10" />
            <span className="relative z-10">Xoá</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
