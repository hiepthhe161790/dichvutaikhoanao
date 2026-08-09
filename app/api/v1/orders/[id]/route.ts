import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/api-auth';
import Order from '@/lib/models/Order';
import ServiceOrder from '@/lib/models/ServiceOrder';
import { decrypt } from '@/lib/encryption';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateApiKey(request);
    if (auth.error || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    const { user } = auth;
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    // Check ServiceOrder first
    let order = await ServiceOrder.findOne({ _id: orderId, userId: user._id });
    if (order) {
      return NextResponse.json({
        success: true,
        data: {
          id: order._id,
          type: 'service',
          status: order.status,
          totalPrice: order.totalPrice,
          createdAt: order.createdAt,
          note: order.note,
          links: order.productLinks
        }
      });
    }

    // Check Account Order
    order = await Order.findOne({ _id: orderId, userId: user._id }).populate('productId', 'name platform');
    if (order) {
      return NextResponse.json({
        success: true,
        data: {
          id: order._id,
          type: 'account',
          status: order.status,
          totalPrice: order.totalPrice,
          createdAt: order.createdAt,
          accounts: order.accounts.map((acc: any) => ({
            username: acc.username,
            password: decrypt(acc.password),
            email: acc.email,
            emailPassword: acc.emailPassword ? decrypt(acc.emailPassword) : undefined,
            phone: acc.phone,
            raw: acc.raw ? decrypt(acc.raw) : undefined
          }))
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

  } catch (error) {
    console.error('API v1 /orders/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
