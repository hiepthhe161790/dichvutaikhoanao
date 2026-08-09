"use client";

import { useState, useEffect } from "react";
import { ChevronLeftIcon, CalendarIcon, UserIcon, TagIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

interface Post {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  slug: string;
  image?: string;
  publishedAt: string;
  createdAt: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể tìm thấy bài viết");
      }

      setPost(data.data);
    } catch (error: any) {
      console.error("Error fetching post details:", error);
      toast.error("Lỗi", {
        description: error.message || "Không thể tải chi tiết bài viết",
      });
      router.push("/posts");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Đang tải chi tiết bài viết...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  // Helper to check if content contains HTML
  const isHtml = /<[a-z][\s\S]*>/i.test(post.content);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Quay lại */}
        <div className="mb-8">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span>Quay lại danh sách bài viết</span>
          </Link>
        </div>

        <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700/50">
          {/* Ảnh bìa */}
          {post.image && (
            <div className="relative w-full h-[250px] sm:h-[380px] overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </div>
          )}

          <div className="p-6 sm:p-10">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 border-b border-gray-100 dark:border-slate-700/50 pb-6">
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">{post.author}</span>
              </div>
              <div className="hidden sm:block text-gray-300 dark:text-gray-600">•</div>
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="hidden sm:block text-gray-300 dark:text-gray-600">•</div>
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                {post.category}
              </span>
            </div>

            {/* Tiêu đề */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Nội dung */}
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-200 leading-relaxed space-y-6">
              {isHtml ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                  className="space-y-4"
                />
              ) : (
                post.content.split("\n").map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  return trimmed ? <p key={index}>{trimmed}</p> : null;
                })
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-100 dark:border-slate-700/50">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 mr-2">
                    <TagIcon className="w-4 h-4" /> Tags:
                  </span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
