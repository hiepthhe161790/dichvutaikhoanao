"use client";

import { HistoryRow } from "./HistoryRow";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

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
}

interface HistoryTableProps {
  data: HistoryItem[];
  onViewDetail: (id: string) => void;
  onDownloadTxt: (id: string) => void;
  onDownloadExcel: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryTable({
  data,
  onViewDetail,
  onDownloadTxt,
  onDownloadExcel,
  onDelete,
}: HistoryTableProps) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]">
            <tr className="border-b-2 border-blue-500/30">
              <th className="px-4 py-4 text-left text-white">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  #
                </div>
              </th>
              <th className="px-4 py-4 text-left text-white">
                Mã giao dịch
              </th>
              <th className="px-4 py-4 text-left text-white">
                Sản phẩm
              </th>
              <th className="px-4 py-4 text-center text-white">
                Số lượng
              </th>
              <th className="px-4 py-4 text-center text-white">
                Thanh toán
              </th>
              <th className="px-4 py-4 text-center text-white">
                Thời gian còn lại
              </th>
              <th className="px-4 py-4 text-left text-white">
                Ngày tạo
              </th>
              <th className="px-4 py-4 text-left text-white">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📋</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Không có dữ liệu lịch sử mua hàng
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  onViewDetail={onViewDetail}
                  onDownloadTxt={onDownloadTxt}
                  onDownloadExcel={onDownloadExcel}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-750">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Hiển thị <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-bold">1</span> đến{" "}
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-bold">{data.length}</span> của{" "}
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-bold">{data.length}</span> kết quả
          </div>
          <div className="flex gap-2">
            <button className="group px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:text-white border-2 border-gray-200 dark:border-slate-600 hover:border-blue-500 transition-all duration-300 text-sm shadow-md hover:shadow-lg flex items-center gap-1">
              <ChevronLeftIcon className="w-4 h-4" />
              Trước
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg border-2 border-blue-400 transition-all duration-300 text-sm shadow-lg hover:shadow-xl hover:scale-105">
              1
            </button>
            <button className="group px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:text-white border-2 border-gray-200 dark:border-slate-600 hover:border-blue-500 transition-all duration-300 text-sm shadow-md hover:shadow-lg flex items-center gap-1">
              Sau
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
