# Agent Context Logging Rule

Mỗi khi bạn (AI Agent) thực hiện bất kỳ thay đổi hoặc chỉnh sửa nào đối với mã nguồn hoặc cấu trúc tệp tin trong dự án này, bạn BẮT BUỘC phải thực hiện ghi nhận nhật ký chỉnh sửa (log ngữ cảnh) vào tệp `agent_changes.log` nằm ở thư mục gốc của dự án.

## Quy định ghi nhận nhật ký (Log Specification):
- **Tên tệp log:** `agent_changes.log` (Lưu dưới dạng plain text/log, không dùng markdown).
- **Cấu trúc mỗi dòng log (Format):**
  ```text
  [YYYY-MM-DD HH:mm:ss] [Đường dẫn file] [Hành động: NEW/MODIFY/DELETE] - [Mô tả chi tiết thay đổi] - [Lý do/Ngữ cảnh của thay đổi]
  ```
- **Ví dụ (Example):**
  ```text
  [2026-08-07 01:12:45] [app/api/webhooks/route.ts] [MODIFY] - Thêm kiểm tra chữ ký PayOS nghiêm ngặt và đối chiếu chéo số tiền - Ngăn chặn lỗ hổng bảo mật giả mạo webhook nạp tiền khống.
  ```
- **Thời điểm thực thi:** Ghi nhận log này ngay lập tức sau khi sửa đổi file thành công và trước khi kết thúc lượt phản hồi cho người dùng.

# Prompt Processing Context Rule

Khi tiếp nhận và xử lý các yêu cầu (prompt) từ người dùng, bạn (AI Agent) BẮT BUỘC phải luôn kiểm tra, cập nhật và tuân thủ các thông tin mới nhất, điều kiện thay đổi hiện tại trong cuộc hội thoại hoặc các tệp log thay đổi gần nhất. Tránh sử dụng thông tin cũ, thiết kế cũ đã bị bác bỏ hoặc thay thế trong các bước trước đó của phiên làm việc.

