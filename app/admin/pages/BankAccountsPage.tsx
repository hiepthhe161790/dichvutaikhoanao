"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  BuildingLibraryIcon,
  EyeIcon,
  EyeSlashIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { BankAccountModal } from "../components/BankAccountModal";
import VietQRCode from "@/app/components/VietQRCode";

interface BankAccount {
  _id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isActive: boolean;
  displayOrder: number;
  note?: string;
  createdAt: string;
}

export function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);
  const [qrPreviewId, setQrPreviewId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/bank-accounts?all=true", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setAccounts(data.data);
    } catch (err) {
      toast.error("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleToggleActive = async (account: BankAccount) => {
    try {
      const res = await fetch("/api/admin/bank-accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: account._id, isActive: !account.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(account.isActive ? "Đã tắt tài khoản" : "Đã bật tài khoản");
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa tài khoản ngân hàng này?")) return;
    try {
      setDeleting(id);
      const res = await fetch(`/api/admin/bank-accounts?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Đã xóa tài khoản");
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || "Lỗi xóa tài khoản");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditAccount(account);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditAccount(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditAccount(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BuildingLibraryIcon className="w-6 h-6 text-blue-600" />
            Tài khoản ngân hàng nhận tiền
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý tài khoản ngân hàng hiển thị QR VietQR cho người dùng nạp tiền thủ công
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Thêm tài khoản
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
        <QrCodeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Hướng dẫn:</strong> Thêm tài khoản ngân hàng của bạn. Hệ thống sẽ tự động tạo mã QR VietQR
          cho mỗi tài khoản. Người dùng sẽ chọn tài khoản và quét mã QR để chuyển khoản thủ công.
          Admin cần duyệt giao dịch trong trang <strong>Payments</strong>.
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <BuildingLibraryIcon className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Chưa có tài khoản ngân hàng nào</p>
            <p className="text-sm mt-1">Thêm tài khoản để bắt đầu nhận thanh toán thủ công</p>
            <button
              onClick={handleAdd}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Thêm tài khoản đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Ngân hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Số tài khoản
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Chủ tài khoản
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Preview QR
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {accounts.map((acc) => (
                  <>
                    <tr
                      key={acc._id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <BuildingLibraryIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {acc.bankName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono uppercase">
                              {acc.bankCode}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-gray-900 dark:text-white font-medium">
                          {acc.accountNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 dark:text-white font-medium uppercase">
                          {acc.accountName}
                        </span>
                        {acc.note && (
                          <p className="text-xs text-gray-400 mt-0.5">{acc.note}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(acc)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            acc.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          {acc.isActive ? (
                            <>
                              <EyeIcon className="w-3.5 h-3.5" />
                              Đang hiện
                            </>
                          ) : (
                            <>
                              <EyeSlashIcon className="w-3.5 h-3.5" />
                              Đang ẩn
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            setQrPreviewId(qrPreviewId === acc._id ? null : acc._id)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
                        >
                          <QrCodeIcon className="w-3.5 h-3.5" />
                          {qrPreviewId === acc._id ? "Ẩn QR" : "Xem QR"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(acc)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(acc._id)}
                            disabled={deleting === acc._id}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Xóa"
                          >
                            {deleting === acc._id ? (
                              <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                              <TrashIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* QR Preview Row */}
                    {qrPreviewId === acc._id && (
                      <tr key={`${acc._id}-qr`} className="bg-purple-50 dark:bg-purple-900/10">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="flex flex-col items-center gap-3">
                            <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                              Preview QR VietQR – {acc.bankName} ({acc.accountNumber})
                            </p>
                            <VietQRCode
                              bankCode={acc.bankCode}
                              accountNumber={acc.accountNumber}
                              accountName={acc.accountName}
                              size="compact2"
                              className="max-h-80 rounded-xl shadow-md"
                            />
                            <p className="text-xs text-gray-500">
                              QR thực tế sẽ có thêm số tiền & nội dung chuyển khoản
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <BankAccountModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={fetchAccounts}
        editData={editAccount}
      />
    </div>
  );
}
