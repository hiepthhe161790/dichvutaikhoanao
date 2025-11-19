"use client";

import { useState, useEffect } from 'react';
import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon, MessageCircleIcon } from 'lucide-react';

interface Settings {
  platformName: string;
  platformEmail: string;
  platformPhone: string;
  serviceFee: number;
  minDeposit: number;
  maxDeposit: number;
  minWithdraw: number;
  maxWithdraw: number;
  withdrawFee: number;
}

interface SettingsResponse {
  success: boolean;
  data?: Settings;
  error?: string;
}

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const result: SettingsResponse = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch settings');
        }

        setSettings(result.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Fetch settings error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Lỗi tải dữ liệu
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh sau.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Thông tin liên hệ
              </h2>

              <div className="space-y-6">
                {/* Platform Name */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-xl font-bold">
                      {settings?.platformName?.charAt(0)?.toUpperCase() || 'P'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {settings?.platformName || 'Tên Platform'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Nền tảng dịch vụ tài khoản chất lượng cao
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <PhoneIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Điện thoại
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {settings?.platformPhone || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <MailIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Email
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {settings?.platformEmail || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>

                {/* Support Hours */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Giờ hỗ trợ
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      24/7 - Hỗ trợ mọi lúc
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Thông tin dịch vụ
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phí dịch vụ:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {settings?.serviceFee || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Nạp tối thiểu:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {(settings?.minDeposit || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Nạp tối đa:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {(settings?.maxDeposit || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rút tối thiểu:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {(settings?.minWithdraw || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rút tối đa:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {(settings?.maxWithdraw || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phí rút tiền:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {settings?.withdrawFee || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Gửi tin nhắn
            </h2>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Họ tên
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Nhập họ tên của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Nhập email của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chủ đề
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                  <option value="">Chọn chủ đề</option>
                  <option value="support">Hỗ trợ kỹ thuật</option>
                  <option value="billing">Thanh toán</option>
                  <option value="account">Tài khoản</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tin nhắn
                </label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Nhập nội dung tin nhắn..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition duration-200 flex items-center justify-center space-x-2"
              >
                <MessageCircleIcon className="w-5 h-5" />
                <span>Gửi tin nhắn</span>
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Lưu ý:</strong> Tin nhắn của bạn sẽ được xử lý trong vòng 24 giờ. Đối với vấn đề khẩn cấp, vui lòng liên hệ trực tiếp qua điện thoại.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Câu hỏi thường gặp
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Làm thế nào để nạp tiền?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Bạn có thể nạp tiền qua các phương thức thanh toán điện tử hoặc chuyển khoản ngân hàng. Số tiền tối thiểu là {(settings?.minDeposit || 0).toLocaleString('vi-VN')} đ.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Thời gian xử lý đơn hàng?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Đơn hàng thường được xử lý trong vòng 5-15 phút. Đối với đơn hàng lớn, thời gian có thể lâu hơn.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Chính sách hoàn tiền?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Chúng tôi hỗ trợ hoàn tiền trong vòng 24 giờ nếu sản phẩm chưa được sử dụng. Phí hoàn tiền là {settings?.withdrawFee || 0}%.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Bảo mật thông tin?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Chúng tôi cam kết bảo mật tuyệt đối thông tin khách hàng. Tất cả dữ liệu được mã hóa và lưu trữ an toàn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
