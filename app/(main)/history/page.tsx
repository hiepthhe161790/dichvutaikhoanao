"use client";

import { useState, useEffect } from "react";
import { ExclamationTriangleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HistoryTable } from "./components/HistoryTable";
import { toast } from "sonner";
// import Link from "next/link";
// import { useAuthContext } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/lib/components/ProtectedRoute";
interface HistoryItem {
  id: string;
  transactionId: string;
  product: string;
  quantity: number;
  paid: number;
  timeLeft: string;
  createdAt: string;
  account?: {
    username: string;
    password: string;
    email?: string;
  };
  accounts?: Array<{
    username: string;
    password: string;
    email?: string;
    emailPassword?: string;
    phone?: string;
    additionalInfo?: {
      extra1?: string;
      extra2?: string;
    };
  }>;
  productId?: {
    title: string;
    price: number;
    platform: string;
  };
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // const [selectedOrder, setSelectedOrder] = useState<HistoryItem | null>(null);
  // const { user } = useAuthContext();

  const router = useRouter();

  // Fetch orders từ API
  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders?page=${page}&limit=10`);
      const result = await response.json();

      if (!response.ok) {
        toast.error("Lỗi", {
          description: result.error || "Không thể tải lịch sử mua hàng",
        });
        return;
      }

      // Transform API data để match HistoryTable structure
      const transformedData = result.data.map((order: any) => {
        const createdDate = new Date(order.createdAt);
        const expiryDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const timeLeftMs = expiryDate.getTime() - now.getTime();
        const daysLeft = Math.max(0, Math.ceil(timeLeftMs / (24 * 60 * 60 * 1000)));
        const timeLeft = daysLeft > 0 ? `${daysLeft} ngày` : 'Đã hết hạn';

        return {
          id: order._id,
          transactionId: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
          product: order.productId?.title || "Không rõ",
          quantity: order.quantity,
          paid: order.totalPrice,
          timeLeft,
          createdAt: order.createdAt,
          account: order.account,
          accounts: order.accounts,
          productId: order.productId,
        };
      });

      setData(transformedData);
      setTotalPages(result.pagination.totalPages);
    } catch (error: any) {
      toast.error("Lỗi", {
        description: error.message || "Không thể tải lịch sử mua hàng",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on search query
  const filteredData = data.filter(
    (item) =>
      item.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadTxt = (id: string) => {
    const item = data.find((item) => item.id === id);
    if (item && item.accounts) {
      const headers = "TÀI KHOẢN\tMẬT KHẨU\tSDT\tEMAIL KHÔI PHỤC\tMẬT KHẨU EMAIL KHÔI PHỤC\tCOOKIE";
      const content = item.accounts.map((account) => 
        `${account.username}\t${account.password}\t${account.phone || 'N/A'}\t${account.email || 'N/A'}\t${account.additionalInfo?.extra1 || 'N/A'}\t${account.additionalInfo?.extra2 || 'N/A'}`
      ).join("\n");
      const fullContent = `\ufeff${headers}\n${content}`;
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(fullContent));
      element.setAttribute("download", `order-${item.transactionId}.txt`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Đã tải file TXT", {
        description: `order-${item.transactionId}.txt`,
      });
    }
  };

  const handleDownloadExcel = (id: string) => {
    const item = data.find((item) => item.id === id);
    if (item && item.accounts) {
      const headers = ["TÀI KHOẢN", "MẬT KHẨU", "SDT", "EMAIL KHÔI PHỤC", "MẬT KHẨU EMAIL KHÔI PHỤC", "COOKIE"];
      const rows = item.accounts.map((account) => [
        account.username,
        account.password,
        account.phone || 'N/A',
        account.email || 'N/A',
        account.additionalInfo?.extra1 || 'N/A',
        account.additionalInfo?.extra2 || 'N/A'
      ]);
      const csvContent = `\ufeff${[headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n")}`;
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
      element.setAttribute("download", `order-${item.transactionId}.csv`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Đã tải file Excel", {
        description: `order-${item.transactionId}.csv`,
      });
    }
  };

  const handleViewDetail = (id: string) => {
    router.push(`/history/${id}`);
  };

  const handleDelete = async (id: string) => {
    const item = data.find((item) => item.id === id);
    if (item) {
      if (window.confirm(`Bạn có chắc chắn muốn xoá đơn hàng ${item.transactionId}?`)) {
        try {
          // API delete chưa có, nên chỉ xoá client-side
          setData(data.filter((item) => item.id !== id));
          toast.success("Đã xoá đơn hàng", {
            description: `Mã: ${item.transactionId}`,
          });
        } catch (error: any) {
          toast.error("Lỗi", {
            description: error.message,
          });
        }
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Alert Bar */}
        <div className="relative bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-orange-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-yellow-500 rounded-full blur opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl shadow-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-yellow-900 dark:text-yellow-200 font-bold">
                  Quan trọng từ ngày 25/3/2024
                </h4>
                <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
                  HOT
                </span>
              </div>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 leading-relaxed">
                Web chỉ lưu đơn hàng đã mua trong <strong>7 ngày</strong> gần nhất. Vui lòng tải về và lưu trữ 
                thông tin đơn hàng của bạn để tránh mất dữ liệu. Sau 7 ngày, đơn hàng sẽ tự động 
                bị xóa khỏi hệ thống và <strong className="text-red-600 dark:text-red-400">không thể khôi phục</strong>.
              </p>
            </div>
          </div>
        </div>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gray-900 dark:text-gray-100">
              Lịch Sử Mua Hàng
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Quản lý và theo dõi các giao dịch của bạn
            </p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm mã GD hoặc sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 w-full sm:w-80"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Đang tải lịch sử mua hàng...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <>
            {/* Data Table */}
            <HistoryTable
              data={filteredData}
              onViewDetail={handleViewDetail}
              onDownloadTxt={handleDownloadTxt}
              onDownloadExcel={handleDownloadExcel}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="text-gray-700 dark:text-gray-300">
                  Trang {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}

        {/* Info Footer */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Mẹo:</strong> Bạn có thể tải xuống thông tin đơn hàng dưới định dạng TXT
            hoặc Excel để lưu trữ lâu dài. Hãy thực hiện ngay để không bị mất dữ liệu sau 7 ngày.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
