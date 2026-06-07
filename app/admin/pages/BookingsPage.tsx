"use client";

import { useState } from "react";
import { bookings } from "../data/mockData";
import { EyeIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

export function BookingsPage() {
  const [bookingList] = useState(bookings);
  const [showDemo, setShowDemo] = useState(false);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return badges[status as keyof typeof badges];
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: "Đang xử lý",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return texts[status as keyof typeof texts];
  };

  return (
    <div className="space-y-6">
      {!showDemo ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full mb-4">
            <WrenchScrewdriverIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tính năng đang phát triển</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            Module quản lý đơn đặt lịch hiện đang trong quá trình xây dựng và hoàn thiện. Bạn có thể xem trước giao diện mẫu của tính năng này.
          </p>
          <button
            onClick={() => setShowDemo(true)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Xem Demo
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 dark:text-white">Quản lý đơn đặt lịch</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Tổng số {bookingList.length} đơn đặt lịch
              </p>
            </div>
            <button
              onClick={() => setShowDemo(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Đóng Demo
            </button>
          </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Mã booking
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Tên khách hàng
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Dịch vụ
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Thời gian
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Ghi chú
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {bookingList.map((booking, index) => (
                <tr
                  key={booking.id}
                  className={`hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                    index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-gray-50/50 dark:bg-slate-800/50"
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="text-gray-900 dark:text-white font-mono font-medium">{booking.code}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{booking.customerName}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{booking.service}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{booking.time}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{booking.note}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
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
        </>
      )}
    </div>
  );
}
