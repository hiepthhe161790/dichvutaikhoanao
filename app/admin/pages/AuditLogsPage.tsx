"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, Calendar, Shield, Activity, Globe } from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  _id: string;
  email: string;
  role: "customer" | "admin" | "seller" | "staff";
  action: "create" | "update" | "delete" | "send_email" | "other";
  resource: "service_order" | "account" | "product" | "settings" | "user";
  resourceId?: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [filterResource, setFilterResource] = useState("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);

  const fetchLogs = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNumber.toString(),
        limit: limit.toString(),
        role: filterRole,
        action: filterAction,
        resource: filterResource,
        search: searchQuery
      });

      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.data);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.page);
      } else {
        toast.error(data.error || "Không thể tải nhật ký hoạt động");
      }
    } catch (error) {
      console.error("Fetch audit logs error:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filterRole, filterAction, filterResource]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, string> = {
      admin: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/50",
      staff: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50",
      seller: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50",
      customer: "bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
    };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badges[role] || badges.customer}`}>
        {role.toUpperCase()}
      </span>
    );
  };

  const getActionBadge = (action: string) => {
    const badges: Record<string, string> = {
      create: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30",
      update: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30",
      delete: "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30",
      send_email: "bg-sky-50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30",
      other: "bg-gray-50 text-gray-700 dark:bg-gray-950/20 dark:text-gray-400 border border-gray-100 dark:border-gray-800"
    };

    const labels: Record<string, string> = {
      create: "Thêm mới",
      update: "Cập nhật",
      delete: "Xóa",
      send_email: "Gửi Email",
      other: "Khác"
    };

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${badges[action] || badges.other}`}>
        {labels[action] || action}
      </span>
    );
  };

  const getResourceLabel = (resource: string) => {
    const labels: Record<string, string> = {
      service_order: "Đơn dịch vụ",
      account: "Tài khoản bán",
      product: "Sản phẩm",
      settings: "Cài đặt",
      user: "Người dùng"
    };
    return labels[resource] || resource;
  };

  return (
    <div className="space-y-6">
      {/* Title & Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nhật ký hoạt động</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Theo dõi tất cả lịch sử thao tác của các tài khoản quản trị và nhân sự vận hành.
          </p>
        </div>
        <button
          onClick={() => fetchLogs(currentPage)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Tải lại
        </button>
      </div>

      {/* Filters Form */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo email nhân sự hoặc nội dung thao tác..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-850 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
            {/* Filter Role */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-850 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Tất cả Vai trò</option>
              <option value="admin">ADMIN</option>
              <option value="staff">STAFF</option>
            </select>

            {/* Filter Action */}
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-850 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Tất cả Hành động</option>
              <option value="create">Thêm mới</option>
              <option value="update">Cập nhật</option>
              <option value="delete">Xóa</option>
              <option value="send_email">Gửi Email</option>
            </select>

            {/* Filter Resource */}
            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-850 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Tất cả tài nguyên</option>
              <option value="service_order">Đơn dịch vụ</option>
              <option value="account">Tài khoản bán</option>
              <option value="product">Sản phẩm</option>
              <option value="settings">Cài đặt</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition"
          >
            Lọc
          </button>
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Đang tải lịch sử hoạt động...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400 space-y-2">
              <Activity className="mx-auto w-12 h-12 text-gray-300 dark:text-slate-700" />
              <p className="text-base font-semibold">Trống</p>
              <p className="text-sm">Không tìm thấy thao tác nào khớp với bộ lọc.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/30 border-b border-gray-200 dark:border-slate-800">
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Thời gian</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tài khoản</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">Vai trò</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">Hành động</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tài nguyên</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Mô tả chi tiết</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-slate-850">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition border-b border-gray-100 dark:border-slate-850 last:border-0">
                    <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        {new Date(log.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-900 dark:text-white font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Shield size={14} className="text-blue-500" />
                        {log.email}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      {getRoleBadge(log.role)}
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                      {getResourceLabel(log.resource)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-800 dark:text-gray-200 min-w-[280px]">
                      {log.description}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">
                      {log.ipAddress ? (
                        <span className="flex items-center justify-end gap-1">
                          <Globe size={12} className="text-gray-400" />
                          {log.ipAddress}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && logs.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Trang {currentPage} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchLogs(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-3.5 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Trước
            </button>
            <button
              onClick={() => fetchLogs(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-3.5 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
