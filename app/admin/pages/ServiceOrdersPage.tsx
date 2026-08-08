"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Edit2, Trash2, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/lib/context/AuthContext";
import { ROLE_POLICIES, Role } from "@/lib/config/permissions";

interface ProductLink {
  url: string;
  quantity: number;
}

interface ShippingInfo {
  fullName: string;
  phoneNumber: string;
  address: string;
  province: string;
  district?: string;
  ward?: string;
}

interface ServiceOrder {
  _id: string;
  userId: {
    _id: string;
    email: string;
    username?: string;
    fullName?: string;
  };
  serviceType: string;
  platform: string;
  serverName: string;
  estimatedTime: string;
  quality?: string;
  productLinks: ProductLink[];
  shippingInfo?: ShippingInfo;
  note?: string;
  totalPrice: number;
  basePrice: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  processStartedAt?: string;
  processCompletedAt?: string;
  failureReason?: string;
  refundAmount?: number;
}

interface Stats {
  _id: string;
  count: number;
  totalRevenue: number;
}

export function ServiceOrdersPage() {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ServiceOrder[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  
  // Update form state
  const [updateStatus, setUpdateStatus] = useState<string>("");
  const [failureReason, setFailureReason] = useState("");
  const [refundAmount, setRefundAmount] = useState(0);

  // Email notifications states (Sprint 4)
  const [sendEmail, setSendEmail] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [isManualMailOpen, setIsManualMailOpen] = useState(false);
  const [mailSubject, setMailSubject] = useState("");
  const [mailMessage, setMailMessage] = useState("");
  const [sendingMail, setSendingMail] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  const platforms = ["tiktok", "shopee", "lazada", "facebook", "instagram", "youtube"];
  const statuses = [
    { value: "pending", label: "Chờ xử lý", color: "yellow" },
    { value: "processing", label: "Đang xử lý", color: "blue" },
    { value: "completed", label: "Hoàn thành", color: "green" },
    { value: "cancelled", label: "Đã hủy", color: "gray" },
    { value: "refunded", label: "Hoàn tiền", color: "purple" },
    { value: "failed", label: "Thất bại", color: "red" }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, itemsPerPage, filterStatus, filterPlatform, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterPlatform !== "all") params.append("platform", filterPlatform);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const response = await fetch(`/api/admin/service-orders?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
        setTotalItems(data.pagination.total);
        setStats(data.stats || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleOpenUpdateModal = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setUpdateStatus(order.status);
    setFailureReason(order.failureReason || "");
    setRefundAmount(order.refundAmount || 0);
    setSendEmail(false);
    setCustomMessage("");
    setIsUpdateModalOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder || !updateStatus) {
      toast.error("Vui lòng chọn trạng thái");
      return;
    }

    const statusLabels: Record<string, string> = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      refunded: 'Hoàn tiền',
      failed: 'Thất bại'
    };

    const confirmMsg = `Bạn chắc chắn muốn chuyển trạng thái đơn hàng #${selectedOrder._id.slice(-6).toUpperCase()} sang [${statusLabels[updateStatus] || updateStatus}]${updateStatus === 'refunded' ? ` và hoàn trả ${refundAmount.toLocaleString('vi-VN')}đ vào ví?` : '?'}`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/service-orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          status: updateStatus,
          failureReason: updateStatus === "failed" ? failureReason : undefined,
          refundAmount: updateStatus === "refunded" ? refundAmount : undefined,
          sendEmail,
          customMessage: sendEmail && customMessage.trim() ? customMessage : undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Cập nhật đơn hàng thành công");
        setIsUpdateModalOpen(false);
        fetchOrders();
      } else {
        toast.error(data.error || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleSendManualEmail = async () => {
    if (!selectedOrder) return;
    if (!mailSubject.trim() || !mailMessage.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung email");
      return;
    }

    try {
      setSendingMail(true);
      const response = await fetch("/api/admin/service-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-manual-email",
          orderId: selectedOrder._id,
          subject: mailSubject,
          message: mailMessage
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Đã gửi email hỗ trợ thành công");
        setIsManualMailOpen(false);
        setMailSubject("");
        setMailMessage("");
      } else {
        toast.error(data.error || "Gửi email thất bại");
      }
    } catch (error) {
      console.error("Send mail error:", error);
      toast.error("Có lỗi xảy ra khi gửi email");
    } finally {
      setSendingMail(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa đơn hàng này?")) return;

    try {
      const response = await fetch(`/api/admin/service-orders?id=${orderId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Đã xóa đơn hàng");
        fetchOrders();
      } else {
        toast.error("Xóa thất bại");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = statuses.find(s => s.value === status);
    const colors: Record<string, string> = {
      yellow: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
      blue: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
      green: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
      gray: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
      purple: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
      red: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[statusInfo?.color || "gray"]}`}>
        {statusInfo?.label || status}
      </span>
    );
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      tiktok: "bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400",
      shopee: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
      lazada: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
      facebook: "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
      instagram: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
      youtube: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
    };
    return colors[platform] || "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Service Orders</h1>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
          <span>Tìm thấy <span className="font-semibold">{totalItems}</span> đơn dịch vụ</span>
          <button 
            onClick={fetchOrders}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Chờ xử lý</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {stats.find(s => s._id === "pending")?.count || 0}
              </p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Đang xử lý</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {stats.find(s => s._id === "processing")?.count || 0}
              </p>
            </div>
            <RefreshCw className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {stats.find(s => s._id === "completed")?.count || 0}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 dark:text-red-400">Thất bại</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {stats.find(s => s._id === "failed")?.count || 0}
              </p>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo ID, Email, Username, Loại dịch vụ..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Tất cả trạng thái</option>
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Tất cả Platform</option>
            {platforms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Dịch vụ</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Platform</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Giá</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Thời gian</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy đơn dịch vụ nào
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition border-b border-gray-100 dark:border-slate-700 last:border-0">
                      <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-gray-400">
                        {order._id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.userId.fullName || order.userId.username || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{order.userId.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{order.serviceType}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{order.serverName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPlatformColor(order.platform)}`}>
                          {order.platform}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {order.totalPrice.toLocaleString("vi-VN")}đ
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(order)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-800 rounded transition"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                             onClick={() => handleOpenUpdateModal(order)}
                             className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-slate-800 rounded transition"
                             title="Cập nhật"
                           >
                             <Edit2 size={18} />
                           </button>
                           {ROLE_POLICIES[user?.role as Role]?.actions?.deleteServiceOrder && (
                             <button
                               onClick={() => handleDeleteOrder(order._id)}
                               className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-slate-800 rounded transition"
                               title="Xóa"
                             >
                               <Trash2 size={18} />
                             </button>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Hiển thị:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 text-sm"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 text-sm"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Chi tiết đơn hàng</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Khách hàng</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedOrder.userId.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dịch vụ</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedOrder.serviceType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Platform</p>
                  <span className={`px-2 py-1 rounded text-xs ${getPlatformColor(selectedOrder.platform)}`}>
                    {selectedOrder.platform}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Server</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedOrder.serverName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Thời gian ước tính</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedOrder.estimatedTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tổng giá</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedOrder.totalPrice.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>

              {/* Product Links */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Links sản phẩm:</p>
                <div className="space-y-2">
                  {selectedOrder.productLinks.map((link, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-slate-800 rounded">
                      <p className="text-sm text-gray-900 dark:text-white break-all">{link.url}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Số lượng: {link.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Info */}
              {selectedOrder.shippingInfo && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Thông tin giao hàng:</p>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded space-y-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">Họ tên:</span> {selectedOrder.shippingInfo.fullName}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">SĐT:</span> {selectedOrder.shippingInfo.phoneNumber}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">Địa chỉ:</span> {selectedOrder.shippingInfo.address}, {selectedOrder.shippingInfo.ward}, {selectedOrder.shippingInfo.district}, {selectedOrder.shippingInfo.province}
                    </p>
                  </div>
                </div>
              )}

              {selectedOrder.note && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ghi chú:</p>
                  <p className="text-sm text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-slate-800 rounded">
                    {selectedOrder.note}
                  </p>
                </div>
              )}

              {selectedOrder.failureReason && (
                <div>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Lý do thất bại:</p>
                  <p className="text-sm text-red-700 dark:text-red-300 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                    {selectedOrder.failureReason}
                  </p>
                </div>
              )}
            </div>

            {/* Manual Email Support Form */}
            {isManualMailOpen ? (
              <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-4 space-y-4 animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  📧 Soạn Email Hỗ Trợ Khách Hàng
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Tiêu đề email
                    </label>
                    <input
                      type="text"
                      value={mailSubject}
                      onChange={(e) => setMailSubject(e.target.value)}
                      placeholder="Ví dụ: Yêu cầu cập nhật link công khai..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Nội dung tin nhắn
                    </label>
                    <textarea
                      value={mailMessage}
                      onChange={(e) => setMailMessage(e.target.value)}
                      placeholder="Nhập nội dung tin nhắn gửi khách..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSendManualEmail}
                    disabled={sendingMail}
                    className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm flex items-center justify-center gap-1"
                  >
                    {sendingMail ? "Đang gửi..." : "Gửi thư ngay"}
                  </button>
                  <button
                    onClick={() => {
                      setIsManualMailOpen(false);
                      setMailSubject("");
                      setMailMessage("");
                    }}
                    className="px-3 py-2 bg-gray-300 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg font-medium text-sm"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMailSubject(`Hỗ trợ đơn hàng dịch vụ #${selectedOrder._id.slice(-6).toUpperCase()}`);
                  setIsManualMailOpen(true);
                }}
                className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
              >
                📧 Gửi Email Hỗ Trợ Khách Hàng
              </button>
            )}

            <button
              onClick={() => {
                setIsDetailModalOpen(false);
                setIsManualMailOpen(false);
              }}
              className="mt-2 w-full px-4 py-2 bg-gray-300 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-slate-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Cập nhật trạng thái</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trạng thái
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                >
                  {statuses.filter(s => {
                    if (s.value === 'refunded') {
                      return ROLE_POLICIES[user?.role as Role]?.actions?.refundServiceOrder;
                    }
                    return true;
                  }).map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {updateStatus === "failed" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lý do thất bại
                  </label>
                  <textarea
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                </div>
              )}

              {updateStatus === "refunded" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Số tiền hoàn (đ)
                  </label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    max={selectedOrder.totalPrice}
                  />
                </div>
              )}

              {/* Email Notification Option */}
              <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gửi email thông báo cho khách
                  </span>
                </label>

                {sendEmail && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Tin nhắn kèm theo (tùy chọn)
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Ví dụ: Link bị lỗi/Chất lượng sub không đủ nên hoàn trả một phần..."
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-gray-100"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleUpdateOrder}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Cập nhật
              </button>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
