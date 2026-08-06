"use client";

import { useState, useEffect } from "react";
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  GiftIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  SparklesIcon,
  ShoppingBagIcon,
  KeyIcon,
  ShoppingCartIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { APP_NAME } from '@/constants/app';

interface MenuItem {
  icon: any;
  label: string;
  page: string;
}

const menuItems: MenuItem[] = [
  { icon: HomeIcon, label: "Tổng quan", page: "dashboard" },
  // { icon: UserIcon, label: "Hồ sơ", page: "profile" },
  { icon: UsersIcon, label: "Người dùng", page: "users" },
  { icon: ShoppingBagIcon, label: "Sản phẩm", page: "products" },
  { icon: KeyIcon, label: "Tài khoản", page: "accounts" },
  { icon: BuildingLibraryIcon, label: "Ngân hàng", page: "bank-accounts" },
  { icon: ClipboardDocumentListIcon, label: "Đặt chỗ", page: "bookings" },
  { icon: CreditCardIcon, label: "Thanh toán", page: "payments" },
  { icon: GlobeAltIcon, label: "API Ngoài", page: "providers" },
  { icon: GiftIcon, label: "Danh mục", page: "categories" },
  { icon: ChatBubbleLeftRightIcon, label: "Hỗ trợ", page: "support" },
  { icon: QuestionMarkCircleIcon, label: "Câu hỏi thường gặp", page: "faq" },
  { icon: DocumentTextIcon, label: "Bài viết", page: "posts" },
  { icon: CurrencyDollarIcon, label: "Bảng giá dịch vụ", page: "service-pricing" },
  { icon: ShoppingCartIcon, label: "Đơn dịch vụ", page: "service-orders" },
  { icon: ChartBarIcon, label: "Báo cáo", page: "reports" },
  { icon: Cog6ToothIcon, label: "Cài đặt", page: "settings" },
  { icon: ShoppingCartIcon, label: "Đơn hàng", page: "orders" },
  { icon: DocumentTextIcon, label: "Hướng dẫn vận hành", page: "docs" },
  // { icon: KeyIcon, label: "Đổi mật khẩu", page: "change-password" },
];

interface AdminSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ activePage, onNavigate, isOpen, onClose }: AdminSidebarProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Trên desktop luôn hiển thị, trên mobile chỉ hiển thị khi isOpen
  const translateX = isDesktop || isOpen ? 'translateX(0)' : 'translateX(-100%)';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && !isDesktop && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar - dùng inline style để tránh CSS specificity conflict với Tailwind */}
      <aside 
        className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 shadow-lg z-50 flex flex-col transition-transform duration-300 ease-in-out"
        style={{ transform: translateX }}
      >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white tracking-wide">ADMIN PANEL</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{APP_NAME}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activePage === item.page;

            return (
              <li key={index}>
                <button
                  onClick={() => onNavigate(item.page)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-300 group relative overflow-hidden
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-600/20 animate-pulse"></div>
                  )}
                  <Icon className={`w-5 h-5 flex-shrink-0 relative z-10`} />
                  <span className="font-medium relative z-10">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 dark:text-green-400 font-medium">Hệ thống hoạt động</span>
          </div>
          <p>© 2024 {APP_NAME} Admin</p>
        </div>
      </div>
    </aside>
    </>
  );
}
