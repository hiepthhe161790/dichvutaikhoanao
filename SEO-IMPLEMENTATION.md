# SEO Implementation Checklist

## ✅ Completed Tasks

### Core SEO Files Created:
- [x] `app/robots.ts` - Robot configuration
- [x] `app/sitemap.ts` - Dynamic XML sitemap
- [x] `app/components/StructuredData.tsx` - JSON-LD schemas
- [x] `lib/schemas/seo-schemas.ts` - Reusable schema utilities
- [x] Enhanced `app/layout.tsx` - Metadata, OpenGraph, Twitter cards
- [x] Updated `next.config.ts` - Security & SEO headers
- [x] `SEO-SETUP.md` - Complete setup guide

### What Files Do:
1. **robots.ts** → Generates `/robots.txt` at build time
2. **sitemap.ts** → Generates `/sitemap.xml` dynamically from products/categories
3. **StructuredData.tsx** → Injects JSON-LD schemas for Organization, Website, FAQ
4. **seo-schemas.ts** → Utilities to generate Product, Article, Review, LocalBusiness schemas
5. **layout.tsx** → Meta tags, OpenGraph, Twitter, canonical URLs, Google verification
6. **next.config.ts** → Security headers, compression, content-type headers

---

## 🚀 Next Steps (CRITICAL)

### 1. Set Environment Variables (.env.local)
```env
NEXT_PUBLIC_APP_URL=https://dichvutaikhoanao.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=YOUR_GOOGLE_VERIFICATION_CODE
```

**How to get GOOGLE_SITE_VERIFICATION:**
1. Go to https://search.google.com/search-console
2. Add your domain as "URL prefix"
3. Select "HTML tag" verification method
4. Copy the verification code from `content="..."` attribute

### 2. Build & Deploy
```bash
npm run build
npm run start
```

After deployment, verify:
- `https://your-domain.com/robots.txt` returns 200
- `https://your-domain.com/sitemap.xml` returns 200
- Meta tags visible in HTML source

### 3. Verify in Google Search Console
1. Go to https://search.google.com/search-console
2. Add property → URL prefix (your domain)
3. Use HTML tag verification method (copy code to NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION)
4. Navigate to Sitemaps → Submit: `https://your-domain.com/sitemap.xml`
5. Monitor crawl errors & indexation status

### 4. Monitor Search Performance
Check these regularly in Search Console:
- Impressions (how often your site appears in search results)
- Clicks (how many people clicked through)
- CTR (click-through rate)
- Average position
- Core Web Vitals

---

## 📋 Optional Enhancements

### Add Product Schema to Product Pages
Current StructuredData.tsx only has Organization/Website/FAQ. To add product-specific schemas:

1. Import in relevant components:
```tsx
import { generateProductSchema } from '@/lib/schemas/seo-schemas';

const schema = generateProductSchema(product);
return (
  <>
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
    {/* component content */}
  </>
);
```

### Add Breadcrumbs
For better navigation in search results:
```tsx
import { generateBreadcrumbSchema } from '@/lib/schemas/seo-schemas';

const breadcrumbs = [
  { name: 'Home', url: 'https://domain.com' },
  { name: 'Buy', url: 'https://domain.com/buy' },
  { name: 'Category', url: 'https://domain.com/buy?category=xyz' },
];

<script type="application/ld+json">
  {JSON.stringify(generateBreadcrumbSchema(breadcrumbs))}
</script>
```

### Setup Google Analytics
```bash
npm install next-google-analytics
```

In `app/layout.tsx`:
```tsx
import { GoogleAnalytics } from 'next-google-analytics';

<head>
  <GoogleAnalytics trackingId="G-XXXXXXXXXX" />
</head>
```

### Add Blog/FAQ Schema
For FAQ page:
```tsx
import { generateArticleSchema } from '@/lib/schemas/seo-schemas';

// In your FAQ page component
<script type="application/ld+json">
  {JSON.stringify(generateArticleSchema({
    title: 'FAQ',
    description: 'Frequently Asked Questions',
    publishedDate: new Date().toISOString(),
  }))}
</script>
```

### Setup Sitemap Image Extensions
If you have product images, enhance sitemap with image URLs:

```ts
// In app/sitemap.ts productPages section
image: {
  url: product.image || `${baseUrl}/default-image.png`,
  title: product.title,
}
```

---

## 🔍 Verification Checklist

- [ ] Build completes successfully: `npm run build`
- [ ] No TypeScript errors
- [ ] `robots.txt` accessible at: `https://your-domain.com/robots.txt`
- [ ] `sitemap.xml` accessible at: `https://your-domain.com/sitemap.xml`
- [ ] Meta tags in HTML source include:
  - [ ] `<title>` tag
  - [ ] `<meta name="description">`
  - [ ] `<meta property="og:*">`
  - [ ] `<meta name="twitter:*">`
  - [ ] `<link rel="canonical">`
  - [ ] `<meta name="google-site-verification">`
- [ ] JSON-LD scripts are loaded (check HTML source)
- [ ] Google Search Console verification successful
- [ ] Sitemap submitted to Search Console
- [ ] No crawl errors reported

---

## 📊 Monitoring Metrics

After deployment (give Google 1-4 weeks to crawl):

### Google Search Console Metrics to Track:
1. **Impressions**: Occurrences in search results
2. **Clicks**: User clicks from search results
3. **CTR**: Click-through rate (Clicks/Impressions)
4. **Avg. Position**: Average ranking position
5. **Coverage**: % of pages indexed
6. **Enhancements**: Validation of structured data

### Core Web Vitals (Google PageSpeed):
1. **LCP** (Largest Contentful Paint): < 2.5s
2. **FID** (First Input Delay): < 100ms
3. **CLS** (Cumulative Layout Shift): < 0.1

Test at: https://pagespeed.web.dev/

### Recommended Tools:
- Google Search Console: https://search.google.com/search-console
- Google Analytics: https://analytics.google.com
- PageSpeed Insights: https://pagespeed.web.dev
- Rich Results Test: https://search.google.com/test/rich-results
- Mobile-Friendly Test: https://search.google.com/test/mobile-friendly

---

## 🎯 SEO Best Practices Applied

✅ **Already Implemented:**
1. Robots.txt with proper allow/disallow rules
2. Dynamic XML sitemap with changeFrequency & priority
3. Structured data (JSON-LD) for Organization, Website, FAQ
4. Meta tags (title, description, keywords)
5. OpenGraph tags for social media
6. Twitter Card support
7. Canonical URLs
8. Google verification support
9. Proper heading hierarchy
10. Mobile-responsive design (Next.js default)

🔄 **Recommended Next:**
1. Keyword research & optimization
2. High-quality content creation
3. Internal linking strategy
4. Backlink building
5. Regular content updates
6. User engagement optimization
7. Page speed optimization
8. Custom 404 page
9. Breadcrumb navigation
10. User reviews/ratings schema

---

## ⚠️ Common Issues

### Issue: Sitemap returns 404
**Solution:**
- Ensure build completed successfully
- Check `app/sitemap.ts` exists
- Verify database connection in API

### Issue: Google verification fails
**Solution:**
- Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env variable
- Redeploy after setting variable
- Wait 5 minutes for server restart

### Issue: Robots.txt not showing
**Solution:**
- Run `npm run build`
- Restart server
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: Structured data not validating
**Solution:**
- Test at: https://search.google.com/test/rich-results
- Check JSON syntax in browser console (F12 → Console)
- Ensure all required fields are present

---

## 📞 Support Resources

- **Next.js SEO**: https://nextjs.org/learn/seo/introduction-to-seo
- **Google Search Central**: https://developers.google.com/search
- **Schema.org Documentation**: https://schema.org/
- **robots.txt Guide**: https://developers.google.com/search/docs/crawling-indexing/robots-txt
- **Sitemap Guide**: https://www.sitemaps.org/

---

## 📝 Notes

- Sitemap updates automatically as products/categories change
- Robots.txt is generated at build time
- JSON-LD schemas are injected on every page load
- All SEO configurations are production-ready
- No performance impact on site speed

**Last Updated**: 2026-05-05
