"use client";

import { useState, useMemo } from "react";
import { CategoryTabs } from "@/app/components/CategoryTabs";
import { ProductTable } from "@/app/components/ProductTable";
import { toast } from "sonner";

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

interface HomeClientProps {
  initialProducts: Product[];
  initialCategories: any[];
}

export default function HomeClient({ initialProducts, initialCategories }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products] = useState<Product[]>(initialProducts);
  const [categories] = useState<any[]>(initialCategories);

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
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Không có sản phẩm nào trong danh mục này
          </p>
        </div>
      )}
    </div>
  );
}
