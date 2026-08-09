"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminNavbar } from "./components/AdminNavbar";
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { BookingsPage } from "./pages/BookingsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProvidersPage } from "./pages/ProvidersPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { ProductsPage } from "./pages/ProductsPage";
import { AccountsPage } from "./pages/AccountsPage";
import { DocsPage } from "./pages/DocsPage";
import { UserModal } from "./components/UserModal";
import { TransactionModal } from "./components/TransactionModal";
import { User, Transaction } from "./data/mockData";
import { Toaster } from "../components/ui/sonner";
import { OrdersPage } from "./pages/OrdersPage";
import { FAQPage } from "./pages/FAQPage";
import { PostsPage } from "./pages/PostsPage";
import { SupportPage } from "./pages/SupportPage";
import { ServicePricingPage } from "./pages/ServicePricingPage";
import { ServiceOrdersPage } from "./pages/ServiceOrdersPage";
import { BankAccountsPage } from "./pages/BankAccountsPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { ProtectedRoute } from "@/lib/components/ProtectedRoute";

function AdminContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "dashboard";

  const [activePage, setActivePage] = useState(tabParam);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Đồng bộ tab từ URL khi tải trang lần đầu
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab && currentTab !== activePage) {
      setActivePage(currentTab);
    }
  }, [searchParams]);

  // Lắng nghe sự kiện Back/Forward của trình duyệt để đổi tab tương ứng
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") || "dashboard";
      setActivePage(tab);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    setIsSidebarOpen(false); // Đóng sidebar trên điện thoại
    window.history.pushState(null, "", `/admin?tab=${page}`);
  };

  const handleOpenUserModal = (user?: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(undefined);
  };

  const handleOpenTransactionModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setSelectedTransaction(null);
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      users: "Quản lý người dùng",
      products: "Quản lý sản phẩm",
      accounts: "Quản lý tài khoản",
      bookings: "Quản lý đơn đặt lịch",
      payments: "Quản lý giao dịch",
      providers: "Tích hợp API Ngoài",
      categories: "Quản lý Categories",
      services: "Quản lý dịch vụ",
      promotions: "Quản lý khuyến mãi",
      reports: "Báo cáo & Thống kê",
      settings: "Cấu hình hệ thống",
      orders: "Quản lý đơn hàng",
      faq: "Quản lý FAQ",
      posts: "Quản lý bài viết",
      support: "Quản lý Support",
      "service-pricing": "Quản lý Service Pricing",
      "service-orders": "Quản lý Service Orders",
      "bank-accounts": "Quản lý tài khoản ngân hàng",
      "audit-logs": "Nhật ký hoạt động",
      docs: "Hướng dẫn vận hành",
    };
    return titles[activePage] || "Dashboard";
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage />;
      case "users":
        return <UsersPage onOpenUserModal={handleOpenUserModal} />;
      case "products":
        return <ProductsPage />;
      case "accounts":
        return <AccountsPage />;
      case "bookings":
        return <BookingsPage />;
      case "payments":
        return <PaymentsPage onOpenTransactionModal={handleOpenTransactionModal} />;
      case "providers":
        return <ProvidersPage />;
      case "categories":
        return <CategoriesPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      case "orders":
        return <OrdersPage />;
      case "faq":
        return <FAQPage />;
      case "posts":
        return <PostsPage />;
      case "support":
        return <SupportPage />;
      case "service-pricing":
        return <ServicePricingPage />;
      case "service-orders":
        return <ServiceOrdersPage />;
      case "bank-accounts":
        return <BankAccountsPage />;
      case "audit-logs":
        return <AuditLogsPage />;
      case "docs":
        return <DocsPage />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">Trang đang được phát triển</p>
            </div>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
        {/* Sidebar */}
        <AdminSidebar 
          activePage={activePage} 
          onNavigate={handleNavigate} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
          {/* Navbar */}
          <AdminNavbar title={getPageTitle()} onOpenSidebar={() => setIsSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {renderPage()}
          </main>
        </div>

        {/* Modals */}
        <UserModal
          isOpen={isUserModalOpen}
          onClose={handleCloseUserModal}
          user={selectedUser}
        />

        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={handleCloseTransactionModal}
          transaction={selectedTransaction}
        />

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AdminContent />
    </Suspense>
  );
}
