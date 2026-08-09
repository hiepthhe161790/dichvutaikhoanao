# HƯỚNG DẪN TRIỂN KHAI NEXT.JS TRÊN RENDER KẾT HỢP CLOUDFLARE

Tài liệu này hướng dẫn cách đưa ứng dụng Next.js Fullstack (Frontend & Backend chạy chung) lên máy chủ **Render** và cấu hình tối ưu hóa tốc độ tải trang, bảo mật qua **Cloudflare**.

Sự kết hợp này giúp:
- Chạy các tác vụ nền/cronjob không lo quá tải hoặc bị ngắt quãng giữa chừng.
- Giữ kết nối stream thanh toán real-time (SSE) hoạt động ổn định 24/7.
- Tận dụng mạng lưới CDN của Cloudflare để lưu bộ nhớ đệm (cache) giao diện, giúp web tải cực nhanh tại Việt Nam.

---

## 1. Bước 1: Deploy Next.js lên Render (Web Service)

1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com/).
2. Click chọn **New +** -> **Web Service**.
3. Kết nối với tài khoản GitHub/GitLab của bạn và chọn Repository của dự án.
4. Tại màn hình cấu hình dịch vụ, thiết lập các thông số sau:
   - **Name:** Đặt tên dự án (ví dụ: `shop-tai-nguyen-247`).
   - **Language:** Chọn `Node`.
   - **Region:** Khuyên dùng chọn `Singapore` để có tốc độ ping về Việt Nam nhanh nhất và kết nối ổn định nhất tới MongoDB Atlas.
   - **Branch:** Chọn nhánh chạy bản chính thức (ví dụ: `main` hoặc `master`).
5. **Cấu hình Lệnh Build & Chạy:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
6. **Chọn gói phần cứng (Instance Type):**
   - > [!IMPORTANT]
     > Bắt buộc phải chọn tối thiểu gói **Starter ($7/tháng)**. Tuyệt đối **không dùng gói Free** vì server sẽ bị "ngủ" sau 15 phút không hoạt động, khiến khách vào sau phải chờ 1 phút khởi động và làm mất webhook nạp tiền của PayOS.
7. **Cấu hình Biến môi trường (Environment Variables):**
   - Click vào nút **Advanced** -> chọn **Add Environment Variable** để thêm đầy đủ các biến cấu hình từ file `.env` của bạn:
     * `MONGODB_URI`: Đường dẫn kết nối MongoDB Atlas.
     * `JWT_SECRET`: Khóa bí mật mã hóa JWT (đổi chuỗi ký tự ngẫu nhiên thật dài).
     * `NEXT_PUBLIC_APP_URL`: Tên miền chính thức của bạn (ví dụ: `https://tainguyen247.io.vn`).
     * `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`: Kích hoạt Redis dùng cho Rate Limiting.
     * `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`: Cổng thanh toán PayOS.
     * `RESEND_API_KEY`, `EMAIL_VERIFIED_SENDER`, `EMAIL_NAME`: Gửi email thông báo nạp tiền.
8. Click **Create Web Service**. Đợi vài phút để Render tự động tải code, biên dịch và chạy server. Sau khi hoàn tất, Render sẽ cấp cho bạn một đường dẫn dạng: `https://shop-tai-nguyen-247.onrender.com`.

---

## 2. Bước 2: Thiết lập Tên miền trên Cloudflare

1. Đăng nhập hoặc đăng ký tài khoản miễn phí tại [Cloudflare](https://dash.cloudflare.com/).
2. Chọn **Add a Site** -> Nhập tên miền chính thức của bạn (ví dụ: `tainguyen247.io.vn`) -> Chọn gói **Free** (Miễn phí) rồi nhấn Continue.
3. Cloudflare sẽ tự động quét các bản ghi DNS hiện tại. Nhấn Continue tiếp tục.
4. Cloudflare sẽ cung cấp 2 địa chỉ **Nameservers** (ví dụ: `alan.ns.cloudflare.com` và `nell.ns.cloudflare.com`).
5. Đăng nhập vào trang quản lý đại lý tên miền nơi bạn mua (Mắt Bão, Pavietnam, Tenten, GoDaddy...), tìm phần cấu hình Nameservers, chọn tùy chỉnh và **thay thế toàn bộ Nameservers cũ bằng 2 Nameservers mới của Cloudflare**.
6. Đợi 5 - 15 phút để tên miền cập nhật DNS về Cloudflare thành công.

---

## 3. Bước 3: Cấu hình DNS trên Cloudflare trỏ về Render

1. Tại Dashboard Cloudflare tên miền của bạn, truy cập mục **DNS** -> **Records**.
2. **Thêm bản ghi cho tên miền chính (ví dụ: `tainguyen247.io.vn`):**
   - Click **Add Record**.
   - **Type (Loại):** Chọn `CNAME`.
   - **Name (Tên):** Nhập `@` (đại diện cho tên miền gốc).
   - **Target (Mục tiêu):** Nhập đường dẫn Render đã cấp ở Bước 1 (ví dụ: `shop-tai-nguyen-247.onrender.com`).
   - **Proxy status:** Bật **Proxied** (Đám mây màu cam). Việc này cho phép Cloudflare bảo mật IP của Render và kích hoạt CDN.
   - Click **Save**.
3. **Thêm bản ghi cho tên miền phụ `www` (ví dụ: `www.tainguyen247.io.vn`):**
   - Click **Add Record**.
   - **Type (Loại):** Chọn `CNAME`.
   - **Name (Tên):** Nhập `www`.
   - **Target (Mục tiêu):** Nhập địa chỉ Render (ví dụ: `shop-tai-nguyen-247.onrender.com`).
   - **Proxy status:** Bật **Proxied** (Đám mây màu cam).
   - Click **Save**.
4. **Khai báo tên miền trên Render:**
   - Quay lại Render Dashboard -> Vào Web Service của bạn -> Vào mục **Settings**.
   - Kéo xuống mục **Custom Domains** -> Click **Add Custom Domain**.
   - Nhập tên miền của bạn (ví dụ: `tainguyen247.io.vn`) rồi bấm Save. Làm tương tự cho tên miền `www.tainguyen247.io.vn`.

---

## 4. Bước 4: Cấu hình SSL/TLS (Cực kỳ quan trọng)

> [!WARNING]
> Nếu bạn bỏ qua hoặc cấu hình sai bước này, Next.js sẽ bị rơi vào vòng lặp chuyển hướng vô hạn và hiển thị lỗi `ERR_TOO_MANY_REDIRECTS` trên trình duyệt.

1. Tại Dashboard Cloudflare của tên miền, chọn mục **SSL/TLS** ở thanh menu trái -> Chọn tab **Overview**.
2. Tại mục **SSL/TLS encryption mode**, chọn chế độ: **Full** hoặc **Full (strict)**.
   * *Giải thích:* Không chọn chế độ *Flexible* vì Render mặc định đã bắt buộc HTTPS (chạy SSL tự động). Việc để Flexible sẽ làm Cloudflare gửi request HTTP thường vào Render và bị Render redirect sang HTTPS, tạo ra vòng lặp vô hạn.

---

## 5. Bước 5: Cấu hình Cache Rules tối ưu hóa tốc độ tải trang

Next.js sinh ra rất nhiều tài nguyên tĩnh trong thư mục `_next/static/` (như file JavaScript và CSS cho từng trang). Để Cloudflare lưu cache các file này ở Việt Nam nhằm tăng tốc độ load trang:

1. Trên Cloudflare, vào mục **Caching** -> **Cache Rules**.
2. Click **Create Rule**.
3. Thiết lập thông tin Rule:
   - **Rule name:** `Cache NextJS Assets`
   - **If incoming requests match... (Điều kiện):**
     * **Field:** `URI Path`
     * **Operator:** `starts with`
     * **Value:** `/_next/static/`
   - **Then... (Hành động):**
     * Chọn **Eligible for cache** (Cho phép cache).
     * Tại mục **Edge TTL**, chọn **Override with status code** -> Click **Add status code** -> Nhập `200` và chọn thời gian `1 month` (1 tháng).
4. Click **Deploy** để kích hoạt.

> [!TIP]
> Bạn nên tạo thêm một Cache Rule thứ hai để bỏ qua cache (Bypass cache) cho các đường dẫn nhạy cảm:
> - Cấu hình điều kiện: `URI Path` -> `starts with` -> `/api/` hoặc `/admin/`.
> - Hành động: Chọn **Bypass cache** để đảm bảo dữ liệu đơn hàng mua bán và trang quản trị luôn được cập nhật mới nhất từ database.

---

## 6. Hướng dẫn vận hành & Khắc phục sự cố

*   **Xóa Cache khi cập nhật giao diện (Purge Cache):** Mỗi khi bạn cập nhật code và deploy bản mới lên Render, giao diện cũ có thể vẫn bị lưu ở Cloudflare khiến khách hàng chưa thấy thay đổi. Hãy truy cập Cloudflare -> Chọn **Caching** -> **Configuration** -> Click chọn **Purge Everything** để làm mới cache toàn hệ thống.
*   **Bảo mật Webhook:** Địa chỉ nhận Webhook PayOS của bạn giờ đây sẽ là `https://tainguyen247.io.vn/api/webhooks`. Chữ ký bảo mật và đối chiếu số tiền đã được viết sẵn trong mã nguồn nên không lo bị giả mạo.
*   **Theo dõi Uptime:** Bạn có thể dùng các dịch vụ miễn phí như *UptimeRobot* gọi định kỳ vào API kiểm tra sức khỏe hệ thống: `https://tainguyen247.io.vn/api/health` để giám sát xem web có hoạt động ổn định hay không.
