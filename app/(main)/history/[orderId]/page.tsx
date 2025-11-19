"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowsUpDownIcon, ClipboardIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface AccountData {
  username: string;
  password: string;
  email?: string;
  emailPassword?: string;
  phone?: string;
  additionalInfo?: {
    extra1?: string;
    extra2?: string;
  };
}

interface OrderDetailItem {
  index: number;
  fullData: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [accountsData, setAccountsData] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch order data from API
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}`);
        
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu");
        }

        const data = await response.json();
        
        // Extract accounts from API response
        const accounts = data.accounts || [data.account] || [];
        setAccountsData(accounts);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Lỗi", {
          description: "Không thể tải thông tin đơn hàng",
        });
        setAccountsData([]);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  // Transform data to table format
  const tableData: OrderDetailItem[] = useMemo(() => {
    return accountsData.map((acc, idx) => ({
      index: idx,
      fullData: `${acc.username}\t${acc.password}\t${acc.phone || 'N/A'}\t${acc.email || 'N/A'}\t${acc.additionalInfo?.extra1 || 'N/A'}\t${acc.additionalInfo?.extra2 || 'N/A'}`,
    }));
  }, [accountsData]);

  // Filter data
  const filteredData = useMemo(() => {
    return tableData.filter((item) =>
      item.fullData.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tableData, searchQuery]);

  // Sort data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.index - b.index;
      } else {
        return b.index - a.index;
      }
    });
    return sorted;
  }, [filteredData, sortOrder]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép!", {
      description: "Dữ liệu đã được sao chép vào clipboard",
    });
  };

  // Copy all
  const copyAll = () => {
    const allData = sortedData.map((item) => item.fullData).join("\n");
    navigator.clipboard.writeText(allData);
    toast.success("Đã sao chép toàn bộ!", {
      description: `${sortedData.length} tài khoản được sao chép`,
    });
  };

  // Download as TXT
  const downloadTxt = () => {
    const headers = "TÀI KHOẢN\tMẬT KHẨU\tSDT\tEMAIL KHÔI PHỤC\tMẬT KHẨU EMAIL KHÔI PHỤC\tCOOKIE";
    const content = sortedData.map((item) => item.fullData).join("\n");
    const fullContent = `\ufeff${headers}\n${content}`;
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(fullContent));
    element.setAttribute("download", `order-${orderId}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Đã tải file TXT", {
      description: `order-${orderId}.txt`,
    });
  };

  // Download as Excel (CSV)
  const downloadExcel = () => {
    const headers = ["TÀI KHOẢN", "MẬT KHẨU", "SDT", "EMAIL KHÔI PHỤC", "MẬT KHẨU EMAIL KHÔI PHỤC", "COOKIE"];
    const rows = sortedData.map((item) => item.fullData.split("\t"));
    const csvContent = `\ufeff${[headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")}`;
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

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/history"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Quay lại
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Chi tiết đơn hàng #{orderId}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Quản lý danh sách tài khoản - Tổng cộng: {sortedData.length} tài khoản
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
        {/* Search */}
        <input
          type="text"
          placeholder="Tìm kiếm dữ liệu..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Show entries */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Hiển thị
          </label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
            entries
          </span>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-2 justify-end">
        <button
          onClick={copyAll}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-medium transition-all border border-blue-700 dark:border-blue-500 shadow-md hover:shadow-lg"
        >
          <ClipboardIcon className="w-4 h-4" />
          Sao chép tất cả
        </button>
        <button
          onClick={downloadTxt}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-medium transition-all border border-red-700 dark:border-red-500 shadow-md hover:shadow-lg"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Tải TXT
        </button>
        <button
          onClick={downloadExcel}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg font-medium transition-all border border-green-700 dark:border-green-500 shadow-md hover:shadow-lg"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Tải Excel
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      #
                      <ArrowsUpDownIcon className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                      Thông tin tài khoản
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center w-24">
                    <div className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                      Thao tác
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      Không có dữ liệu phù hợp
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                        {item.index}
                      </td>
                      <td className="px-6 py-4">
                        <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded font-mono text-xs text-gray-800 dark:text-gray-200 break-all max-h-24 overflow-y-auto">
                          {item.fullData}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => copyToClipboard(item.fullData)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded font-medium text-sm transition-all border border-red-700 dark:border-red-500 shadow-md hover:shadow-lg"
                          title="Sao chép vào clipboard"
                        >
                          <ClipboardIcon className="w-4 h-4" />
                          Sao chép
                        </button>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Hiển thị <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> đến{" "}
          <span className="font-semibold">
            {Math.min(currentPage * pageSize, sortedData.length)}
          </span>{" "}
          của <span className="font-semibold">{sortedData.length}</span> kết quả
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = currentPage - 2 + i;
            if (pageNum > 0 && pageNum <= totalPages) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {pageNum}
                </button>
              );
            }
            return null;
          })}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Mẹo:</strong> Bạn có thể sao chép từng dòng hoặc toàn bộ danh sách để sử dụng.
          Sử dụng nút Tải để lưu dữ liệu dưới dạng TXT hoặc Excel.
        </p>
      </div>
    </div>
  );
}
