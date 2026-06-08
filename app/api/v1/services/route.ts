import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/api-auth';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import ServicePricing from '@/lib/models/ServicePricing';
import Account from '@/lib/models/Account';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateApiKey(request);
    
    if (auth.error || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    // Get all active categories
    const categories = await Category.find({ status: 'active' }).sort({ order: 1 });
    
    // Get all active products (Accounts)
    const products = await Product.find({ status: 'active' });
    
    // Calculate stock for each product
    const productIds = products.map(p => p._id);
    const stockCounts = await Account.aggregate([
      { $match: { product: { $in: productIds }, status: 'available' } },
      { $group: { _id: '$product', count: { $sum: 1 } } }
    ]);
    
    const stockMap = stockCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    // Format Products
    const formattedProducts = products.map(product => {
      // Calculate price with user's discount if applicable
      // user.bonusPercentage is typically a discount off the retail price or extra deposit
      // For simplicity, we return standard price here. Consumers can calculate their own discount if applicable.
      return {
        id: product._id,
        name: product.name,
        categoryId: product.category,
        type: 'account',
        price: product.price,
        originalPrice: product.originalPrice,
        stock: stockMap[product._id.toString()] || 0,
        minQuantity: 1,
        maxQuantity: stockMap[product._id.toString()] || 0,
        description: product.description,
      };
    });

    // Get all active services (ServicePricing)
    const services = await ServicePricing.find({ status: 'active' });
    const formattedServices = services.map(service => {
      return {
        id: service._id,
        name: service.name,
        categoryId: service.category,
        type: 'service',
        price: service.price,
        originalPrice: service.originalPrice,
        stock: 999999, // Services usually have unlimited "stock"
        minQuantity: service.minQuantity || 1,
        maxQuantity: service.maxQuantity || 999999,
        description: service.description,
        requiresInput: true // Services require input data like link/id
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.map(c => ({
          id: c._id,
          name: c.name,
          slug: c.slug,
          type: c.type // 'account' | 'service'
        })),
        items: [...formattedProducts, ...formattedServices]
      }
    });
  } catch (error) {
    console.error('API v1 /services error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
