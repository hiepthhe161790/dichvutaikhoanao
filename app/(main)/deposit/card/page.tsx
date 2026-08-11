'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { CreditCardIcon, ClockIcon, CheckCircleIcon, XCircleIcon, CogIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { ProtectedRoute } from '@/lib/components/ProtectedRoute';

interface CardDeposit {
  _id: string;
  cardType: string;
  serial: string;
  pin: string;
  amount: number;
  actualAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'processing';
  reason?: string;
  createdAt: string;
  processedAt?: string;
}

interface CardDepositResponse {
  success: boolean;
  data?: CardDeposit[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}

const CARD_TYPES = [
  { value: 'viettel', label: 'Viettel', fee: 0.3 },
  { value: 'mobifone', label: 'Mobifone', fee: 0.3 },
  { value: 'vinaphone', label: 'Vinaphone', fee: 0.3 },
  { value: 'vietnamobile', label: 'Vietnamobile', fee: 0.3 },
  { value: 'gmobile', label: 'Gmobile', fee: 0.3 },
  { value: 'zing', label: 'Zing', fee: 0.2 },
  { value: 'gate', label: 'Gate', fee: 0.2 },
  { value: 'garena', label: 'Garena', fee: 0.2 },
  { value: 'vcoin', label: 'Vcoin', fee: 0.2 },
];

const DENOMINATIONS = [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000];

const CARD_BRAND_STYLES: Record<string, { bg: string, text: string, border: string, activeBg: string, activeText: string, activeBorder: string }> = {
  viettel: {
    bg: 'bg-red-50/40 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-100 dark:border-red-900/20',
    activeBg: 'bg-red-600 dark:bg-red-600',
    activeText: 'text-white',
    activeBorder: 'border-red-600 dark:border-red-500'
  },
  mobifone: {
    bg: 'bg-blue-50/40 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-950/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-900/20',
    activeBg: 'bg-blue-600 dark:bg-blue-600',
    activeText: 'text-white',
    activeBorder: 'border-blue-600 dark:border-blue-500'
  },
  vinaphone: {
    bg: 'bg-sky-50/40 dark:bg-sky-950/10 hover:bg-sky-50 dark:hover:bg-sky-950/20',
    text: 'text-sky-700 dark:text-sky-400',
    border: 'border-sky-100 dark:border-sky-900/20',
    activeBg: 'bg-sky-600 dark:bg-sky-600',
    activeText: 'text-white',
    activeBorder: 'border-sky-600 dark:border-sky-500'
  },
  vietnamobile: {
    bg: 'bg-orange-50/40 dark:bg-orange-950/10 hover:bg-orange-50 dark:hover:bg-orange-950/20',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-100 dark:border-orange-900/20',
    activeBg: 'bg-orange-600 dark:bg-orange-600',
    activeText: 'text-white',
    activeBorder: 'border-orange-600 dark:border-orange-500'
  },
  gmobile: {
    bg: 'bg-yellow-50/40 dark:bg-yellow-950/10 hover:bg-yellow-50 dark:hover:bg-yellow-950/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-100 dark:border-yellow-900/20',
    activeBg: 'bg-yellow-600 dark:bg-yellow-600',
    activeText: 'text-white',
    activeBorder: 'border-yellow-600 dark:border-yellow-500'
  },
  zing: {
    bg: 'bg-emerald-50/40 dark:bg-emerald-950/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/20',
    activeBg: 'bg-emerald-600 dark:bg-emerald-600',
    activeText: 'text-white',
    activeBorder: 'border-emerald-600 dark:border-emerald-500'
  },
  gate: {
    bg: 'bg-purple-50/40 dark:bg-purple-950/10 hover:bg-purple-50 dark:hover:bg-purple-950/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-900/20',
    activeBg: 'bg-purple-600 dark:bg-purple-600',
    activeText: 'text-white',
    activeBorder: 'border-purple-600 dark:border-purple-500'
  },
  garena: {
    bg: 'bg-rose-50/40 dark:bg-rose-950/10 hover:bg-rose-50 dark:hover:bg-rose-950/20',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-100 dark:border-rose-900/20',
    activeBg: 'bg-rose-600 dark:bg-rose-600',
    activeText: 'text-white',
    activeBorder: 'border-rose-600 dark:border-rose-500'
  },
  vcoin: {
    bg: 'bg-indigo-50/40 dark:bg-indigo-950/10 hover:bg-indigo-50 dark:hover:bg-indigo-950/20',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-100 dark:border-indigo-900/20',
    activeBg: 'bg-indigo-600 dark:bg-indigo-600',
    activeText: 'text-white',
    activeBorder: 'border-indigo-600 dark:border-indigo-500'
  }
};

export default function CardDepositPage() {
  const { user } = useAuth();
  const [cardDeposits, setCardDeposits] = useState<CardDeposit[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [cardType, setCardType] = useState('');
  const [serial, setSerial] = useState('');
  const [pin, setPin] = useState('');
  const [amount, setAmount] = useState('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const calculateActualAmount = () => {
    if (!cardType || !amount) return 0;
    const config = CARD_TYPES.find(c => c.value === cardType);
    if (!config) return 0;
    const fee = parseInt(amount) * config.fee;
    return Math.floor(parseInt(amount) - fee);
  };

  const fetchCardDeposits = async (selectedPage: number = 1, status?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: selectedPage.toString(),
        limit: '10',
      });

      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`/api/card?${params}`);
      const result: CardDepositResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch card deposits');
      }

      setCardDeposits(result.data || []);
      setPagination(result.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Fetch card deposits error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchCardDeposits(1);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardType || !serial || !pin || !amount) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cardType,
          serial: serial.trim(),
          pin: pin.trim(),
          amount: parseInt(amount),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit card deposit');
      }

      setSuccess('Thẻ đã được gửi thành công! Vui lòng chờ xử lý.');

      // Reset form
      setCardType('');
      setSerial('');
      setPin('');
      setAmount('');

      // Refresh list
      fetchCardDeposits(1, statusFilter || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      console.error('Submit card deposit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    fetchCardDeposits(1, status || undefined);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchCardDeposits(newPage, statusFilter || undefined);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      completed: 'Thành công',
      failed: 'Thất bại',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <ClockIcon className="w-4 h-4" />,
      processing: <CogIcon className="w-4 h-4" />,
      completed: <CheckCircleIcon className="w-4 h-4" />,
      failed: <XCircleIcon className="w-4 h-4" />,
    };
    return icons[status as keyof typeof icons] || icons.pending;
  };

  const getCardTypeName = (cardType: string) => {
    const card = CARD_TYPES.find(c => c.value === cardType);
    return card?.label || cardType;
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nạp Thẻ</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Nạp tiền vào tài khoản bằng thẻ cào điện thoại và game
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card Deposit Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-6 space-y-6">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gửi Thẻ Cào</h2>
                <p className="text-xs text-gray-500 mt-1">Hệ thống xử lý duyệt thẻ hoàn toàn tự động</p>
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-xs font-semibold">✕ {error}</p>
                </div>
              )}

              {success && (
                <div className="p-3.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <p className="text-green-600 dark:text-green-400 text-xs font-semibold">✓ {success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Card Brand Grid Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Loại thẻ *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CARD_TYPES.map((card) => {
                      const style = CARD_BRAND_STYLES[card.value] || {
                        bg: 'bg-gray-50/50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700',
                        text: 'text-gray-700 dark:text-gray-300',
                        border: 'border-gray-200 dark:border-slate-700',
                        activeBg: 'bg-blue-600 dark:bg-blue-600',
                        activeText: 'text-white',
                        activeBorder: 'border-blue-600 dark:border-blue-500'
                      };
                      const isActive = cardType === card.value;
                      return (
                        <button
                          key={card.value}
                          type="button"
                          onClick={() => setCardType(card.value)}
                          className={`p-2.5 border rounded-xl flex flex-col items-center justify-center transition-all duration-200 relative group cursor-pointer overflow-hidden ${
                            isActive
                              ? `${style.activeBg} ${style.activeText} ${style.activeBorder} shadow-md scale-[1.02] ring-2 ring-blue-500/20`
                              : `${style.bg} ${style.text} ${style.border} hover:scale-[1.01]`
                          }`}
                        >
                          <span className="text-sm font-bold tracking-wide capitalize">{card.label}</span>
                          <span className={`text-[10px] mt-1 font-medium transition-colors ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                            Phí {card.fee * 100}%
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Denomination Grid Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Mệnh giá *
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {DENOMINATIONS.map((denom) => {
                      const isActive = amount === denom.toString();
                      return (
                        <button
                          key={denom}
                          type="button"
                          onClick={() => setAmount(denom.toString())}
                          className={`py-2 px-1 border text-center rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'border-blue-600 bg-blue-600 text-white shadow-sm scale-[1.02] ring-2 ring-blue-500/10'
                              : 'border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700/80 text-gray-700 dark:text-gray-300 hover:scale-[1.01]'
                          }`}
                        >
                          {denom.toLocaleString('vi-VN')}đ
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Serial Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Mã Serial *
                  </label>
                  <input
                    type="text"
                    value={serial}
                    onChange={(e) => setSerial(e.target.value)}
                    placeholder="Nhập mã serial trên thẻ"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                    required
                  />
                </div>

                {/* Pin Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Mã Thẻ (Pin) *
                  </label>
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Nhập mã pin dưới lớp cào"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                    required
                  />
                </div>

                {/* Receipt Details Box */}
                {cardType && amount && (
                  <div className="bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-100 dark:border-slate-800 p-4 space-y-2.5 mt-2 shadow-inner">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Mệnh giá thẻ:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{parseInt(amount).toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between text-xs text-red-500">
                      <span>Phí gạch thẻ ({(CARD_TYPES.find(c => c.value === cardType)?.fee || 0) * 100}%):</span>
                      <span className="font-semibold">-{(parseInt(amount) * (CARD_TYPES.find(c => c.value === cardType)?.fee || 0)).toLocaleString('vi-VN')} đ</span>
                    </div>
                    <hr className="border-dashed border-gray-200 dark:border-slate-700 my-2" />
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-gray-700 dark:text-gray-300">Thực nhận vào ví:</span>
                      <span className="text-green-600 dark:text-green-400">{calculateActualAmount().toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center text-sm cursor-pointer mt-4"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Đang gửi yêu cầu...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="w-5 h-5 mr-2" />
                      Nạp thẻ ngay
                    </>
                  )}
                </button>
              </form>

              {/* Warning box */}
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-start gap-3">
                <InformationCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">LƯU Ý QUAN TRỌNG</h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                    Vui lòng chọn đúng nhà mạng và mệnh giá thẻ. Chọn sai mệnh giá sẽ bị phạt hoặc mất thẻ.
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1.5 leading-relaxed font-semibold">
                    Nếu sau 15 phút không nhận được tiền, vui lòng liên hệ ADM ⇒ ZALO để đối soát.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Deposit History */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lịch sử nạp thẻ</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Danh sách thẻ cào bạn đã gửi lên hệ thống
                </p>
              </div>

              {/* Filters */}
              <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusFilter('')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      statusFilter === ''
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    Tất cả ({pagination.total})
                  </button>
                  <button
                    onClick={() => handleStatusFilter('pending')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      statusFilter === 'pending'
                        ? 'bg-yellow-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    Chờ xử lý
                  </button>
                  <button
                    onClick={() => handleStatusFilter('processing')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      statusFilter === 'processing'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    Đang xử lý
                  </button>
                  <button
                    onClick={() => handleStatusFilter('completed')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      statusFilter === 'completed'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    Thành công
                  </button>
                  <button
                    onClick={() => handleStatusFilter('failed')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      statusFilter === 'failed'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    Thất bại
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                        #
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                        Nhà mạng
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                        Serial
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                        Pin
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                        Mệnh giá
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                        Thực nhận
                      </th>
                      <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                        Thời gian
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                        Lý do
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i}>
                          <td colSpan={9} className="px-6 py-4">
                            <div className="animate-pulse h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                          </td>
                        </tr>
                      ))
                    ) : cardDeposits.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No data available in table
                        </td>
                      </tr>
                    ) : (
                      cardDeposits.map((deposit, index) => (
                        <tr
                          key={deposit._id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                            {(pagination.page - 1) * pagination.limit + index + 1}
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">
                            {getCardTypeName(deposit.cardType)}
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-mono">
                            {deposit.serial}
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-mono">
                            {deposit.pin}
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">
                            {deposit.amount.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-6 py-4 text-green-600 font-medium">
                            {deposit.actualAmount.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(deposit.status)}`}>
                              {getStatusIcon(deposit.status)}
                              <span className="ml-1">{getStatusText(deposit.status)}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                            {new Date(deposit.createdAt).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                            {deposit.reason || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-200"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
