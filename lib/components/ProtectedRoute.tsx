"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../context/AuthContext";
import { ROLE_POLICIES, Role } from "../config/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "customer" | "seller" | "staff";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }

    if (!isLoading && isAuthenticated && requiredRole) {
      const isAuthorized = user?.role === requiredRole || (requiredRole === 'admin' && ROLE_POLICIES[user?.role as Role]?.allowedPages?.length > 0);
      if (!isAuthorized) {
        router.push("/");
      }
    }
  }, [isLoading, isAuthenticated, requiredRole, user?.role, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isAuthorized = !requiredRole || user?.role === requiredRole || (requiredRole === 'admin' && ROLE_POLICIES[user?.role as Role]?.allowedPages?.length > 0);
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
