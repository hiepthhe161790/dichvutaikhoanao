"use client";

import { StatCard } from "../components/StatCard";
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<UsersIcon className="w-7 h-7 text-blue-600" />}
          title="Tổng số người dùng"
          value="12,459"
          subtitle="+18% so với tháng trước"
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={<ClipboardDocumentListIcon className="w-7 h-7 text-green-600" />}
          title="Tổng đơn đặt lịch"
          value="8,234"
          subtitle="+12% so với tháng trước"
          color="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          icon={<ArrowDownTrayIcon className="w-7 h-7 text-purple-600" />}
          title="Tổng tiền nạp"
          value="1.2 tỷ"
          subtitle="+25% so với tháng trước"
          color="text-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatCard
          icon={<ArrowUpTrayIcon className="w-7 h-7 text-orange-600" />}
          title="Tổng tiền rút"
          value="850M"
          subtitle="+15% so với tháng trước"
          color="text-orange-600"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-gray-900 dark:text-white mb-4">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {[
              { text: "Người dùng mới đăng ký", time: "2 phút trước", color: "text-blue-600" },
              { text: "Đơn hàng mới", time: "5 phút trước", color: "text-green-600" },
              { text: "Yêu cầu rút tiền", time: "10 phút trước", color: "text-orange-600" },
              { text: "Giao dịch hoàn thành", time: "15 phút trước", color: "text-purple-600" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${activity.color.replace('text-', 'bg-')}`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{activity.text}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-gray-900 dark:text-white mb-4">Trạng thái hệ thống</h3>
          <div className="space-y-4">
            {[
              { label: "Server Status", value: "Online", color: "text-green-600", percent: 100 },
              { label: "Database", value: "Healthy", color: "text-green-600", percent: 98 },
              { label: "API Response", value: "Fast", color: "text-blue-600", percent: 95 },
              { label: "Uptime", value: "99.9%", color: "text-purple-600", percent: 99 },
            ].map((status, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{status.label}</span>
                  <span className={`text-sm font-medium ${status.color}`}>{status.value}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${status.color.replace('text-', 'bg-')}`}
                    style={{ width: `${status.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
