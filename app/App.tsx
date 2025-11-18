"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { CategoryTabs } from "./components/CategoryTabs";
import { ProductTable } from "./components/ProductTable";
import { StatsCards } from "./components/StatsCards";
import { products } from "./data/products";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import HistoryPage from "./history/page";
import DepositPage from "../app/deposit/page";
import AdminPage from "../app/admin/page";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState<"home" | "history" | "deposit" | "admin">("home");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleBuy = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      toast.success(`Đã thêm "${product.title}" vào giỏ hàng!`, {
        description: `Giá: ${product.price.toLocaleString("vi-VN")} đ`,
      });
    }
  };

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") {
      return products;
    }
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  // Group products by category for display
  const productGroups = useMemo(() => {
    const groups = new Map<string, { title: string; products: typeof products }>();

    if (activeCategory === "all") {
      // Show all categories
      const categoryTitles: Record<string, string> = {
        tiktok: "Tài khoản TikTok",
        "shopee-silver": "Nick Shopee Hạng Bạc",
        "shopee-gold": "Nick Shopee Hạng Vàng",
        "shopee-coin": "Nick Shopee Có Xu",
        "shopee-orders": "Nick Shopee Có Đơn Giao Thành Công",
        "shopee-phone": "Nick Shopee Reg Phone",
        "shopee-buff": "Nick Shopee Buff Web",
        lazada: "Tài khoản Lazada",
        gmail: "Tài khoản Gmail",
        hotmail: "Tài khoản Hotmail",
      };

      products.forEach((product) => {
        const categoryKey = product.category;
        if (!groups.has(categoryKey)) {
          groups.set(categoryKey, {
            title: categoryTitles[categoryKey] || categoryKey,
            products: [],
          });
        }
        groups.get(categoryKey)!.products.push(product);
      });
    } else {
      // Show single category
      const categoryTitles: Record<string, string> = {
        tiktok: "Tài khoản TikTok",
        "shopee-silver": "Nick Shopee Hạng Bạc",
        "shopee-gold": "Nick Shopee Hạng Vàng",
        "shopee-coin": "Nick Shopee Có Xu",
        "shopee-orders": "Nick Shopee Có Đơn Giao Thành Công",
        "shopee-phone": "Nick Shopee Reg Phone",
        "shopee-buff": "Nick Shopee Buff Web",
        lazada: "Tài khoản Lazada",
        gmail: "Tài khoản Gmail",
        hotmail: "Tài khoản Hotmail",
      };

      groups.set(activeCategory, {
        title: categoryTitles[activeCategory] || activeCategory,
        products: filteredProducts,
      });
    }

    return Array.from(groups.values());
  }, [activeCategory, filteredProducts]);

  // If admin page is selected, show full admin panel
  if (currentPage === "admin") {
    return <AdminPage />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(page) => {
          setCurrentPage(page);
          setIsSidebarOpen(false);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />

        {/* Conditional rendering based on current page */}
        {currentPage === "home" ? (
          <>
            {/* Category Tabs */}
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
              <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
                {/* Stats Cards */}
                <StatsCards />

                {/* Product Tables */}
                <div className="space-y-6">
                  {productGroups.map((group, index) => (
                    <ProductTable
                      key={index}
                      title={group.title}
                      products={group.products}
                      onBuy={handleBuy}
                    />
                  ))}
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
            </main>
          </>
        ) : currentPage === "history" ? (
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950">
            <HistoryPage />
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950">
            <DepositPage />
          </main>
        )}
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}