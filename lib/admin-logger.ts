import { NextRequest } from 'next/server';
import { connectDB } from './db';
import AuditLog from './models/AuditLog';

interface LogDetails {
  action: 'create' | 'update' | 'delete' | 'send_email' | 'other';
  resource: 'service_order' | 'account' | 'product' | 'settings' | 'user';
  resourceId?: string;
  description: string;
}

export async function logAdminAction(request: NextRequest, details: LogDetails) {
  try {
    // Đảm bảo kết nối database
    await connectDB();

    // Lấy thông tin user từ middleware headers
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role') as any;
    const email = request.headers.get('x-user-email');

    if (!userId || !role || !email) {
      console.warn('Admin logger warning: Missing identity headers in request. Action not logged.');
      return null;
    }

    // Lấy IP address
    let ipAddress = request.headers.get('x-forwarded-for') || '';
    if (ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
    }
    
    // Ghi nhận log
    const auditLog = await AuditLog.create({
      userId,
      email,
      role,
      action: details.action,
      resource: details.resource,
      resourceId: details.resourceId,
      description: details.description,
      ipAddress: ipAddress || undefined
    });

    return auditLog;
  } catch (error) {
    // Không ném lỗi ra ngoài để tránh làm sập API chính nếu ghi log thất bại
    console.error('Failed to write admin audit log:', error);
    return null;
  }
}
