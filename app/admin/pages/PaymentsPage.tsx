"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { StatCard } from "../components/StatCard";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Transaction } from "../data/mockData";

interface APITransaction {
  id: string;
  transactionId: string;
  userName: string;
  userEmail: string;
  type: string;
  amount: number;
  bonus: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed';
  time: string;
  date: string;
  description: string;
  orderCode: string;
  paymentMethod?: 'payos' | 'manual';
}

interface PaymentsPageProps {
  onOpenTransactionModal?: (transaction: Transaction) => void;
}

interface PaymentsData {
  transactions: APITransaction[];
  stats: {
    totalDeposit: number;
    totalBonus: number;
    totalWithdraw: number;
    pendingCount: number;
    completedCount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function PaymentsPage({ onOpenTransactionModal }: PaymentsPageProps) {
  const [paymentsData, setPaymentsData] = useState<PaymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  const initialMethod = searchParams.get('method') || '';

  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [methodFilter, setMethodFilter] = useState<string>(initialMethod);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchPayments = async (selectedPage: number, selectedLimit: number, status?: string, search?: string) => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.append('page', selectedPage.toString());
      query.append('limit', selectedLimit.toString());
      if (status) {
        query.append('status', status);
      }
      if (methodFilter) {
        query.append('method', methodFilter);
      }
      if (startDate) {
        query.append('startDate', startDate);
      }
      if (endDate) {
        query.append('endDate', endDate);
      }
      if (search !== undefined) {
        if (search) query.append('search', search);
      } else if (searchQuery) {
        query.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/payments?${query}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments data');
      }

      const result = await response.json();
      setPaymentsData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Payments fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1, limit, initialStatus || undefined);
  }, [initialStatus, initialMethod]);

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
    fetchPayments(1, limit, newStatus || undefined, searchQuery);
  };

  const handleMethodFilter = (method: string) => {
    setMethodFilter(method);
    setPage(1);
    fetchPayments(1, limit, statusFilter || undefined, searchQuery);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPayments(newPage, limit, statusFilter || undefined, searchQuery);
  };

  // Debounced search and date filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPayments(1, limit, statusFilter || undefined, searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, startDate, endDate, limit]);

  const handleStatusUpdate = async (transactionId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          invoiceId: transactionId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Dispatch custom event to trigger navbar notification update
      window.dispatchEvent(new Event('invoiceUpdated'));

      // Refresh data
      fetchPayments(page, limit, statusFilter || undefined);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "deposit"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-700";
  };

  const getMethodBadge = (method?: string) => {
    if (method === 'manual') {
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    }
    return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
  };

  const getMethodText = (method?: string) => {
    return method === 'manual' ? '🏦 Thủ công' : '⚡ PayOS';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: "Đang xử lý",
      completed: "Đã duyệt",
      failed: "Từ chối",
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (loading && !paymentsData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-slate-700 rounded-2xl h-32 animate-pulse" />
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

  const stats = paymentsData?.stats || {
    totalDeposit: 0,
    totalBonus: 0,
    totalWithdraw: 0,
    pendingCount: 0,
    completedCount: 0,
  };
  const transactions = paymentsData?.transactions || [];
  const pagination = paymentsData?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<ArrowDownTrayIcon className="w-7 h-7 text-blue-600" />}
          title="Tổng nạp"
          value={`${(stats.totalDeposit / 1000000).toFixed(1)}M`}
          subtitle="Đã được duyệt"
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={<ArrowUpTrayIcon className="w-7 h-7 text-orange-600" />}
          title="Tổng rút"
          value={`${(stats.totalWithdraw / 1000000).toFixed(1)}M`}
          subtitle="Đã được duyệt"
          color="text-orange-600"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
        />
        <StatCard
          icon={<ClockIcon className="w-7 h-7 text-yellow-600" />}
          title="Đang xử lý"
          value={stats.pendingCount.toString()}
          subtitle="Giao dịch chờ duyệt"
          color="text-yellow-600"
          bgColor="bg-yellow-50 dark:bg-yellow-900/20"
        />
        <StatCard
          icon={<CheckCircleIcon className="w-7 h-7 text-green-600" />}
          title="Đã hoàn thành"
          value={stats.completedCount.toString()}
          subtitle="Giao dịch thành công"
          color="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/20"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Status filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusChange('')}
            className={`px-4 py-2 rounded-lg transition-colors ${statusFilter === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
              }`}
          >
            Tất cả ({pagination.total})
          </button>
          <button
            onClick={() => handleStatusChange('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${statusFilter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
              }`}
          >
            Đang xử lý
          </button>
          <button
            onClick={() => handleStatusChange('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${statusFilter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
              }`}
          >
            Đã duyệt
          </button>
          <button
            onClick={() => handleStatusChange('failed')}
            className={`px-4 py-2 rounded-lg transition-colors ${statusFilter === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
              }`}
          >
            Từ chối
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto ml-auto">
          {/* Method filters */}
          <div className="flex gap-2">
            <button
              onClick={() => handleMethodFilter('')}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${methodFilter === ''
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
                }`}
            >
              Tất cả phương thức
            </button>
            <button
              onClick={() => handleMethodFilter('payos')}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${methodFilter === 'payos'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
                }`}
            >
              ⚡ PayOS
            </button>
            <button
              onClick={() => handleMethodFilter('manual')}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${methodFilter === 'manual'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
                }`}
            >
              🏦 Thủ công
            </button>
          </div>

          {/* Date Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white">
              <span>Từ:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white w-full sm:w-auto p-0"
              />
              <span>Đến:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white w-full sm:w-auto p-0"
              />
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Tìm mã GD, email, tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-900 dark:text-white">Danh sách giao dịch</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tìm thấy <span className="font-semibold text-gray-900 dark:text-white">{pagination.total}</span> giao dịch
            {pagination.total > 0 && ` • Hiển thị ${(pagination.page - 1) * limit + 1}-${Math.min(pagination.page * limit, pagination.total)} của ${pagination.total}`}
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
                  Phương thức
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
              {transactions.map((transaction: APITransaction, index: number) => (
                <tr
                  key={transaction.id}
                  className={`hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-gray-50/50 dark:bg-slate-800/50"
                    }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white font-mono font-bold text-base">
                        #{transaction.orderCode}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] truncate" title={transaction.description}>
                        {transaction.description}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white font-medium">{transaction.userName}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{transaction.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getMethodBadge(transaction.paymentMethod)}`}>
                        {getMethodText(transaction.paymentMethod)}
                      </span>
                      {transaction.paymentMethod === 'manual' && transaction.status === 'pending' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold animate-pulse">
                          ⚠️ Cần duyệt tay
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(transaction.type)}`}>
                      {transaction.type === "deposit" ? "Nạp tiền" : "Rút tiền"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white font-bold">
                        {transaction.amount.toLocaleString("vi-VN")} đ
                      </span>
                      {transaction.bonus > 0 && (
                        <span className="text-xs text-green-600">+{transaction.bonus.toLocaleString("vi-VN")} bonus</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      value={transaction.status}
                      onChange={(e) => handleStatusUpdate(transaction.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusBadge(transaction.status)}`}
                    >
                      <option value="pending">Đang xử lý</option>
                      <option value="completed">Đã duyệt</option>
                      <option value="failed">Từ chối</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{transaction.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => onOpenTransactionModal?.({
                          id: transaction.id,
                          transactionId: transaction.transactionId,
                          userName: transaction.userName,
                          type: transaction.type as "deposit" | "withdraw",
                          amount: transaction.amount,
                          status: transaction.status === 'completed' ? 'approved' : transaction.status === 'failed' ? 'rejected' : 'pending',
                          time: transaction.time,
                          note: transaction.bonus > 0 ? `Bonus: ${transaction.bonus.toLocaleString("vi-VN")} đ` : undefined,
                        })}
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

        {/* Pagination */}
        {pagination.pages > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 rounded-xl shadow p-4 border border-gray-200 dark:border-slate-700 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Hiển thị:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">mục/trang</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 mx-2">
                Trang {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
                className="p-1 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 text-gray-600 dark:text-gray-400"
              >
                &laquo;
              </button>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 text-gray-600 dark:text-gray-400"
              >
                &lsaquo;
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded font-medium">
                {pagination.page}
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-1 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 text-gray-600 dark:text-gray-400"
              >
                &rsaquo;
              </button>
              <button
                onClick={() => handlePageChange(pagination.pages)}
                disabled={pagination.page === pagination.pages}
                className="p-1 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 text-gray-600 dark:text-gray-400"
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
