# SEO Optimization Guide - Dịch Vụ Tài Khoản Ảo

Hướng dẫn hoàn chỉnh để tối ưu SEO cho trang web trên Google.

## 1. Files Đã Được Tạo

### 1.1 Robots.ts Configuration
**File**: `app/robots.ts`
- Cấu hình robot.txt cho các crawler
- Cho phép: `/`, `/buy`, `/posts`, `/faq`, `/contact`
- Chặn: `/admin`, `/api`, `/auth`, `/deposit`, `/invoices`, `/profile`
- Chặn AI crawlers (GPTBot, CCBot, anthropic-ai)
- Tự động sinh ra `/robots.txt` tại build time

### 1.2 Sitemap Generation
**File**: `app/sitemap.ts`
- Tự động sinh XML sitemap động
- Bao gồm: Static pages, Categories, Products
- Cập nhật lastModified từ database
- URL: `https://your-domain.com/sitemap.xml`

### 1.3 Structured Data (JSON-LD)
**File**: `app/components/StructuredData.tsx`
- Organization schema (thông tin công ty)
- Website schema (tìm kiếm)
- FAQ schema (câu hỏi thường gặp)
- Giúp Google hiểu nội dung tốt hơn

### 1.4 Enhanced Metadata
**File**: `app/layout.tsx`
- OpenGraph tags cho Social Media
- Twitter Card support
- Canonical URL
- Robot directives
- metadataBase configuration

## 2. Cấu Hình Environment Variables

Thêm vào `.env.local`:

```env
NEXT_PUBLIC_APP_URL=https://dichvutaikhoanao.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=YOUR_GOOGLE_VERIFICATION_CODE
```

## 3. Google Search Console Setup

### 3.1 Đăng ký với Google Search Console
1. Truy cập: https://search.google.com/search-console
2. Click "Add Property"
3. Chọn "URL prefix" → Nhập domain
4. Xác minh ownership (chọn HTML tag method):
   ```html
   <meta name="google-site-verification" content="YOUR_CODE" />
   ```
   - Code này sẽ được thêm tự động nếu bạn set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`

### 3.2 Submit Sitemap
1. Trong Search Console → Sitemaps
2. Click "Add/test sitemap"
3. Nhập: `https://dichvutaikhoanao.com/sitemap.xml`
4. Click "Submit"

### 3.3 Test Robots.txt
1. Trong Search Console → Settings → Crawl
2. Test URL: `https://dichvutaikhoanao.com/robots.txt`

## 4. Google Analytics Integration

Thêm Google Analytics để track user behavior:

```bash
npm install next-google-analytics
```

Thêm vào `app/layout.tsx`:
```tsx
import { GoogleAnalytics } from "next-google-analytics";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <GoogleAnalytics trackingId="G-XXXXXXXXXX" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 5. Performance Optimization (Core Web Vitals)

### 5.1 Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={100}
  height={100}
  priority // For above-fold images
/>
```

### 5.2 CSS & JS Optimization
- Next.js 16 đã tự động code splitting
- Sử dụng `dynamic` import cho non-critical components

### 5.3 Font Optimization
- Đang sử dụng `next/font/google` với subsetting ✅

## 6. Mobile Friendliness

- ✅ Viewport meta tag được thêm
- ✅ Responsive design (dự toán)
- Test tại: https://search.google.com/test/mobile-friendly

## 7. Heading Structure & Content

### Heading Hierarchy
```
<h1>Dịch Vụ Tài Khoản Ảo</h1>
<h2>Danh Mục Sản Phẩm</h2>
<h2>FAQ</h2>
<h3>Câu Hỏi Chi Tiết</h3>
```

Cần cải thiện:
- Mỗi page chỉ có 1 h1
- Không skip heading levels (h1 → h3 là sai)

## 8. On-Page SEO Checklist

- [x] Meta title (50-60 characters)
- [x] Meta description (120-160 characters)
- [x] Keywords 
- [x] OpenGraph tags
- [x] Canonical URL
- [x] Structured data (JSON-LD)
- [ ] Internal linking strategy
- [ ] Keyword optimization in content
- [ ] Alt text cho images

## 9. Technical SEO Checklist

- [x] Robots.txt configured
- [x] Sitemap.xml generated
- [x] SSL/HTTPS enabled (cần verify)
- [x] Fast loading time (Next.js optimization)
- [x] Mobile responsive design
- [x] Structured data (JSON-LD)
- [ ] Breadcrumbs (recommended for category pages)
- [ ] Schema markup cho Products

## 10. Backlink Strategy

1. Submit website đến các thư mục:
   - Google My Business
   - Bing Webmaster Tools
   - Yandex Webmaster (for Russian traffic)

2. Create content điều khiển:
   - Blog posts về cách sử dụng service
   - FAQs
   - Case studies

## 11. Monitoring & Analytics

### 11.1 Google Search Console Monitoring
- Impressions: Số lần website hiển thị trong search results
- Clicks: Số lượng click từ search
- CTR: Click-through rate
- Position: Vị trí trung bình trong search

### 11.2 Core Web Vitals Monitoring
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms  
- Cumulative Layout Shift (CLS): < 0.1

## 12. Bước Tiếp Theo

1. **Deploy to Production**
   ```bash
   npm run build
   npm run start
   ```

2. **Set Environment Variables**
   - NEXT_PUBLIC_APP_URL
   - NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

3. **Verify in Search Console**
   - Submit sitemap
   - Monitor indexation
   - Check for crawl errors

4. **Setup Analytics**
   - Google Analytics
   - Track user behavior

5. **Create Blog Strategy**
   - Blog posts về sản phẩm
   - FAQ content
   - Keyword targeting articles

6. **Monitor Performance**
   - Check Core Web Vitals monthly
   - Review search console data
   - Adjust keywords based on performance

## 13. SEO Best Practices

✅ **Làm**
- Unique title và description cho mỗi page
- Quality content tập trung vào user intent
- Fast loading pages
- Mobile-responsive design
- Regular content updates
- Internal linking strategy
- HTTPS everywhere
- Structured data markup

❌ **Không Làm**
- Keyword stuffing
- Duplicate content
- Hidden text/links
- Cloaking
- Buying backlinks
- Auto-generated content
- Plagiarized content
- Slow-loading pages

## 14. Contacts & Resources

- Google Search Console: https://search.google.com/search-console
- Google Analytics: https://analytics.google.com
- PageSpeed Insights: https://pagespeed.web.dev
- Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
- Rich Results Test: https://search.google.com/test/rich-results
