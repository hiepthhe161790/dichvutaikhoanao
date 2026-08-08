import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AuditLog from '@/lib/models/AuditLog';
import { Role } from '@/lib/config/permissions';

// GET /api/admin/audit-logs - Lấy danh sách nhật ký hoạt động (Chỉ Admin tối cao)
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Xác thực quyền admin từ header (middleware đã set)
    const role = request.headers.get('x-user-role') as Role;
    if (role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const filterRole = searchParams.get('role');
    const filterAction = searchParams.get('action');
    const filterResource = searchParams.get('resource');
    const search = searchParams.get('search');

    // Xây dựng query
    const query: any = {};
    
    if (filterRole && filterRole !== 'all') {
      query.role = filterRole;
    }

    if (filterAction && filterAction !== 'all') {
      query.action = filterAction;
    }

    if (filterResource && filterResource !== 'all') {
      query.resource = filterResource;
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get audit logs API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve activity logs' },
      { status: 500 }
    );
  }
}
