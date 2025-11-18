import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - HH-SHOPEE",
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
