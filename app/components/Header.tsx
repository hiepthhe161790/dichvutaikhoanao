"use client";

import { useState } from "react";
import {
  Bars3Icon,
  BellIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "./ui/badge";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const balance = 1250000; // Mock balance

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 dark:bg-slate-900 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu button (mobile) */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Balance */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Số dư tài khoản</p>
              <p className="text-green-600 dark:text-green-400">
                {balance.toLocaleString("vi-VN")} đ
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Balance mobile */}
          <div className="sm:hidden flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-green-600 dark:text-green-400">
              {balance.toLocaleString("vi-VN")} đ
            </p>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <SunIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <BellIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User profile */}
          <div className="hidden md:flex items-center gap-2 pl-2 ml-2 border-l border-gray-200 dark:border-slate-700">
            <div className="text-right">
              <p className="text-sm text-gray-900 dark:text-gray-100">Admin User</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">admin@hhshopee.vn</p>
            </div>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <UserCircleIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* User icon mobile */}
          <button className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <UserCircleIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
}
