import { connectDB } from "@/lib/db";
import Post from "@/lib/models/Post";
import PostsClient from "./PostsClient";

// Incremental Static Regeneration (ISR) - Lưu cache trang tĩnh 30 giây để tối ưu tốc độ tải trang
export const revalidate = 30;
export const dynamic = "force-dynamic";

export default async function PostsPage() {
  // 1. Kết nối cơ sở dữ liệu trên server
  await connectDB();

  // 2. Lấy danh sách danh mục duy nhất từ các bài viết đã xuất bản
  const allCategoriesRaw = await Post.find({ isPublished: true })
    .select("category")
    .lean();
  const categories = [...new Set(allCategoriesRaw.map((post: any) => post.category))];

  // 3. Lấy số lượng bài viết để phân trang
  const total = await Post.countDocuments({ isPublished: true });

  // 4. Lấy 12 bài viết đầu tiên để nạp sẵn cho trang chủ blog
  const postsRaw = await Post.find({ isPublished: true })
    .sort({ publishedAt: -1 })
    .limit(12)
    .select("title excerpt author category tags slug image publishedAt createdAt")
    .lean();

  // 5. Tuần tự hóa dữ liệu từ Mongoose sang JSON thuần
  const posts = JSON.parse(JSON.stringify(postsRaw));

  const pagination = {
    total,
    page: 1,
    limit: 12,
    totalPages: Math.ceil(total / 12),
  };

  // 6. Trả về giao diện nạp sẵn dữ liệu tức thì
  return (
    <PostsClient
      initialPosts={posts}
      initialCategories={categories}
      initialPagination={pagination}
    />
  );
}
