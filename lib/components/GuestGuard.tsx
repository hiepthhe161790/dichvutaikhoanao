"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../context/AuthContext";

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * GuestGuard: Chỉ cho phép truy cập khi CHƯA đăng nhập.
 * Nếu đã đăng nhập → redirect về trang phù hợp (admin → /admin, user → /).
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthContext();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Đang check auth session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Đã đăng nhập → không hiển thị form, đang redirect
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Chưa đăng nhập → render trang auth bình thường
  return <>{children}</>;
}
