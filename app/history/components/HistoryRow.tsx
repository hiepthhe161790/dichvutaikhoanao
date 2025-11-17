"use client";

import { HistoryItem } from "../data";
import {
  EyeIcon,
  DocumentArrowDownIcon,
  DocumentChartBarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface HistoryRowProps {
  item: HistoryItem;
  onViewDetail: (id: number) => void;
  onDownloadTxt: (id: number) => void;
  onDownloadExcel: (id: number) => void;
  onDelete: (id: number) => void;
}

export function HistoryRow({
  item,
  onViewDetail,
  onDownloadTxt,
  onDownloadExcel,
  onDelete,
}: HistoryRowProps) {
  return (
    <tr className="border-b border-gray-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      {/* # Column */}
      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{item.id}</td>

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
          {item.paid.toLocaleString("vi-VN")} đ
        </span>
      </td>

      {/* Time Left Column */}
      <td className="px-4 py-3 text-center">
        <span className="text-red-600 dark:text-red-400">{item.timeLeft}</span>
      </td>

      {/* Created At Column */}
      <td className="px-4 py-3">
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {item.createdAt}
        </span>
      </td>

      {/* Actions Column */}
      <td className="px-4 py-3">
        <div className="flex gap-2 flex-wrap">
          {/* View Detail Button */}
          <button
            onClick={() => onViewDetail(item.id)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
            title="Xem thêm"
          >
            <EyeIcon className="w-4 h-4 inline mr-1" />
            Xem thêm
          </button>

          {/* Download TXT Button */}
          <button
            onClick={() => onDownloadTxt(item.id)}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
            title="Tải TXT"
          >
            <DocumentArrowDownIcon className="w-4 h-4 inline mr-1" />
            TXT
          </button>

          {/* Download Excel Button */}
          <button
            onClick={() => onDownloadExcel(item.id)}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm"
            title="Tải EXCEL"
          >
            <DocumentChartBarIcon className="w-4 h-4 inline mr-1" />
            EXCEL
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(item.id)}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors text-sm"
            title="Xoá"
          >
            <TrashIcon className="w-4 h-4 inline mr-1" />
            Xoá
          </button>
        </div>
      </td>
    </tr>
  );
}
