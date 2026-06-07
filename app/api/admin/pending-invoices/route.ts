import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Find all pending manual invoices
    const pendingInvoices = await Invoice.find({ 
      paymentMethod: 'manual', 
      status: 'pending' 
    })
    .sort({ createdAt: -1 })
    .limit(20) // Limit to top 20 recent
    .lean();
    
    // Map user info if possible
    const userIds = pendingInvoices.map(i => i.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {} as any);
    
    const data = pendingInvoices.map(invoice => ({
      ...invoice,
      user: userMap[invoice.userId] || null
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Fetch pending invoices error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pending invoices' }, { status: 500 });
  }
}
