"use client";

import { useState, useEffect } from "react";
import { Search, Download, Eye, Trash2, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Order {
  _id: string;
  userId: string | {
    _id: string;
    email: string;
    username?: string;
    phone?: string;
    fullName?: string;
    balance?: number;
    totalSpent?: number;
    status?: string;
  };
  productId: {
    _id: string;
    title: string;
    price: number;
    platform: string;
  };
  quantity: number;
  totalPrice: number;
  status: "pending" | "completed" | "cancelled" | "refunded";
  paymentStatus: "paid" | "failed";
  createdAt: string;
  updatedAt: string;
  accounts?: Array<{
    username: string;
    password: string;
    email?: string;
    emailPassword?: string;
    phone?: string;
  }>;
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, limit, searchQuery, filterStatus, filterPayment]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      if (searchQuery) params.append("search", searchQuery);
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterPayment !== "all") params.append("paymentStatus", filterPayment);

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
        if (data.pagination) {
          setTotalOrders(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa order này?")) return;
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "pending": return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400";
      case "cancelled": return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      case "refunded": return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "failed": return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Orders</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select value={filterPayment} onChange={(e) => { setFilterPayment(e.target.value); setCurrentPage(1); }} className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
          <option value="all">Thanh toán</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="unpaid">Unpaid</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Tìm thấy <span className="font-semibold text-gray-900 dark:text-white">{totalOrders}</span> đơn hàng
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Qty</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Giá</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Payment</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {orders.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">Không tìm thấy đơn hàng nào</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm">{typeof order.userId === 'string' ? order.userId : order.userId.email}</td>
                    <td className="px-6 py-4 text-sm">{order.productId.title}</td>
                    <td className="px-6 py-4 text-center text-sm">{order.quantity}</td>
                    <td className="px-6 py-4 text-right font-semibold">{order.totalPrice.toLocaleString()} đ</td>
                    <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>{order.status}</span></td>
                    <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span></td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Link href={`/admin/orders/${order._id}`} className="p-2 text-blue-600 hover:bg-blue-100 rounded"><Eye size={18} /></Link>
                      <button onClick={() => handleDelete(order._id)} className="p-2 text-red-600 hover:bg-red-100 rounded"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Hiển thị:</span>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }} className="border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm p-1">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50"><ChevronLeft size={18} /></button>
            <span className="text-sm">Trang {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50"><ChevronRight size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
