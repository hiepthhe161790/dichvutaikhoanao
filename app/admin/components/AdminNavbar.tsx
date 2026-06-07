"use client";

import { useState, useEffect } from "react";
import { Bell, Settings, LogOut, User, Moon, Sun, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
interface AdminNavbarProps {
  title: string;
  onOpenSidebar: () => void;
}

export function AdminNavbar({ title, onOpenSidebar }: AdminNavbarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/admin/notifications');
        if (!res.ok) return;
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data);
        }
      } catch (err) {
        console.error('Fetch notifications error:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    
    // Listen for manual triggers (e.g. when admin approves an invoice)
    window.addEventListener('invoiceUpdated', fetchNotifications);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('invoiceUpdated', fetchNotifications);
    };
  }, []);
  const { logout } = useAuthContext();
  const router = useRouter();
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    if (theme === "dark") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Title & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 -ml-2 md:hidden hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
          >
            <Menu size={24} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              {new Date().toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-400" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-[10px] font-bold text-white rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Thông báo</h3>
                  <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full font-medium">
                    {notifications.length} mới
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification, idx) => {
                      const timeAgo = Math.floor((new Date().getTime() - new Date(notification.createdAt).getTime()) / 60000);
                      const timeStr = timeAgo < 60 ? `${Math.max(1, timeAgo)} phút trước` : `${Math.floor(timeAgo / 60)} giờ trước`;
                      return (
                        <div 
                          key={notification.id || idx} 
                          onClick={() => { 
                            if (notification.link) {
                              router.push(notification.link); 
                            }
                            setShowNotifications(false); 
                          }} 
                          className="p-4 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{notification.title}</p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                            {notification.message}
                          </p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">{timeStr}</p>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      <p className="text-sm">Không có thông báo mới</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:inline">Admin</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                  <p className="font-semibold text-gray-900 dark:text-white">Tài khoản</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">admin@hh-shopee.com</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      router.push('/admin/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <User size={16} />
                    <span className="text-sm">Hồ sơ</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Settings size={16} />
                    <span className="text-sm">Cài đặt</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push('/admin/change-password');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <span className="text-sm">🔑 Đổi mật khẩu</span>
                  </button>
                  <hr className="my-2 border-gray-200 dark:border-slate-700" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <LogOut size={16} />
                    <span className="text-sm">Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
