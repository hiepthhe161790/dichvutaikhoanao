"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ReportsData {
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  transactionsByType: Array<{ name: string; value: number; color: string }>;
  topUsers: Array<{
    id: string;
    rank: number;
    email: string;
    username: string;
    balance: number;
    role: string;
    totalSpent: number;
    totalPurchased: number;
  }>;
  monthlyStats: {
    month: number;
    year: number;
    total: number;
    completed: number;
    pending: number;
    failed: number;
    totalRevenue: number;
    totalBonus: number;
  };
}

export function ReportsPage() {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchReports = async (selectedMonth: number, selectedYear: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/reports?month=${selectedMonth}&year=${selectedYear}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reports data');
      }

      const result = await response.json();
      setReportsData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(month, year);
  }, []);

  const handleApplyFilter = () => {
    fetchReports(month, year);
  };

  // Top users by balance
  const topUsers = reportsData?.topUsers || [];

  if (loading && !reportsData) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-200 dark:bg-slate-700 rounded-2xl h-32 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-slate-700 rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-gray-900 dark:text-white mb-4">Bộ lọc báo cáo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tháng
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from(
                { length: year === new Date().getFullYear() ? new Date().getMonth() + 1 : 12 },
                (_, i) => i + 1
              ).map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Năm
            </label>
            <select
              value={year}
              onChange={(e) => {
                const newYear = parseInt(e.target.value);
                setYear(newYear);
                if (newYear === new Date().getFullYear() && month > new Date().getMonth() + 1) {
                  setMonth(new Date().getMonth() + 1);
                }
              }}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApplyFilter}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
            >
              {loading ? 'Đang tải...' : 'Áp dụng lọc'}
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-gray-900 dark:text-white mb-4">Doanh thu theo tháng</h3>
          {reportsData?.monthlyRevenue ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportsData.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => value.toLocaleString('vi-VN')}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Doanh thu (VNĐ)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : null}
        </div>

        {/* Transaction Types Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-gray-900 dark:text-white mb-4">Giao dịch theo loại</h3>
          {reportsData?.transactionsByType && reportsData.transactionsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportsData.transactionsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportsData.transactionsByType.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>

      {/* Top Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-900 dark:text-white">Top người dùng giao dịch nhiều nhất</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Xếp hạng theo số dư tài khoản
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Hạng
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Username
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Số dư
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Tổng chi tiêu
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Vai trò
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {topUsers.slice(0, 10).map((user: any, index: number) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl ${index === 0 ? "text-yellow-500" :
                          index === 1 ? "text-gray-400" :
                            index === 2 ? "text-orange-500" : ""
                        }`}>
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 dark:text-white font-medium">{user.username}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-900 dark:text-white font-bold">
                    {user.balance.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                    {user.totalSpent.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === "admin"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        : user.role === "staff"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                      {user.role.toUpperCase()}
                    </span>
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
