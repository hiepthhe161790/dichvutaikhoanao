"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { APP_NAME } from '@/constants/app';

interface SettingsData {
  platformName: string;
  platformEmail: string;
  platformPhone: string;
  serviceFee: string;
  minDeposit: string;
  maxDeposit: string;
  minWithdraw: string;
  maxWithdraw: string;
  withdrawFee: string;
  promoCode: string;
  promoDiscount: string;
  promoMinAmount: string;
}

export function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    platformName: APP_NAME,
    platformEmail: "support@hhshopee.vn",
    platformPhone: "0123456789",
    serviceFee: "2",
    minDeposit: "10000",
    maxDeposit: "50000000",
    minWithdraw: "50000",
    maxWithdraw: "20000000",
    withdrawFee: "1",
    promoCode: "WELCOME2024",
    promoDiscount: "10",
    promoMinAmount: "100000",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch settings');
      }

      setSettings(data.data);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error("Lỗi", {
        description: "Không thể tải cấu hình hệ thống",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      toast.success("Đã lưu cấu hình thành công!");
      setSettings(data.data); // Update with server response
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error("Lỗi", {
        description: error.message || "Không thể lưu cấu hình",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Platform Information */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-gray-900 dark:text-white mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
            Thông tin nền tảng
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên nền tảng
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email hỗ trợ
              </label>
              <input
                type="email"
                value={settings.platformEmail}
                onChange={(e) => setSettings({ ...settings, platformEmail: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={settings.platformPhone}
                onChange={(e) => setSettings({ ...settings, platformPhone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phí dịch vụ (%)
              </label>
              <input
                type="number"
                value={settings.serviceFee}
                onChange={(e) => setSettings({ ...settings, serviceFee: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Deposit Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-gray-900 dark:text-white mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
            Cài đặt nạp tiền
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số tiền nạp tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                value={settings.minDeposit}
                onChange={(e) => setSettings({ ...settings, minDeposit: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số tiền nạp tối đa (VNĐ)
              </label>
              <input
                type="number"
                value={settings.maxDeposit}
                onChange={(e) => setSettings({ ...settings, maxDeposit: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Withdrawal Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-gray-900 dark:text-white mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
            Cài đặt rút tiền
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số tiền rút tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                value={settings.minWithdraw}
                onChange={(e) => setSettings({ ...settings, minWithdraw: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số tiền rút tối đa (VNĐ)
              </label>
              <input
                type="number"
                value={settings.maxWithdraw}
                onChange={(e) => setSettings({ ...settings, maxWithdraw: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phí rút tiền (%)
              </label>
              <input
                type="number"
                value={settings.withdrawFee}
                onChange={(e) => setSettings({ ...settings, withdrawFee: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Promotion Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-gray-900 dark:text-white mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
            Cấu hình khuyến mãi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mã khuyến mãi
              </label>
              <input
                type="text"
                value={settings.promoCode}
                onChange={(e) => setSettings({ ...settings, promoCode: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Giảm giá (%)
              </label>
              <input
                type="number"
                value={settings.promoDiscount}
                onChange={(e) => setSettings({ ...settings, promoDiscount: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Giá trị đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                value={settings.promoMinAmount}
                onChange={(e) => setSettings({ ...settings, promoMinAmount: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
