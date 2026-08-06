import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import mongoose from 'mongoose';

export const runtime = 'nodejs';
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: Request) {
  const fallbackXml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';

  try {
    const conn = await connectDB();
    if (!conn || mongoose.connection.readyState !== 1) {
      console.warn('[API Sitemap] Database connection failed or not connected. Returning fallback sitemap.');
      return new NextResponse(fallbackXml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
        },
      });
    }

    // Fetch all products
    const products = await Product.find({ status: 'active' }).lean();

    // Fetch all categories
    const categories = await Category.find({ status: 'active' }).lean();

    // Generate XML sitemap
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yoursite.com';

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add product URLs
    products.forEach((product: any) => {
      const lastmod = product.updatedAt 
        ? new Date(product.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/buy?productId=${product._id}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Add category URLs
    categories.forEach((category: any) => {
      const lastmod = category.updatedAt 
        ? new Date(category.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/buy?category=${category.slug || category._id}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);

    // Return empty sitemap on error
    const fallbackXml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}
