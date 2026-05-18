"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, BuildingLibraryIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import VietQRCode from "@/app/components/VietQRCode";

// Popular Vietnamese banks supported by VietQR
export const VIET_QR_BANKS = [
  { code: "vietinbank", name: "VietinBank (CTG)" },
  { code: "vcb", name: "Vietcombank (VCB)" },
  { code: "bidv", name: "BIDV" },
  { code: "agribank", name: "Agribank" },
  { code: "mbbank", name: "MB Bank" },
  { code: "techcombank", name: "Techcombank" },
  { code: "acb", name: "ACB" },
  { code: "vpbank", name: "VPBank" },
  { code: "tpbank", name: "TPBank" },
  { code: "sacombank", name: "Sacombank" },
  { code: "hdbank", name: "HDBank" },
  { code: "vib", name: "VIB" },
  { code: "shb", name: "SHB" },
  { code: "ocb", name: "OCB" },
  { code: "msb", name: "MSB" },
  { code: "seabank", name: "SeABank" },
  { code: "lpb", name: "LPBank" },
  { code: "abbank", name: "ABBANK" },
  { code: "pvcombank", name: "PVcomBank" },
  { code: "baovietbank", name: "Bảo Việt Bank" },
];

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: {
    _id: string;
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    isActive: boolean;
    displayOrder: number;
    note?: string;
  } | null;
}

interface FormData {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isActive: boolean;
  displayOrder: string;
  note: string;
}

const defaultForm: FormData = {
  bankCode: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
  isActive: true,
  displayOrder: "0",
  note: "",
};

export function BankAccountModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: BankAccountModalProps) {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [previewQR, setPreviewQR] = useState(false);

  const isEditing = !!editData;

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setForm({
          bankCode: editData.bankCode,
          bankName: editData.bankName,
          accountNumber: editData.accountNumber,
          accountName: editData.accountName,
          isActive: editData.isActive,
          displayOrder: editData.displayOrder.toString(),
          note: editData.note || "",
        });
      } else {
        setForm(defaultForm);
      }
      setPreviewQR(false);
    }
  }, [isOpen, editData]);

  const handleBankSelect = (bankCode: string) => {
    const bank = VIET_QR_BANKS.find((b) => b.code === bankCode);
    setForm((prev) => ({
      ...prev,
      bankCode,
      bankName: bank?.name || prev.bankName,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bankCode?.trim() || !form.accountNumber?.trim() || !form.accountName?.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setSaving(true);
      const method = isEditing ? "PUT" : "POST";
      const payload = {
        ...(isEditing && { id: editData!._id }),
        bankCode: form.bankCode,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        accountName: form.accountName,
        isActive: form.isActive,
        displayOrder: parseInt(form.displayOrder) || 0,
        note: form.note,
      };

      const res = await fetch("/api/admin/bank-accounts", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi lưu tài khoản");

      toast.success(isEditing ? "Đã cập nhật tài khoản!" : "Đã thêm tài khoản mới!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Lỗi không xác định");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const canPreview =
    form.bankCode && form.accountNumber && form.accountName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <BuildingLibraryIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white text-lg font-semibold">
                {isEditing ? "Chỉnh sửa tài khoản" : "Thêm tài khoản ngân hàng"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bank selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Ngân hàng <span className="text-red-500">*</span>
              </label>
              <select
                value={form.bankCode}
                onChange={(e) => handleBankSelect(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">-- Chọn ngân hàng --</option>
                {VIET_QR_BANKS.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bank name override */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                placeholder="Ví dụ: VietinBank"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Account number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Số tài khoản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) =>
                  setForm({ ...form, accountNumber: e.target.value.replace(/\s/g, "") })
                }
                placeholder="Ví dụ: 1133123456789"
                required
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
            </div>

            {/* Account name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tên chủ tài khoản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.accountName}
                onChange={(e) =>
                  setForm({ ...form, accountName: e.target.value.toUpperCase() })
                }
                placeholder="VÍ DỤ: NGUYEN VAN A"
                required
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase"
              />
            </div>

            {/* Display order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                min="0"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {form.isActive ? "Đang hoạt động" : "Tạm dừng"}
                </span>
              </label>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Ghi chú (tùy chọn)
            </label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Ghi chú nội bộ..."
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* QR Preview */}
          {canPreview && (
            <div className="border-2 border-dashed border-blue-200 dark:border-blue-700 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Preview mã QR VietQR
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewQR(!previewQR)}
                  className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {previewQR ? "Ẩn preview" : "Xem preview"}
                </button>
              </div>
              {previewQR && (
                <div className="flex justify-center">
                  <VietQRCode
                    bankCode={form.bankCode}
                    accountNumber={form.accountNumber}
                    accountName={form.accountName}
                    amount={100000}
                    description="preview qr code"
                    size="compact2"
                    className="max-h-72 rounded-xl"
                  />
                </div>
              )}
              {!previewQR && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Click "Xem preview" để kiểm tra mã QR trước khi lưu
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {saving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Thêm tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
