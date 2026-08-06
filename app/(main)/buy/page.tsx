"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BuyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
