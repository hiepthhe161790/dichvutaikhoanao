"use client";

import Link from "next/link";
import {
  EyeIcon,
  DocumentArrowDownIcon,
  DocumentChartBarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface HistoryItem {
  _id: string;
  transactionId: string;
  product: string;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  account?: {
    username: string;
    password: string;
    email?: string;
  };
}

interface HistoryRowProps {
  item: HistoryItem;
  onDownloadTxt: (id: string) => void;
  onDownloadExcel: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryRow({
  item,
  onDownloadTxt,
  onDownloadExcel,
  onDelete,
}: HistoryRowProps) {
  return (
    <tr className="border-b border-gray-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      {/* # Column */}
      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
        {item._id.toString().slice(-4).toUpperCase()}
      </td>

      {/* Transaction ID Column */}
      <td className="px-4 py-3">
        <span className="text-gray-900 dark:text-gray-100">
          {item.transactionId}
        </span>
      </td>

      {/* Product Column */}
      <td className="px-4 py-3">
        <p className="text-blue-700 dark:text-blue-400 max-w-md">
          {item.product}
        </p>
      </td>

      {/* Quantity Column */}
      <td className="px-4 py-3 text-center">
        <span className="text-gray-700 dark:text-gray-300">{item.quantity}</span>
      </td>

      {/* Payment Column */}
      <td className="px-4 py-3 text-center">
        <span className="text-green-600 dark:text-green-400">
          {item.totalPrice.toLocaleString("vi-VN")} đ
        </span>
      </td>

      {/* Status Column */}
      <td className="px-4 py-3 text-center">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          item.status === 'completed' 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
        }`}>
          {item.status === 'completed' ? 'Thành công' : 'Chờ xử lý'}
        </span>
      </td>

      {/* Created At Column */}
      <td className="px-4 py-3">
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {new Date(item.createdAt).toLocaleString("vi-VN")}
        </span>
      </td>

      {/* Actions Column */}
      <td className="px-4 py-4">
        <div className="flex gap-2 flex-wrap">
          {/* View Detail Button */}
          <Link
            href={`/history/${item._id}`}
            className="group/btn relative px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all duration-300 text-sm shadow-md hover:shadow-lg hover:scale-105 overflow-hidden"
            title="Xem chi tiết"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            <EyeIcon className="w-4 h-4 inline mr-1 relative z-10" />
            <span className="relative z-10">Xem</span>
          </Link>
          {/* Download TXT Button */}
          <button
            onClick={() => onDownloadTxt(item._id)}
            className="group/btn relative px-3 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300 text-sm shadow-md hover:shadow-lg hover:scale-105 overflow-hidden"
            title="Tải TXT"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            <DocumentArrowDownIcon className="w-4 h-4 inline mr-1 relative z-10" />
            <span className="relative z-10">TXT</span>
          </button>

          {/* Download Excel Button */}
          <button
            onClick={() => onDownloadExcel(item._id)}
            className="group/btn relative px-3 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg transition-all duration-300 text-sm shadow-md hover:shadow-lg hover:scale-105 overflow-hidden"
            title="Tải EXCEL"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            <DocumentChartBarIcon className="w-4 h-4 inline mr-1 relative z-10" />
            <span className="relative z-10">Excel</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(item._id)}
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
