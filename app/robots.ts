import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tainguyen247.io.vn';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/buy',
          '/posts',
          '/faq',
          '/contact',
        ],
        disallow: [
          '/admin',
          '/api',
          '/auth',
          '/deposit',
          '/invoices',
          '/profile',
          '/cart',
          '/order',
          '/history',
          '/change-password',
        ],
      },
      // Block AI crawlers
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
