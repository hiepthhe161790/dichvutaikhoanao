"use client";

import { useState, useEffect, useMemo } from "react";
import { CategoryTabs } from "@/app/components/CategoryTabs";
import { ProductTable } from "@/app/components/ProductTable";
// import { StatsCards } from "@/app/components/StatsCards";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface Product {
  _id: string;
  id: string;
  platform: string;
  category: string;
  title: string;
  description: string;
  price: number;
  accountCount: number;
  availableCount: number;
  status: "available" | "soldout";
  image?: string;
}

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-6">
    {/* Category Tabs Skeleton */}
    <div className="flex gap-2 pb-4 overflow-x-auto">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-10 w-28 bg-gray-200 dark:bg-slate-800 rounded-xl flex-shrink-0"></div>
      ))}
    </div>
    
    {/* Table Card Skeleton */}
    {[1, 2].map((tableIndex) => (
      <div key={tableIndex} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Title bar skeleton */}
        <div className="h-14 bg-gray-100 dark:bg-slate-800/50 px-6 flex items-center">
          <div className="h-5 w-40 bg-gray-300 dark:bg-slate-700 rounded-md"></div>
        </div>
        {/* Rows skeleton */}
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((rowIndex) => (
            <div key={rowIndex} className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-b border-gray-150 dark:border-slate-800 last:border-0 gap-4">
              <div className="space-y-2 flex-1 w-full">
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 dark:bg-slate-800/60 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
              <div className="h-8 w-24 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
              <div className="h-9 w-24 bg-gray-300 dark:bg-slate-700 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          apiClient.getProducts(),
          apiClient.getCategories(),
        ]);

        let productsData: Product[] = [];
        let categoriesData: any[] = [];

        if (productsRes.success && Array.isArray(productsRes.data)) {
          productsData = productsRes.data;
        }

        if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
          categoriesData = categoriesRes.data;
        }

        // Create category map for quick lookup
        const categoryMap = new Map<string, string>();
        categoriesData.forEach((cat) => {
          categoryMap.set(cat._id, cat.name);
        });

        // Map products with category names
        const mappedProducts = productsData.map((product) => ({
          ...product,
          category: categoryMap.get(product.category) || product.category,
        }));

        setProducts(mappedProducts);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBuy = (productId: string, quantity: number) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      const total = product.price * quantity;
      toast.success(`Mua thành công ${quantity} tài khoản "${product.title}"!`, {
        description: `Đã thanh toán: ${total.toLocaleString("vi-VN")} đ. Kiểm tra lịch sử để lấy tài khoản.`,
      });
    }
  };

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") {
      return products;
    }
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  // Group products by category for display
  const productGroups = useMemo(() => {
    const groups = new Map<string, { title: string; products: typeof products }>();

    if (activeCategory === "all") {
      // Show all categories - group by category name
      products.forEach((product) => {
        const categoryKey = product.category;
        if (!groups.has(categoryKey)) {
          groups.set(categoryKey, {
            title: categoryKey,
            products: [],
          });
        }
        groups.get(categoryKey)!.products.push(product);
      });
    } else {
      // Show single category - find by category name
      const filtered = products.filter((p) => p.category === activeCategory);
      groups.set(activeCategory, {
        title: activeCategory,
        products: filtered,
      });
    }

    return Array.from(groups.values());
  }, [activeCategory, products]);

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Category Tabs */}
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categories={categories}
          />

          {/* Product Tables */}
          <div className="space-y-6 mt-6">
            {productGroups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Không có sản phẩm nào
                </p>
              </div>
            ) : (
              productGroups.map((group, index) => (
                <ProductTable
                  key={index}
                  title={group.title}
                  products={group.products.map((p) => ({
                    _id: p._id,
                    platform: p.platform as any,
                    category: p.category,
                    title: p.title,
                    description: p.description,
                    quantity: p.availableCount,
                    price: p.price,
                    status: p.status,
                  }))}
                  onBuy={handleBuy}
                />
              ))
            )}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Không có sản phẩm nào trong danh mục này
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
