import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import HomeClient from "./HomeClient";

// Incremental Static Regeneration (ISR) - Caching 10 giây trên máy chủ để tối ưu tốc độ và giảm tải DB
export const revalidate = 10;
export const dynamic = "force-dynamic"; // Buộc Render cập nhật dữ liệu mới liên tục

export default async function HomePage() {
  // 1. Kết nối MongoDB trên server
  await connectDB();

  // 2. Lấy dữ liệu danh mục hoạt động
  const categoriesRaw = await Category.find({ status: "active" })
    .sort({ displayOrder: 1 })
    .lean();

  // 3. Lấy dữ liệu sản phẩm
  const productsRaw = await Product.find({}).lean();

  // 4. Tuần tuần tự hóa (Serialize) dữ liệu từ Mongoose sang JSON thuần để truyền sang Client Component
  const categories = JSON.parse(JSON.stringify(categoriesRaw));
  const productsRawJson = JSON.parse(JSON.stringify(productsRaw));

  // 5. Ánh xạ (Map) ID danh mục sang tên danh mục của sản phẩm
  const categoryMap = new Map<string, string>();
  categories.forEach((cat: any) => {
    categoryMap.set(cat._id, cat.name);
  });

  const products = productsRawJson.map((product: any) => ({
    ...product,
    category: categoryMap.get(product.category) || product.category,
  }));

  // 6. Trả về giao diện đã nạp sẵn dữ liệu tức thì
  return <HomeClient initialProducts={products} initialCategories={categories} />;
}
