"use client";

import { useState } from "react";
import {
  HomeIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CreditCardIcon,
  NewspaperIcon,
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon,
  CodeBracketIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

interface MenuItem {
  icon: any;
  label: string;
  href?: string;
  page?: "home" | "history";
  isHeader?: boolean;
}

const menuItems: MenuItem[] = [
  { icon: HomeIcon, label: "Trang chủ", href: "/", page: "home" },
  { icon: ShoppingBagIcon, label: "Mua tài khoản", href: "/buy", page: "home" },
  { icon: ArrowTrendingUpIcon, label: "Up follow Shopee, Lazada", href: "/follow" },
  { icon: ClipboardDocumentListIcon, label: "Đặt đơn Shopee", href: "/order" },
  { icon: ClockIcon, label: "Lịch sử mua hàng", href: "/history", page: "history" },
  
  { icon: null, label: "Nạp tiền", isHeader: true },
  { icon: BanknotesIcon, label: "Ngân hàng", href: "/deposit/bank" },
  { icon: DocumentTextIcon, label: "Hoá đơn", href: "/deposit/invoice" },
  { icon: CreditCardIcon, label: "Nạp thẻ", href: "/deposit/card" },
  
  { icon: null, label: "Khác", isHeader: true },
  { icon: NewspaperIcon, label: "Bài viết", href: "/posts" },
  { icon: WrenchScrewdriverIcon, label: "Công cụ", href: "/tools" },
  { icon: QuestionMarkCircleIcon, label: "FAQ", href: "/faq" },
  { icon: CodeBracketIcon, label: "Tài liệu API", href: "/api-docs" },
  { icon: PhoneIcon, label: "Liên hệ", href: "/contact" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: "home" | "history") => void;
}

export function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("Trang chủ");

  const handleItemClick = (item: MenuItem) => {
    setActiveItem(item.label);
    if (item.page && onNavigate) {
      onNavigate(item.page);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#0f172a] z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">HH</span>
            </div>
            <div>
              <h1 className="text-white">HH-SHOPEE</h1>
              <p className="text-xs text-slate-400">Shop tài khoản uy tín</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item, index) => {
              if (item.isHeader) {
                return (
                  <li key={index} className="pt-6 pb-2 px-3">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                      {item.label}
                    </span>
                  </li>
                );
              }

              const Icon = item.icon;
              const isActive = activeItem === item.label;

              return (
                <li key={index}>
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="text-xs text-slate-500 text-center">
            <p>© 2024 HH-SHOPEE</p>
            <p className="mt-1">Version 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}