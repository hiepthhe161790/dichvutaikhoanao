import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ServiceOrder from '@/lib/models/ServiceOrder';
import User from '@/lib/models/User';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import ServicePricing from '@/lib/models/ServicePricing';
import { resend } from '@/lib/resend';
import { ROLE_POLICIES, Role } from '@/lib/config/permissions';
import { logAdminAction } from '@/lib/admin-logger';

// GET /api/admin/service-orders - Lấy tất cả đơn dịch vụ (Admin)
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Check admin
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let isAuthorized = false;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      isAuthorized = decoded.role === 'admin' || decoded.role === 'staff';
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Admin or Staff access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    // Build query
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (platform && platform !== 'all') query.platform = platform;
    if (userId) query.userId = new mongoose.Types.ObjectId(userId);
    
    if (search) {
      // Find matching users first
      const matchedUsers = await User.find({
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = matchedUsers.map(u => u._id);

      query.$or = [
        { serviceType: { $regex: search, $options: 'i' } },
        { serverName: { $regex: search, $options: 'i' } },
        { link: { $regex: search, $options: 'i' } } // optional search in link
      ];

      if (mongoose.Types.ObjectId.isValid(search) || search.length === 24) {
        query.$or.push({ _id: new mongoose.Types.ObjectId(search) });
      }

      if (userIds.length > 0) {
        query.$or.push({ userId: { $in: userIds } });
      }
    }

    const total = await ServiceOrder.countDocuments(query);
    const orders = await ServiceOrder.find(query)
      .populate('userId', 'email username fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Calculate statistics
    const stats = await ServiceOrder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Get service orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service orders' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/service-orders - Cập nhật trạng thái đơn (Admin)
export async function PUT(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Check admin
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let isAuthorized = false;
    let role: Role = 'customer';
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      role = decoded.role as Role;
      isAuthorized = role === 'admin' || role === 'staff';
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Admin or Staff access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, status, failureReason, refundAmount, sendEmail, customMessage } = body;

    // Financial lock using centralized policies
    const policy = ROLE_POLICIES[role];
    if (status === 'refunded' || (refundAmount && refundAmount > 0)) {
      if (!policy?.actions?.refundServiceOrder) {
        return NextResponse.json(
          { success: false, error: 'Tài khoản của bạn không có quyền thực hiện hoàn tiền đơn hàng.' },
          { status: 403 }
        );
      }
    }

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const order = await ServiceOrder.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
    order.status = status;
    
    if (status === 'processing' && !order.processStartedAt) {
      order.processStartedAt = new Date();
    }

    if (status === 'completed' && !order.processCompletedAt) {
      order.processCompletedAt = new Date();
    }

    if (status === 'failed' && failureReason) {
      order.failureReason = failureReason;
    }

    if (status === 'refunded' && refundAmount) {
      order.refundAmount = refundAmount;
      // Refund to user wallet
      const user = await User.findById(order.userId);
      if (user) {
        user.balance += refundAmount;
        await user.save();
      }
    }

    await order.save();

    // Send email notification if checkbox was checked
    if (sendEmail && resend) {
      const user = await User.findById(order.userId);
      if (user && user.email) {
        const pricing = await ServicePricing.findOne({ serviceType: order.serviceType });
        const serviceName = pricing?.serviceName || order.serviceType;
        
        sendStatusEmail(
          user.email,
          order._id.toString(),
          status,
          serviceName,
          refundAmount || undefined,
          customMessage
        );
      }
    }

    // Ghi nhận audit log
    await logAdminAction(request, {
      action: 'update',
      resource: 'service_order',
      resourceId: order._id.toString(),
      description: `Đã cập nhật trạng thái đơn hàng dịch vụ #${order._id.toString().slice(-6).toUpperCase()} sang [${status}]${status === 'failed' ? ` (Lý do: ${failureReason || 'Không ghi rõ'})` : ''}${status === 'refunded' ? ` (Hoàn tiền: ${refundAmount?.toLocaleString('vi-VN')}đ)` : ''}.`
    });

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Update service order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/service-orders - Xóa đơn (Admin)
export async function DELETE(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Check admin
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let role: Role = 'customer';
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      role = decoded.role as Role;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const policy = ROLE_POLICIES[role];
    if (!policy?.actions?.deleteServiceOrder) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản của bạn không có quyền thực hiện hành động này.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    await ServiceOrder.findByIdAndDelete(orderId);

    // Ghi nhận audit log
    await logAdminAction(request, {
      action: 'delete',
      resource: 'service_order',
      resourceId: orderId,
      description: `Đã xóa đơn hàng dịch vụ #${orderId.slice(-6).toUpperCase()}.`
    });

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Delete service order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}

// POST /api/admin/service-orders - Gửi email hỗ trợ thủ công cho khách hàng (Admin)
export async function POST(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Check admin
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let isAuthorized = false;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      isAuthorized = decoded.role === 'admin' || decoded.role === 'staff';
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Admin or Staff access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, orderId, subject, message } = body;

    if (action !== 'send-manual-email') {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (!orderId || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const order = await ServiceOrder.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const user = await User.findById(order.userId);
    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: 'User not found or user email missing' },
        { status: 400 }
      );
    }

    if (!resend) {
      return NextResponse.json(
        { success: false, error: 'Email service (Resend) not configured' },
        { status: 500 }
      );
    }

    const emailSender = process.env.EMAIL_VERIFIED_SENDER || 'noreply@tainguyen247.io.vn';
    const emailName = process.env.EMAIL_NAME || 'Tai nguyen 247';

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="background-color: #4f46e5; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Email Hỗ Trợ Đơn Hàng</h2>
        </div>
        <div style="padding: 20px 0;">
          <p>Xin chào <strong>${user.fullName || user.username || 'Khách hàng'}</strong>,</p>
          <p>Ban quản trị hệ thống <strong>${emailName}</strong> gửi tới bạn thông báo hỗ trợ cho đơn hàng dịch vụ #${orderId.slice(-6).toUpperCase()}:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; border-left: 4px solid #4f46e5; margin: 20px 0; font-size: 15px;">
            <p style="margin: 0; white-space: pre-wrap; color: #1f2937; line-height: 1.7;">${message}</p>
          </div>

          <p>Nếu có bất kỳ thắc mắc nào khác, vui lòng liên hệ bộ phận hỗ trợ khách hàng của chúng tôi.</p>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
          <p>Đây là email gửi trực tiếp từ Ban quản trị hệ thống ${emailName}.</p>
          <p>© 2026 ${emailName}. All rights reserved.</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: `"${emailName}" <${emailSender}>`,
      to: user.email,
      subject: `[${emailName}] ${subject}`,
      html
    });

    // Ghi nhận audit log
    await logAdminAction(request, {
      action: 'send_email',
      resource: 'service_order',
      resourceId: orderId,
      description: `Đã gửi email hỗ trợ thủ công tới khách hàng ${user.email} (Tiêu đề: "${subject}").`
    });

    return NextResponse.json({
      success: true,
      message: 'Support email sent successfully'
    });

  } catch (error: any) {
    console.error('Send manual support email error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}

// Helper to send email notification
async function sendStatusEmail(
  userEmail: string, 
  orderId: string, 
  status: string, 
  serviceName: string, 
  refundAmount?: number, 
  customMessage?: string
) {
  if (!resend) return;

  const emailSender = process.env.EMAIL_VERIFIED_SENDER || 'noreply@tainguyen247.io.vn';
  const emailName = process.env.EMAIL_NAME || 'Tai nguyen 247';

  const statusLabels: Record<string, string> = {
    pending: 'Đang chờ xử lý',
    processing: 'Đang thực hiện',
    completed: 'Hoàn thành thành công',
    cancelled: 'Đã hủy bỏ',
    refunded: 'Đã hoàn tiền',
    failed: 'Thất bại'
  };

  const statusLabel = statusLabels[status] || status;
  const subject = `[${emailName}] Thông báo trạng thái đơn hàng dịch vụ #${orderId.slice(-6).toUpperCase()} - ${statusLabel}`;

  let refundNotice = '';
  if (status === 'refunded' && refundAmount) {
    refundNotice = `<p style="color: #7c3aed; font-weight: bold;">Số tiền được hoàn trả lại ví: ${refundAmount.toLocaleString('vi-VN')}đ</p>`;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
      <div style="background-color: #3b82f6; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Cập Nhật Trạng Thái Đơn Hàng</h2>
      </div>
      <div style="padding: 20px 0;">
        <p>Xin chào,</p>
        <p>Hệ thống <strong>${emailName}</strong> xin thông báo đơn hàng dịch vụ của bạn đã có cập nhật mới:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; font-weight: bold; width: 150px;">Mã đơn hàng:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">#${orderId.slice(-6).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; font-weight: bold;">Dịch vụ:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; font-weight: bold;">Trạng thái mới:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #2563eb; font-weight: bold;">${statusLabel}</td>
          </tr>
        </table>

        ${refundNotice}

        ${customMessage ? `
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; color: #1f2937;">Tin nhắn từ Ban Quản Trị:</h4>
          <p style="margin: 0; font-style: italic; color: #4b5563;">"${customMessage}"</p>
        </div>
        ` : ''}

        <p>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi!</p>
      </div>
      <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
        <p>Đây là email tự động từ hệ thống ${emailName}, vui lòng không phản hồi lại email này.</p>
        <p>© 2026 ${emailName}. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `"${emailName}" <${emailSender}>`,
      to: userEmail,
      subject,
      html
    });
  } catch (err) {
    console.error("Resend email delivery error:", err);
  }
}
