import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Account from '@/lib/models/Account';
import Product from '@/lib/models/Product';

import { ROLE_POLICIES, Role } from '@/lib/config/permissions';
import { logAdminAction } from '@/lib/admin-logger';

// DELETE /api/accounts/delete - Xóa accounts
export async function POST(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Check delete permissions from centralized policies
    const role = request.headers.get('x-user-role') as Role;
    const policy = ROLE_POLICIES[role];
    if (!policy?.actions?.deleteAccount) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản của bạn không có quyền thực hiện hành động này.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { accountIds, productId } = body;

    if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid accountIds' },
        { status: 400 }
      );
    }

    // Xóa accounts
    const result = await Account.deleteMany({
      _id: { $in: accountIds },
    });

    if (productId) {
      // Cập nhật số lượng trong product
      const availableCount = await Account.countDocuments({
        productId,
        status: 'available',
      });

      await Product.findByIdAndUpdate(
        productId,
        {
          availableCount,
          accountCount: availableCount,
          status: availableCount > 0 ? 'available' : 'soldout',
        }
      );
    }

    // Ghi nhận audit log
    let productName = 'không rõ';
    if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        productName = product.title;
      }
    }
    await logAdminAction(request, {
      action: 'delete',
      resource: 'account',
      description: `Đã xóa ${result.deletedCount} tài khoản thuộc sản phẩm [${productName}].`
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} accounts`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Delete accounts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete accounts' },
      { status: 500 }
    );
  }
}
