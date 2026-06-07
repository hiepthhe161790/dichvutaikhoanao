import { MetadataRoute } from 'next';
import { apiClient } from '@/lib/api-client';

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
  ];

  try {
    // Fetch categories
    const categoriesRes = await apiClient.getCategories();
    const categoryPages: MetadataRoute.Sitemap = 
      categoriesRes.success && Array.isArray(categoriesRes.data)
        ? categoriesRes.data.map((cat: any) => ({
            url: `${baseUrl}/buy?category=${cat._id}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
          }))
        : [];

    // Fetch products
    const productsRes = await apiClient.getProducts();
    const productPages: MetadataRoute.Sitemap =
      productsRes.success && Array.isArray(productsRes.data)
        ? productsRes.data.map((product: any) => ({
            url: `${baseUrl}/buy#product-${product._id}`,
            lastModified: new Date(product.updatedAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          }))
        : [];

    return [...staticPages, ...categoryPages, ...productPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return only static pages if API fails
    return staticPages;
  }
}
