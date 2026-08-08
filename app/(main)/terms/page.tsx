"use client";

import { ShieldCheck, FileText, CheckCircle2, AlertTriangle, RefreshCw, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
            <FileText size={36} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Điều Khoản Dịch Vụ
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Cập nhật lần cuối: Ngày 09 tháng 08 năm 2026. Vui lòng đọc kỹ các quy định dưới đây trước khi sử dụng dịch vụ của chúng tôi.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-10 space-y-8">
          
          {/* Section 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <span className="flex items-center justify-center w-7 h-7 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm">1</span>
              Chấp Thuận Các Điều Khoản
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-10">
              Bằng việc đăng ký tài khoản và giao dịch trên website của chúng tôi, bạn đồng ý chịu sự ràng buộc bởi các điều khoản, điều kiện và chính sách được nêu tại đây. Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản này, vui lòng ngừng sử dụng dịch vụ ngay lập tức.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <span className="flex items-center justify-center w-7 h-7 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm">2</span>
              Trách Nhiệm Tài Khoản Người Dùng
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-10">
              Bạn có trách nhiệm bảo mật thông tin đăng nhập cá nhân (Mật khẩu, Mã bảo mật 2FA) và chịu hoàn toàn trách nhiệm cho tất cả các hoạt động xảy ra dưới tên tài khoản của bạn. Tuyệt đối không chia sẻ tài khoản cho bên thứ ba.
            </p>
          </div>

          {/* Section 3 - Warranty Policy (Crucial for Resource Selling) */}
          <div className="space-y-4 p-5 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20 rounded-xl">
            <div className="flex items-center gap-3 text-lg font-bold text-blue-900 dark:text-blue-400">
              <ShieldCheck className="text-blue-600 dark:text-blue-400" />
              Chính Sách Bảo Hành & Đổi Trả Tài Khoản
            </div>
            <div className="pl-8 space-y-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>Do tính chất đặc thù của sản phẩm tài nguyên số (tài khoản quảng cáo, tài khoản ảo Shopee, TikTok, Mail...), chính sách bảo hành được quy định nghiêm ngặt như sau:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                <li>
                  <strong className="text-gray-900 dark:text-white">Thời gian bảo hành:</strong> Trong vòng 24 giờ kể từ thời điểm đơn hàng được giao thành công trên hệ thống. Sau 24 giờ, mọi khiếu nại sẽ không được giải quyết.
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">Trường hợp được bảo hành (Đổi mới):</strong> Tài khoản không thể đăng nhập (sai mật khẩu), bị khóa/checkpoint từ trước khi mua, hoặc thiếu thông tin cấu hình so với mô tả.
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">Trường hợp từ chối bảo hành:</strong> Tài khoản bị khóa sau khi người dùng đăng nhập và đổi thông tin (đổi IP, đổi thiết bị lạ), tài khoản bị vi phạm chính sách do chạy quảng cáo bùng, spam tin nhắn, hoặc bị khóa do vi phạm các chính sách vận hành của nền tảng tương ứng.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 4 - Prohibited Uses */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <span className="flex items-center justify-center w-7 h-7 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm">3</span>
              Quy Định Sử Dụng Tài Nguyên
            </div>
            <div className="pl-10 space-y-2 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              <p>Khách hàng mua tài nguyên trên hệ thống cam kết sử dụng vào mục đích hợp pháp. Nghiêm cấm tuyệt đối sử dụng tài khoản vào các hoạt động:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <span className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                  <AlertTriangle size={14} /> Lừa đảo, chiếm đoạt tài sản
                </span>
                <span className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                  <AlertTriangle size={14} /> Spam tin nhắn, phát tán mã độc
                </span>
                <span className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                  <AlertTriangle size={14} /> Công kích mạng, đánh cắp dữ liệu
                </span>
                <span className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                  <AlertTriangle size={14} /> Các hành vi vi phạm pháp luật Việt Nam
                </span>
              </div>
              <p className="mt-2 text-xs text-rose-500 italic">
                * Mọi vi phạm pháp luật phát sinh từ việc sử dụng tài nguyên đã mua, người mua hoàn toàn chịu trách nhiệm trước pháp luật. Hệ thống sẽ phối hợp cung cấp lịch sử truy cập của tài khoản đó khi có yêu cầu từ cơ quan chức năng.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <span className="flex items-center justify-center w-7 h-7 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm">4</span>
              Giới Hạn Trách Nhiệm
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-10">
              Chúng tôi cố gắng cung cấp tài nguyên ổn định nhất. Tuy nhiên, chúng tôi không cam kết tài khoản sẽ tồn tại vĩnh viễn trên nền tảng của bên thứ ba (do thuật toán quét quét của Shopee, Facebook, Google thay đổi thường xuyên). Do đó, bạn nên sử dụng ngay sau khi mua và backup dữ liệu cần thiết.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <span className="flex items-center justify-center w-7 h-7 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm">5</span>
              Thay Đổi Điều Khoản
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-10">
              Ban quản trị hệ thống có quyền sửa đổi hoặc cập nhật các điều khoản dịch vụ này bất kỳ lúc nào mà không cần báo trước. Việc tiếp tục sử dụng website sau khi các thay đổi được đăng tải đồng nghĩa với việc bạn đồng ý với các thay đổi đó.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex justify-center items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            Quay lại Đăng ký
          </Link>
          <span>•</span>
          <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            Chính sách bảo mật
          </Link>
        </div>

      </div>
    </div>
  );
}
