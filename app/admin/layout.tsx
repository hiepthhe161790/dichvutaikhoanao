import type { Metadata } from "next";
import { APP_NAME } from '@/constants/app';

export const metadata: Metadata = {
  title: `Admin Dashboard - ${APP_NAME}`,
  description: "Bảng điều khiển quản trị hệ thống bán tài khoản ảo",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {children}
    </div>
  );
}
