"use client";

import {
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface StatCard {
  title: string;
  value: string;
  icon: any;
  color: string;
  bgColor: string;
  change?: string;
}

const stats: StatCard[] = [
  {
    title: "Tổng sản phẩm",
    value: "4,892",
    icon: ShoppingBagIcon,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    change: "+12%",
  },
  {
    title: "Khách hàng",
    value: "1,234",
    icon: UserGroupIcon,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    change: "+8%",
  },
  {
    title: "Doanh thu tháng",
    value: "45.2M đ",
    icon: CurrencyDollarIcon,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    change: "+23%",
  },
  {
    title: "Đơn hàng",
    value: "892",
    icon: ChartBarIcon,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    change: "+15%",
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-gray-900 dark:text-gray-100 mb-2">
                  {stat.value}
                </p>
                {stat.change && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    {stat.change} so với tháng trước
                  </span>
                )}
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
