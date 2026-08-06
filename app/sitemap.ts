import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import mongoose from 'mongoose';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tainguyen247.io.vn';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/buy`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/api-docs`,
      lastModified: new Date(),
      changeFrequency: 'never',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/order`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  try {
    const hasDBUrl = !!process.env.MONGODB_URI;
    if (!hasDBUrl) {
      console.warn('[Sitemap] MONGODB_URI not configured during build time. Returning static pages only.');
      return staticPages;
    }

    const conn = await connectDB();
    if (!conn || mongoose.connection.readyState !== 1) {
      console.warn('[Sitemap] Database connection failed or readyState is not connected. Returning static pages only.');
      return staticPages;
    }

    // Fetch categories and products directly from database
    const dbQueryPromise = (async () => {
      const categories = await Category.find({ status: 'active' }).select('_id updatedAt').lean();
      const products = await Product.find({ status: 'available' }).select('_id updatedAt').lean();
      return { categories, products };
    })();

    // Race against a 4 seconds timeout to ensure build doesn't hang
    const timeoutPromise = new Promise<{ categories: any[], products: any[] }>((_, reject) =>
      setTimeout(() => reject(new Error('Sitemap DB query timeout')), 4000)
    );

    const { categories, products } = await Promise.race([dbQueryPromise, timeoutPromise]);

    const categoryPages: MetadataRoute.Sitemap = categories.map((cat: any) => ({
      url: `${baseUrl}/buy?category=${cat._id.toString()}`,
      lastModified: new Date(cat.updatedAt || new Date()),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    const productPages: MetadataRoute.Sitemap = products.map((product: any) => ({
      url: `${baseUrl}/buy#product-${product._id.toString()}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch (error) {
    console.error('Error generating sitemap dynamically, returning static pages only:', error);
    return staticPages;
  }
}
