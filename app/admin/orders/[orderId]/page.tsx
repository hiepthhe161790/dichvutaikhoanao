"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Copy, Download, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface OrderDetail {
  _id: string;
  userId: {
    _id: string;
    email: string;
    username?: string;
    phone?: string;
    fullName?: string;
    balance?: number;
    totalPurchased?: number;
    totalSpent?: number;
    status?: string;
    createdAt?: string;
  };
  productId: {
    _id: string;
    title: string;
    price: number;
    platform: string;
    description?: string;
  };
  quantity: number;
  totalPrice: number;
  status: "pending" | "completed" | "cancelled" | "refunded";
  paymentStatus: "paid" | "failed";
  paymentMethod?: string;
  notes?: string;
  accounts?: Array<{
    username: string;
    password: string;
    email?: string;
    phone?: string;
    _id?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);

      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu");
      }

      const data = await response.json();
      setOrder(data);
      setNewStatus(data.status);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Lỗi", {
        description: "Không thể tải thông tin đơn hàng",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép!", {
      description: "Dữ liệu đã được sao chép vào clipboard",
    });
  };

  const copyAllAccounts = () => {
    if (!order?.accounts) return;
    const allData = order.accounts
      .map((acc) => `${acc.username}|${acc.password}|${acc.email || ""}|${acc.phone || ""}`)
      .join("\n");
    navigator.clipboard.writeText(allData);
    toast.success("Đã sao chép toàn bộ!", {
      description: `${order.accounts.length} tài khoản được sao chép`,
    });
  };

  const downloadTxt = () => {
    if (!order?.accounts) return;
    const content = order.accounts
      .map((acc) => `${acc.username}|${acc.password}|${acc.email || ""}|${acc.phone || ""}`)
      .join("\n");
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", `order-${orderId}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Đã tải file TXT", {
      description: `order-${orderId}.txt`,
    });
  };

  const downloadExcel = () => {
    if (!order?.accounts) return;
    const headers = ["#", "Username", "Password", "Email", "Phone"];
    const rows = order.accounts.map((acc, idx) => [
      idx + 1,
      acc.username,
      acc.password,
      acc.email || "",
      acc.phone || "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
    element.setAttribute("download", `order-${orderId}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Đã tải file Excel", {
      description: `order-${orderId}.csv`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      case "refunded":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "failed":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">Không tìm thấy order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Chi tiết Order #{order._id.slice(-8).toUpperCase()}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ngày tạo: {new Date(order.createdAt).toLocaleString("vi-VN")}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Card */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Thông tin khách hàng
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Tên</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.userId.fullName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                  {order.userId.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Số điện thoại</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.userId.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Username</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.userId.username || "N/A"}
                </p>
              </div>
              <hr className="border-gray-200 dark:border-slate-700 my-3" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Trạng thái</p>
                <span
                  className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                    order.userId.status === "active"
                      ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                  }`}
                >
                  {order.userId.status === "active" ? "Hoạt động" : "Đã khóa"}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Số dư ví</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {(order.userId.balance || 0).toLocaleString("vi-VN")} đ
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Tổng chi tiêu</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {(order.userId.totalSpent || 0).toLocaleString("vi-VN")} đ
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Tổng đơn hàng</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {order.userId.totalPurchased || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Ngày tham gia</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.userId.createdAt
                    ? new Date(order.userId.createdAt).toLocaleDateString("vi-VN")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Order Status Card */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Trạng thái đơn hàng
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Trạng thái</p>
                <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Trạng thái thanh toán</p>
                <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus === "paid" ? "Đã thanh toán" : "Thanh toán thất bại"}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Phương thức</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.paymentMethod === "wallet" ? "Ví điện tử" : order.paymentMethod || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Product & Accounts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Card */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Thông tin sản phẩm
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Sản phẩm</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.productId.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Nền tảng</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.productId.platform}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Số lượng</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {order.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Giá đơn vị</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {order.productId.price.toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Tổng tiền</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {order.totalPrice.toLocaleString("vi-VN")} đ
                  </p>
                </div>
              </div>
              {order.notes && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Ghi chú</p>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-800 p-2 rounded">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Accounts Card */}
          {order.accounts && order.accounts.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tài khoản ({order.accounts.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyAllAccounts}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-medium text-sm transition-all border border-blue-700 dark:border-blue-500"
                    title="Sao chép tất cả"
                  >
                    <Copy size={16} />
                    Sao chép
                  </button>
                  <button
                    onClick={downloadTxt}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-medium text-sm transition-all border border-red-700 dark:border-red-500"
                    title="Tải TXT"
                  >
                    <Download size={16} />
                    TXT
                  </button>
                  <button
                    onClick={downloadExcel}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg font-medium text-sm transition-all border border-green-700 dark:border-green-500"
                    title="Tải Excel"
                  >
                    <Download size={16} />
                    Excel
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {order.accounts.map((acc, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 rounded"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Tài khoản #{idx + 1}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${acc.username}|${acc.password}|${acc.email || ""}|${acc.phone || ""}`
                          )
                        }
                        className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-700 rounded transition"
                        title="Sao chép"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="bg-white dark:bg-slate-900 p-2 rounded">
                        <p className="text-gray-500 dark:text-gray-400">Username</p>
                        <p className="font-mono text-gray-900 dark:text-white break-all">
                          {acc.username}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2 rounded">
                        <p className="text-gray-500 dark:text-gray-400">Password</p>
                        <p className="font-mono text-gray-900 dark:text-white break-all">
                          {acc.password}
                        </p>
                      </div>
                      {acc.email && (
                        <div className="bg-white dark:bg-slate-900 p-2 rounded">
                          <p className="text-gray-500 dark:text-gray-400">Email</p>
                          <p className="font-mono text-gray-900 dark:text-white break-all">
                            {acc.email}
                          </p>
                        </div>
                      )}
                      {acc.phone && (
                        <div className="bg-white dark:bg-slate-900 p-2 rounded">
                          <p className="text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="font-mono text-gray-900 dark:text-white break-all">
                            {acc.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">Thông tin đơn hàng</p>
              <p>Order được tạo lúc {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
              <p>Cập nhật lần cuối lúc {new Date(order.updatedAt).toLocaleString("vi-VN")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
