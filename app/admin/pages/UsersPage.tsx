"use client";

import { useState } from "react";
import { useEffect } from "react";
import { users, User } from "../data/mockData";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

interface UsersPageProps {
  onOpenUserModal: (user?: User, onSuccess?: () => void) => void;
}

export function UsersPage({ onOpenUserModal }: UsersPageProps) {
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      if (searchQuery) params.append("search", searchQuery);
      if (roleFilter) params.append("role", roleFilter);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/admin/user?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUserList(
          (data.data || []).map((u: any) => ({
            id: u._id,
            name: u.fullName || u.username || "",
            email: u.email,
            avatar: u.avatar,
            phone: u.phone,
            role: u.role,
            status: u.status,
            balance: u.balance,
            bonusPercentage: u.bonusPercentage || 0,
            createdAt: new Date(u.createdAt).toLocaleDateString("vi-VN"),
            updatedAt: u.updatedAt,
            lastLogin: u.lastLogin,
            totalPurchased: u.totalPurchased,
            totalSpent: u.totalSpent,
          }))
        );
        if (data.pagination) {
          setTotalUsers(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Load users on mount and state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, limit, searchQuery, roleFilter, statusFilter]);

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      const res = await fetch(`/api/admin/user/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa người dùng thành công");
        fetchUsers();
      } else {
        toast.error(data.error || "Lỗi khi xóa người dùng");
      }
    } catch (error) {
      toast.error("Lỗi khi xóa người dùng");
    }
  } 

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      staff: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      user: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    };
    return badges[role as keyof typeof badges] || badges.user;
  };

  const getStatusBadge = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 dark:text-white text-2xl font-bold">Quản lý người dùng</h3>
        </div>
        <button
          onClick={() => onOpenUserModal(undefined, fetchUsers)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm người dùng
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-4 space-y-4 border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Tất cả Vai trò</option>
              <option value="user">User</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Tất cả Trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="banned">Bị cấm</option>
            </select>
          </div>

          <div className="w-full lg:w-72">
            <input
              type="text"
              placeholder="Tìm email, tên, username..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Tìm thấy <span className="font-semibold text-gray-900 dark:text-white">{totalUsers}</span> người dùng
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Email
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Khuyến mãi (%)
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Số dư
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {userList.map((user, index) => (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                    index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-gray-50/50 dark:bg-slate-800/50"
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-slate-700"
                      />
                      <span className="text-gray-900 dark:text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                      {user.status === "active" ? "Hoạt động" : "Bị cấm"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      +{user.bonusPercentage || 0}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-900 dark:text-white font-medium">
                    {user.balance.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.createdAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onOpenUserModal(user, fetchUsers)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Đang tải...
            </div>
          )}
          {!loading && userList.length === 0 && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Không tìm thấy người dùng nào
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalUsers > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 rounded-xl shadow p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Hiển thị:</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 text-sm text-gray-900 dark:text-white"
            >
              Trước
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 mx-2">
              Trang <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 text-sm text-gray-900 dark:text-white"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
