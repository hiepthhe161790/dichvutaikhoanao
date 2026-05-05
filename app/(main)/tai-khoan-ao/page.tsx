'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function KeywordLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Mua Tài Khoản Ảo - Shopee, TikTok, MMO, Hotmail Giá Rẻ
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Dịch vụ cung cấp tài khoản ảo chất lượng cao, giá rẻ nhất thị trường, bảo hành 100%
          </p>
          <div className="flex gap-4">
            <Link href="/buy" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Mua Ngay
            </Link>
            <Link href="/faq" className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Câu Hỏi Thường Gặp
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* What We Offer */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Dịch Vụ Mua Tài Khoản Ảo - Nhiều Nền Tảng
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-600 mb-3">Mua Tài Khoản Shopee</h3>
              <p className="text-gray-700 mb-4">
                Tài khoản Shopee trải ngoài từ cấp độ mới đến cấp độ cao. Hoàn toàn uy tín, được kiểm tra kỹ lưỡng và bảo hành toàn bộ.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Giá rẻ nhất thị trường</li>
                <li>✓ Bảo hành 100% nếu bị khóa</li>
                <li>✓ Giao ngay 24/7</li>
                <li>✓ Hỗ trợ kỹ thuật 24/7</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-600 mb-3">Mua Tài Khoản TikTok</h3>
              <p className="text-gray-700 mb-4">
                Tài khoản TikTok từ follower thấp đến follower cao. Tất cả đều là tài khoản uy tín, có lịch sử hoạt động, có follower thực.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Nhiều mức follower để lựa chọn</li>
                <li>✓ Tài khoản có lịch sử hoạt động</li>
                <li>✓ Bảo hành trọn đời</li>
                <li>✓ Thanh toán an toàn</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-600 mb-3">Hotmail Account Giá Rẻ</h3>
              <p className="text-gray-700 mb-4">
                Hotmail - Email Microsoft được sử dụng rộng rãi trên toàn thế giới. Tài khoản mới, không sử dụng trước đó, bảo hành lâu dài.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Email Hotmail chính hãng</li>
                <li>✓ Giá từ vài ngàn đồng</li>
                <li>✓ Không giới hạn số lượng</li>
                <li>✓ Hỗ trợ đặt lại mật khẩu</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-600 mb-3">Mua Tài Khoản MMO Giá Rẻ</h3>
              <p className="text-gray-700 mb-4">
                Tài khoản MMO từ nhiều game online phổ biến. Level cao, đã farm sẵn, có trang bị đầy đủ. Tất cả uy tín, bảo hành lâu dài.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Nhiều loại game MMO</li>
                <li>✓ Tài khoản level cao, có trang bị</li>
                <li>✓ Giao ngay, không bị khóa</li>
                <li>✓ Bảo hành trọn đời</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                Ngoài Shopee, TikTok, Hotmail, chúng tôi còn cung cấp nhiều tài khoản ảo khác từ các nền tảng phổ biến.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Gmail, Yahoo Mail</li>
                <li>✓ Lazada, Tokopedia</li>
                <li>✓ Instagram, Facebook</li>
                <li>✓ Nhiều nền tảng khác</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Tại Sao Chọn Chúng Tôi?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <h3 className="text-lg font-bold mb-2">Bảo Hành</h3>
              <p className="text-gray-600">Tất cả tài khoản đều có bảo hành 100%. Nếu có sự cố, hoàn tiền hoặc cấp tài khoản mới.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <h3 className="text-lg font-bold mb-2">Hỗ Trợ Liên Tục</h3>
              <p className="text-gray-600">Đội hỗ trợ khách hàng luôn sẵn sàng trợ giúp bạn bất kỳ lúc nào, kể cả lúc nửa đêm.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">Ngay</div>
              <h3 className="text-lg font-bold mb-2">Giao Tức Thì</h3>
              <p className="text-gray-600">Sau khi thanh toán thành công, tài khoản sẽ được giao ngay, không phải chờ đợi lâu.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Câu Hỏi Thường Gặp về Mua Tài Khoản
          </h2>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                Mua tài khoản ảo ở đâu uy tín?
              </h3>
              <p className="text-gray-600">
                Bạn có thể mua tài khoản ảo uy tín tại chúng tôi. Chúng tôi là dịch vụ hàng đầu với hàng ngàn khách hàng hài lòng. 
                Tất cả tài khoản được kiểm tra kỹ lưỡng trước khi giao.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                Giá mua tài khoản Shopee bao nhiêu?
              </h3>
              <p className="text-gray-600">
                Giá tài khoản Shopee thay đổi tùy theo cấp độ của tài khoản. Chúng tôi cung cấp giá rẻ nhất thị trường, 
                bắt đầu từ vài chục ngàn đồng cho tài khoản cấp độ mới.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                Hotmail account giá bao nhiêu?
              </h3>
              <p className="text-gray-600">
                Hotmail account tại chúng tôi có giá cực rẻ, từ chỉ vài ngàn đồng. Bạn có thể mua một hoặc mua numberrous với giá hàng loạt.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                Tài khoản TikTok có bao nhiêu follower?
              </h3>
              <p className="text-gray-600">
                Chúng tôi cung cấp tài khoản TikTok với nhiều mức follower khác nhau, từ 1k follower đến hàng triệu follower. 
                Bạn có thể chọn mức phù hợp với nhu cầu.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                Tài khoản MMO được farm sẵn hay mới tạo?
              </h3>
              <p className="text-gray-600">
                Chúng tôi cung cấp tài khoản MMO đã farm sẵn level cao với trang bị đầy đủ. Tất cả đều là tài khoản thật, có lịch sử, không phải fake.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                Nếu bị lỗi hoặc tài khoản MMO bị xóa thì sao?
              </h3>
              <p className="text-gray-600">
                Liên hệ hỗ trợ khách hàng 24/7. Chúng tôi sẽ xác minh và cấp tài khoản mới hoặc hoàn tiền. Bảo hành không giới hạn thời gian.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600">
                Nếu tài khoản bị khóa, liên hệ hỗ trợ khách hàng của chúng tôi. Chúng tôi sẽ hoàn tiền hoặc cấp tài khoản mới cho bạn 
                mà không phí gì thêm.
              </p>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Quy Trình Mua Tài Khoản Đơn Giản
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                1
              </div>
              <h3 className="font-bold mb-2">Chọn Tài Khoản</h3>
              <p className="text-gray-600">Duyệt qua danh sách tài khoản và chọn loại phù hợp với nhu cầu của bạn.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                2
              </div>
              <h3 className="font-bold mb-2">Thêm Vào Giỏ</h3>
              <p className="text-gray-600">Thêm tài khoản vào giỏ hàng, có thể mua nhiều tài khoản cùng lúc.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                3
              </div>
              <h3 className="font-bold mb-2">Thanh Toán</h3>
              <p className="text-gray-600">Chọn phương thức thanh toán và hoàn tất thanh toán một cách an toàn.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                4
              </div>
              <h3 className="font-bold mb-2">Nhận Tài Khoản</h3>
              <p className="text-gray-600">Tài khoản sẽ được giao ngay sau khi thanh toán, không phải chờ đợi.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Sẵn Sàng Mua Tài Khoản Ảo?
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Join hàng ngàn khách hàng hài lòng. Mua ngay với giá rẻ nhất thị trường.
          </p>
          <Link href="/buy" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700">
            Mua Ngay
          </Link>
        </section>
      </div>
    </div>
  );
}
