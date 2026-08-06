"use client";

import { BookOpenIcon, KeyIcon, CreditCardIcon, CommandLineIcon, BellIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export function DocsPage() {
  return (
    <div className="space-y-8 pb-12 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        <div className="relative space-y-4">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
            Tài liệu chính thức
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Hướng dẫn Vận hành Hệ thống Tài Nguyên 247
          </h1>
          <p className="text-blue-100 max-w-2xl text-sm md:text-base">
            Cổng thông tin hướng dẫn chi tiết dành cho Quản trị viên giúp quản lý kho hàng, cấu hình cổng thanh toán tự động, tích hợp API ngoài và theo dõi nhật ký hoạt động của hệ thống.
          </p>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: Quản lý Sản phẩm & Kho */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-gray-150 dark:border-slate-800 hover:shadow-lg transition-all space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <KeyIcon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">1. Quản lý Sản phẩm & Upload Kho</h2>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>Để thêm hoặc cập nhật kho tài khoản ảo bán lẻ:</p>
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>Vào tab <b>Danh mục</b> để tạo phân loại (ví dụ: Gmail, Hotmail, Shopee...).</li>
              <li>Vào tab <b>Sản phẩm</b>, nhấn <i>Thêm sản phẩm mới</i>, điền tên, giá tiền, chọn nền tảng và mô tả.</li>
              <li>Vào tab <b>Tài khoản</b>, nhấn <i>Thêm tài khoản</i> hoặc <i>Upload danh sách</i>.</li>
              <li>Định dạng dòng dữ liệu khuyên dùng: <code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">TàiKhoản|MậtKhẩu|MailKhôiPhục</code> (mỗi tài khoản nằm trên 1 dòng riêng biệt).</li>
            </ol>
          </div>
        </div>

        {/* Section 2: Tích hợp API Ngoài */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-gray-150 dark:border-slate-800 hover:shadow-lg transition-all space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <ArrowPathIcon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">2. Tích hợp API Ngoài (Dual-Source)</h2>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>Hệ thống hỗ trợ tự động lấy hàng từ nhà cung cấp ngoài khi kho nội bộ hết hàng:</p>
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>Vào tab <b>API Ngoài</b> (Providers) để cấu hình thông tin nhà cung cấp (ví dụ: NikClone, CloneGiáRẻ...).</li>
              <li>Điền URL API, Token bảo mật và kích hoạt trạng thái.</li>
              <li>Vào <b>Sản phẩm</b>, nhấn chỉnh sửa sản phẩm cần liên kết, chuyển đổi chế độ nguồn hàng sang API Ngoài và chọn ID sản phẩm tương ứng từ nhà cung cấp.</li>
              <li>Hệ thống sẽ tự động cân đối giá mua đầu vào và trừ tiền ví khi có giao dịch.</li>
            </ol>
          </div>
        </div>

        {/* Section 3: Cấu hình Thanh toán PayOS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-gray-150 dark:border-slate-800 hover:shadow-lg transition-all space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CreditCardIcon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">3. Tự động hóa Nạp tiền (PayOS)</h2>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>Quy trình cấu hình và đối soát hóa đơn nạp tiền tự động qua QR Code:</p>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>Đảm bảo các khóa <code className="text-xs bg-gray-100 dark:bg-slate-800 px-1">PAYOS_CLIENT_ID</code>, <code className="text-xs bg-gray-100 dark:bg-slate-800 px-1">PAYOS_API_KEY</code>, và <code className="text-xs bg-gray-100 dark:bg-slate-800 px-1">PAYOS_CHECKSUM_KEY</code> được cấu hình đúng trên máy chủ.</li>
              <li>Khi khách hàng quét mã QR chuyển khoản chính xác nội dung, webhook sẽ tự động khớp lệnh và cộng tiền tức thì.</li>
              <li>Trường hợp khách hàng chuyển khoản thiếu tiền hoặc sai nội dung: Admin vào mục <b>Thanh toán</b>, chọn hóa đơn đang treo (Pending), kiểm tra sao kê ngân hàng và nhấn <i>Phê duyệt thủ công</i> để cộng tiền cho khách.</li>
            </ul>
          </div>
        </div>

        {/* Section 4: Cảnh báo Telegram & Nhật ký Logs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-gray-150 dark:border-slate-800 hover:shadow-lg transition-all space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
              <BellIcon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">4. Báo động Telegram & Nhật ký Hệ thống</h2>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>Hệ thống tự động hóa giám sát an ninh và hoạt động quản trị:</p>
            <ul className="list-disc pl-4 space-y-1.5">
              <li><b>Telegram Alerts:</b> Cung cấp báo động thời gian thực đến điện thoại của Admin khi có yêu cầu nạp tiền mới, khi cổng thanh toán nhận tiền thành công, hoặc khi API ngoài gặp sự cố hết số dư.</li>
              <li><b>Audit Logs:</b> Mọi hoạt động của Admin (Thay đổi số dư, phê duyệt thủ công, đổi cấu hình hệ thống) và hoạt động nhạy cảm của khách hàng (Đăng nhập, Mua hàng) đều được ghi nhận vào cơ sở dữ liệu MongoDB và hiển thị chi tiết trong hệ thống kiểm toán log của cơ sở dữ liệu để chống gian lận.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Security & System Check Section */}
      <div className="bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-6 border border-blue-200 dark:border-blue-900/50 space-y-3">
        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide flex items-center gap-2">
          <CommandLineIcon className="w-5 h-5" />
          Khuyến cáo vận hành an toàn
        </h3>
        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
          1. Tuyệt đối không chia sẻ khóa Token API của nhà cung cấp ngoài hoặc API Key PayOS cho bất kỳ bên thứ ba nào. <br />
          2. Khi thay đổi cấu hình hệ thống hoặc số dư người dùng thủ công, hệ thống luôn ghi lại nhật ký hành động đi kèm địa chỉ IP và mã Admin phục vụ đối soát chéo. <br />
          3. Hãy định kỳ rà soát các sản phẩm cấu hình API ngoài để tránh tình trạng nhà cung cấp thay đổi giá mua tăng đột biến gây thua lỗ.
        </p>
      </div>
    </div>
  );
}
