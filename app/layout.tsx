import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/context/AuthContext";
import { StructuredData } from "@/app/components/StructuredData";
import "./index.css";
import { APP_NAME } from '@/constants/app';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dichvutaikhoanao.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: `Mua Tài Khoản Ảo - Shopee, TikTok, MMO, Hotmail Giá Rẻ | ${APP_NAME}`,
  description: "Mua tài khoản ảo chất lượng cao: Shopee, TikTok, Hotmail, Gmail, tài khoản MMO, tài khoản game. Giá rẻ nhất thị trường, uy tín 100%, bảo hành toàn bộ tài khoản. Thanh toán nhanh, hỗ trợ 24/7.",
  keywords: ["mua tài khoản ảo", "mua tài khoản shopee", "tài khoản tiktok", "hotmail account", "mua tài khoản mmo", "tài khoản mmo", "mua tài khoản game", "bán tài khoản ảo", "tài khoản giá rẻ", "tài khoản premium", "tài khoản lazada", "gmail", "tài khoản game online"],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: baseUrl,
    title: `Mua Tài Khoản Ảo - Shopee, TikTok, MMO, Hotmail Giá Rẻ | ${APP_NAME}`,
    description: "Mua tài khoản ảo chất lượng cao: Shopee, TikTok, Hotmail, tài khoản MMO. Giá rẻ nhất, uy tín, bảo hành toàn bộ tài khoản. Thanh toán nhanh 24/7.",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `Mua Tài Khoản Ảo - Shopee, TikTok, MMO, Hotmail | ${APP_NAME}`,
    description: "Mua tài khoản ảo chất lượng cao: Shopee, TikTok, Hotmail, tài khoản MMO, game. Giá rẻ nhất thị trường, uy tín 100%, bảo hành toàn bộ.",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate" hrefLang="vi" href={baseUrl} />
        <StructuredData />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
