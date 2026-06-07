import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import User from '@/lib/models/User';

export interface AppNotification {
  id: string;
  type: 'deposit' | 'order' | 'support' | 'system';
  title: string;
  message: string;
  link: string;
  createdAt: Date;
}

export async function GET() {
  try {
    await connectDB();
    
    const notifications: AppNotification[] = [];

    // --- SOURCE 1: Pending Manual Invoices ---
    const pendingInvoices = await Invoice.find({ 
      paymentMethod: 'manual', 
      status: 'pending' 
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
    
    if (pendingInvoices.length > 0) {
      const userIds = pendingInvoices.map(i => i.userId);
      const users = await User.find({ _id: { $in: userIds } }).lean();
      const userMap = users.reduce((acc: any, user: any) => {
        acc[user._id.toString()] = user;
        return acc;
      }, {});
      
      const invoiceNotifs: AppNotification[] = pendingInvoices.map(invoice => {
        const user = userMap[invoice.userId];
        const userName = user?.fullName || user?.username || invoice.userId;
        return {
          id: `inv_${invoice._id}`,
          type: 'deposit',
          title: '💰 Yêu cầu nạp tiền',
          message: `${userName} vừa nạp ${invoice.amount.toLocaleString('vi-VN')} đ`,
          link: '/admin?tab=payments&status=pending&method=manual',
          createdAt: invoice.createdAt
        };
      });
      
      notifications.push(...invoiceNotifs);
    }

    // --- FUTURE SOURCES CAN BE ADDED HERE ---
    // Example: const newOrders = await Order.find({ status: 'new' });
    // notifications.push(...newOrderNotifs);

    // Sort all combined notifications by date descending
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Limit to top 20 total notifications to keep navbar clean
    const topNotifications = notifications.slice(0, 20);

    return NextResponse.json({ success: true, data: topNotifications });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
