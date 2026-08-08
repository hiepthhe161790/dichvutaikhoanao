"use client";

import { Eye, Shield, Lock, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
            <Lock size={36} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Chính Sách Bảo Mật
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Cập nhật lần cuối: Ngày 09 tháng 08 năm 2026. Chúng tôi cam kết bảo vệ tuyệt đối thông tin cá nhân và dữ liệu giao dịch của bạn.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-10 space-y-8">
          
          {/* Section 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <span className="flex items-center justify-center w-7 h-7 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm">1</span>
              Thu Thập Thông Tin
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-10 space-y-2">
              <p>Chúng tôi chỉ thu thập các thông tin cơ bản phục vụ quá trình tạo tài khoản và bảo mật giao dịch, bao gồm:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Tên đăng nhập (Username) và Email liên hệ để nhận hóa đơn/thông tin tài khoản.</li>
                <li>Lịch sử giao dịch, lịch sử nạp tiền và lịch sử mua tài khoản của bạn trên hệ thống.</li>
                <li>Địa chỉ IP và thông tin thiết bị (User Agent) khi bạn thao tác để tăng cường bảo mật tài khoản chống đăng nhập trái phép.</li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <span className="flex items-center justify-center w-7 h-7 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm">2</span>
              Sử Dụng Thông Tin
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-10 space-y-2">
              <p>Mọi thông tin thu thập được sử dụng duy nhất cho các mục đích:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cung cấp và giao dịch tài nguyên/tài khoản ảo đến hòm thư của bạn.</li>
                <li>Gửi thông báo email tự động khi trạng thái đơn hàng của bạn thay đổi (Completed, Failed, Refunded).</li>
                <li>Xác minh giao dịch nạp tiền qua hệ thống tự động ngân hàng/PayOS.</li>
                <li>Hỗ trợ xử lý kỹ thuật, giải đáp khiếu nại thông qua hệ thống Support Ticket.</li>
              </ul>
            </div>
          </div>

          {/* Section 3 - Secret Data Policy */}
          <div className="space-y-4 p-5 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20 rounded-xl">
            <div className="flex items-center gap-3 text-lg font-bold text-blue-900 dark:text-blue-400">
              <Shield className="text-blue-600 dark:text-blue-400" />
              Cam Kết Bảo Mật Thông Tin Mua Bán
            </div>
            <div className="pl-8 space-y-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>Đặc thù của website bán tài nguyên ảo là dữ liệu tài khoản trong kho hàng. Chúng tôi cam kết:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                <li>
                  <strong className="text-gray-900 dark:text-white">Dữ liệu độc bản:</strong> Tài khoản bán ra là độc bản, hệ thống tự động xóa khỏi kho hiển thị ngay sau khi bạn mua thành công. Tuyệt đối không bán lại 1 tài khoản cho 2 khách hàng.
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">Không lưu giữ bản sao lâu dài:</strong> Dữ liệu mật khẩu và cookie tài khoản đã bán được mã hóa trong cơ sở dữ liệu. Chúng tôi khuyến nghị quý khách tải về và thay đổi mật khẩu/thông tin liên kết ngay sau khi mua.
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">Không chia sẻ dữ liệu:</strong> Chúng tôi không bao giờ bán, trao đổi hoặc chia sẻ thông tin giao dịch, số dư ví hay email cá nhân của bạn cho bất kỳ doanh nghiệp hoặc cá nhân nào khác ngoài mục đích thực hiện đơn hàng.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <span className="flex items-center justify-center w-7 h-7 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm">3</span>
              Bảo Mật Cơ Sở Dữ Liệu
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-10">
              Chúng tôi áp dụng các công nghệ bảo mật tiên tiến (Mã hóa SSL, hash mật khẩu bằng thuật toán bảo mật cao, rate limit chống dò pass...) để ngăn chặn truy cập trái phép. Mật khẩu của bạn được mã hóa một chiều hoàn toàn, kể cả Quản trị viên (Admin) cũng không thể nhìn thấy mật khẩu thô của bạn.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <span className="flex items-center justify-center w-7 h-7 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm">4</span>
              Sử Dụng Cookie
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-10">
              Trang web sử dụng Cookie và LocalStorage để lưu trữ trạng thái đăng nhập (JWT Token) giúp bạn không cần phải đăng nhập lại mỗi khi mở trình duyệt. Bạn có thể cấu hình chặn cookie trong cài đặt trình duyệt, nhưng một số tính năng của website có thể không hoạt động chính xác.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex justify-center items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            Quay lại Đăng ký
          </Link>
          <span>•</span>
          <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            Điều khoản dịch vụ
          </Link>
        </div>

      </div>
    </div>
  );
}
