import { connectDB } from "@/lib/db";
import FAQ from "@/lib/models/FAQ";
import FAQClient from "./FAQClient";

// Incremental Static Regeneration (ISR) - Lưu cache trang tĩnh 30 giây để tối ưu tốc độ tải trang
export const revalidate = 30;
export const dynamic = "force-dynamic";

export default async function FAQPage() {
  // 1. Kết nối MongoDB trực tiếp trên Server
  await connectDB();

  // 2. Truy vấn danh sách FAQ đang hoạt động
  const faqsRaw = await FAQ.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();

  // 3. Tuần tự hóa dữ liệu Mongoose sang JSON thuần
  const faqs = JSON.parse(JSON.stringify(faqsRaw));

  // 4. Phân nhóm câu hỏi theo chuyên mục
  const groupedFaqs = faqs.reduce((acc: any, faq: any) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push({
      id: faq._id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
    });
    return acc;
  }, {});

  // 5. Trả về giao diện nạp sẵn dữ liệu câu hỏi thường gặp
  return <FAQClient initialFaqData={groupedFaqs} />;
}
