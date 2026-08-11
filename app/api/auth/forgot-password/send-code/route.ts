import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { resend } from '@/lib/resend';
import { isValidEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email không tồn tại trong hệ thống' },
        { status: 404 }
      );
    }

    // Generate a 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = expires;
    await user.save();

    if (!resend) {
      console.log(`[DEV ONLY] Reset code for ${email}: ${resetCode}`);
      return NextResponse.json(
        { success: false, error: 'Dịch vụ gửi email chưa được cấu hình. Vui lòng liên hệ Admin.' },
        { status: 500 }
      );
    }

    const emailSender = process.env.EMAIL_VERIFIED_SENDER || 'noreply@tainguyen247.io.vn';
    const emailName = process.env.EMAIL_NAME || 'Tai nguyen 247';

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="background-color: #3b82f6; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Khôi Phục Mật Khẩu</h2>
        </div>
        <div style="padding: 20px 0; text-align: center;">
          <p style="text-align: left;">Xin chào <strong>${user.fullName || 'Thành viên'}</strong>,</p>
          <p style="text-align: left;">Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này tại hệ thống <strong>${emailName}</strong>. Vui lòng sử dụng mã xác nhận bên dưới để tiếp tục:</p>
          
          <div style="display: inline-block; background-color: #f3f4f6; border: 1px dashed #3b82f6; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #2563eb; margin: 20px 0; border-radius: 8px;">
            ${resetCode}
          </div>
          
          <p style="text-align: left; font-size: 14px; color: #6b7280;">Mã xác nhận này sẽ hết hạn trong 15 phút. Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này hoặc liên hệ hỗ trợ.</p>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
          <p>Đây là email tự động từ hệ thống ${emailName}, vui lòng không phản hồi lại email này.</p>
          <p>© 2026 ${emailName}. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      const { data, error: sendError } = await resend.emails.send({
        from: `"${emailName}" <${emailSender}>`,
        to: user.email,
        subject: `[${emailName}] Mã xác nhận khôi phục mật khẩu`,
        html,
      });

      if (sendError) {
        console.error('Resend API returned an error:', sendError);
        return NextResponse.json(
          { success: false, error: sendError.message || 'Lỗi gửi email từ dịch vụ' },
          { status: 502 }
        );
      }
    } catch (emailErr) {
      console.error('Failed to send email via Resend:', emailErr);
      return NextResponse.json(
        { success: false, error: 'Lỗi gửi email từ nhà cung cấp. Vui lòng thử lại sau.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mã xác nhận đã được gửi thành công.',
    });
  } catch (error) {
    console.error('Send code API error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi hệ thống' },
      { status: 500 }
    );
  }
}
