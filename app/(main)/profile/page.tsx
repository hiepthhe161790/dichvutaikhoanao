"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  KeyIcon,
  CodeBracketSquareIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { ProtectedRoute } from "@/lib/components/ProtectedRoute";

interface UserProfile {
  _id: string;
  email: string;
  phone: string;
  fullName: string;
  username: string;
  role: "customer" | "admin" | "seller";
  status: "active" | "blocked" | "pending";
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  totalDeposited?: number;
  createdAt: string;
  lastLogin: string;
  avatar?: string;
}

function ProfilePageContent() {
  const { user, updateUser } = useAuthContext();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    email: "",
  });
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiEnabled, setApiEnabled] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [generatingApi, setGeneratingApi] = useState(false);
  const [isNewKeyCreated, setIsNewKeyCreated] = useState(false);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/profile');

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const result = await response.json();

        if (result.success) {
          setProfileData(result.data);
          setEditForm({
            fullName: result.data.fullName || "",
            phone: result.data.phone || "",
            email: result.data.email || "",
          });
        } else {
          toast.error(result.error || 'Không thể tải thông tin profile');
        }

        // Fetch API Key
        const apiResponse = await fetch('/api/user/api-key');
        const apiResult = await apiResponse.json();
        if (apiResult.success) {
          setApiKey(apiResult.apiKey);
          setApiEnabled(apiResult.apiEnabled);
        }
      } catch (error) {
        console.error('Fetch profile error:', error);
        toast.error('Lỗi khi tải thông tin profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleEdit = () => {
    if (profileData) {
      setEditForm({
        fullName: profileData.fullName,
        phone: profileData.phone,
        email: profileData.email,
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setUpdating(true);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setProfileData(result.data);
        updateUser(result.data);
        toast.success("Cập nhật thông tin thành công!");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Lỗi khi cập nhật thông tin");
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error("Lỗi kết nối, vui lòng thử lại");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleGenerateApiKey = async () => {
    try {
      setGeneratingApi(true);
      const response = await fetch('/api/user/api-key', {
        method: 'POST',
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setApiKey(result.apiKey);
        setApiEnabled(result.apiEnabled);
        setIsNewKeyCreated(true);
        toast.success("Tạo API Key thành công!");
      } else {
        toast.error(result.error || "Lỗi khi tạo API Key");
      }
    } catch (error) {
      console.error('Generate API Key error:', error);
      toast.error("Lỗi kết nối, vui lòng thử lại");
    } finally {
      setGeneratingApi(false);
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success("Đã sao chép API Key");
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (loading || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <ShieldCheckIcon className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {profileData.fullName}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">
                  {profileData.email}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheckIcon className="w-4 h-4" />
                    {profileData.role === 'admin' ? 'Quản trị viên' :
                     profileData.role === 'seller' ? 'Người bán' : 'Khách hàng'}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Stats Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100 dark:border-slate-800">
              {/* Current Balance Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CurrencyDollarIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Số dư hiện tại
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                    {formatCurrency(profileData.balance)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Sẵn sàng sử dụng</p>
                </div>
              </div>

              {/* Total Deposited Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ArrowPathIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tổng tiền nạp
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                    {formatCurrency(profileData.totalDeposited || 0)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Từ giao dịch hoàn thành</p>
                </div>
              </div>

              {/* Total Spent Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShoppingCartIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Đã sử dụng
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                    {formatCurrency(profileData.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Đã mua {profileData.totalPurchased} đơn hàng
                  </p>
                </div>
            </div>
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Personal Info */}
            <div className="md:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Thông tin cá nhân
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={updating}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                      >
                        {updating ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <CheckIcon className="w-4 h-4" />
                        )}
                        {updating ? 'Đang lưu...' : 'Lưu'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        Hủy
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Họ và tên
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {profileData.fullName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tên đăng nhập
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-blue-600 dark:text-blue-400">@</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {profileData.username}
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Địa chỉ Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {profileData.email}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Số điện thoại
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {profileData.phone}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Registration Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Thời gian đăng ký
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatDate(profileData.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Last Login */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Đăng nhập gần đây
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatDate(profileData.lastLogin)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer API Section */}
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <CodeBracketSquareIcon className="w-6 h-6 text-blue-500" />
                      Developer API
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Kết nối hệ thống của bạn với API của chúng tôi
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/api-docs')}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium text-sm transition-colors"
                  >
                    Xem tài liệu API &rarr;
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mã xác thực (API Key)
                    </label>
                    {apiKey ? (
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showApiKey ? "text" : "password"}
                            value={apiKey}
                            readOnly
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-mono text-sm outline-none"
                          />
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                          >
                            {showApiKey ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        <button
                          onClick={handleCopyApiKey}
                          className="p-3 bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl transition-colors"
                          title="Sao chép"
                        >
                          <DocumentDuplicateIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleGenerateApiKey}
                          disabled={generatingApi}
                          className="p-3 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-xl transition-colors disabled:opacity-50"
                          title="Tạo mới API Key"
                        >
                          <ArrowPathIcon className={`w-5 h-5 ${generatingApi ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Bạn chưa tạo API Key nào.
                        </span>
                        <button
                          onClick={handleGenerateApiKey}
                          disabled={generatingApi}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium text-sm disabled:opacity-50"
                        >
                          {generatingApi ? (
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          ) : (
                            <KeyIcon className="w-4 h-4" />
                          )}
                          Tạo API Key
                        </button>
                      </div>
                    )}
                    {isNewKeyCreated && (
                      <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        Hãy sao chép khóa API này ở nơi an toàn. Bạn sẽ không thể nhìn thấy lại khóa này sau khi tải lại trang!
                      </p>
                    )}
                  </div>
                  
                  {apiKey && (
                    <div className="flex items-center justify-between mt-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Trạng thái API:</span>
                      <span className={`px-2 py-1 rounded-md font-medium ${apiEnabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {apiEnabled ? 'Đang hoạt động' : 'Bị vô hiệu hóa'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Thao tác nhanh
                </h3>

                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {/* Deposit Action */}
                  <button
                    onClick={() => router.push('/deposit')}
                    className="w-full py-4 flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 px-3 -mx-3 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                        <CurrencyDollarIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Nạp tiền vào ví
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Nạp tự động qua ngân hàng & thẻ cào
                        </p>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* History Action */}
                  <button
                    onClick={() => router.push('/history')}
                    className="w-full py-4 flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 px-3 -mx-3 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
                        <ClockIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Lịch sử mua hàng
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Theo dõi trạng thái các đơn hàng đã đặt
                        </p>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Change Password Action */}
                  <button
                    onClick={() => router.push('/auth/forgot-password')}
                    className="w-full py-4 flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 px-3 -mx-3 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                        <KeyIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Thay đổi mật khẩu
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Cập nhật mật khẩu mới bảo mật hơn
                        </p>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}