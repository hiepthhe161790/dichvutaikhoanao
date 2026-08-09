import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Account from '@/lib/models/Account';
import Product from '@/lib/models/Product';
import { logAdminAction } from '@/lib/admin-logger';
import { encrypt } from '@/lib/encryption';

// POST /api/accounts/upload - Upload tài khoản từ file text
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
    const { productId, accountData, separator = '|', format } = body;

    if (!productId || !accountData) {
      return NextResponse.json(
        { success: false, error: 'Missing productId or accountData' },
        { status: 400 }
      );
    }

    // Kiểm tra product tồn tại
    // Sử dụng _id thay vì id, productId là _id
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Parse dữ liệu account từ định dạng của sản phẩm (hoặc fallback mặc định)
    const formatToUse = product.importFormat || "username|password|phone|email|emailPassword";
    const accounts = parseAccountData(accountData, separator, formatToUse);

    if (accounts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid accounts to upload' },
        { status: 400 }
      );
    }

    // Thêm productId và accountType vào mỗi account, đồng thời mã hóa thông tin nhạy cảm
    const accountsToInsert = accounts.map((acc) => ({
      ...acc,
      password: encrypt(acc.password),
      emailPassword: acc.emailPassword ? encrypt(acc.emailPassword) : undefined,
      raw: acc.raw ? encrypt(acc.raw) : undefined,
      productId,
      accountType: product.platform,
      status: 'available',
    }));

    console.log('DEBUG: First account to insert:', accountsToInsert[0]);

    // Insert vào database
    const result = await Account.insertMany(accountsToInsert, { ordered: false }).catch(
      (err) => {
        // Bỏ qua lỗi duplicate key
        if (err.code === 11000) {
          return err.result?.insertedDocs || [];
        }
        throw err;
      }
    );

    // Cập nhật số lượng account trong product
    const availableCount = await Account.countDocuments({
      productId,
      status: 'available',
    });

    await Product.findByIdAndUpdate(product._id, {
      availableCount,
      accountCount: availableCount,
      status: availableCount > 0 ? 'available' : 'soldout',
    });

    // Ghi nhận audit log
    await logAdminAction(request, {
      action: 'create',
      resource: 'account',
      description: `Đã nạp thành công ${result.length || 0} tài khoản (trùng lặp/lỗi: ${accounts.length - (result.length || 0)}) cho sản phẩm [${product.title}].`
    });

    return NextResponse.json(
      {
        success: true,
        message: `Uploaded ${result.length} accounts successfully`,
        data: {
          uploaded: result.length,
          duplicates: accounts.length - result.length,
          totalAvailable: availableCount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload accounts' },
      { status: 500 }
    );
  }
}

// Helper function để parse account data
function parseAccountData(
  data: string,
  separator: string = '|',
  format?: string
): any[] {
  const lines = data.split('\n').filter((line) => line.trim());
  const accounts: any[] = [];

  const formatStr = format || "username|password|phone|email|emailPassword";
  const keys = formatStr.split('|').map((k) => k.trim());

  for (const line of lines) {
    const parts = line.trim().split(separator).map((p) => p.trim());

    if (parts.length === 0 || !parts[0]) continue;

    const account: any = {
      additionalInfo: {},
      raw: line.trim(),
    };

    keys.forEach((key, index) => {
      const val = parts[index] || '';
      if (!val) return;

      if (key === 'username') {
        account.username = val;
      } else if (key === 'password') {
        account.password = val;
      } else if (key === 'phone') {
        account.phone = val;
      } else if (key === 'email') {
        account.email = val;
      } else if (key === 'emailPassword') {
        account.emailPassword = val;
      } else if (key === 'recoveryEmail') {
        account.recoveryEmail = val;
      } else if (key === 'recoveryPhone') {
        account.recoveryPhone = val;
      } else if (key === 'cookie') {
        account.additionalInfo.extra1 = val;
      } else if (key === 'extra1') {
        account.additionalInfo.extra2 = val;
      } else if (key === 'extra2') {
        account.additionalInfo.extra_data = val;
      } else {
        account.additionalInfo[key] = val;
      }
    });

    // Validate: ít nhất có username (hoặc email) và password
    if ((account.username || account.email) && account.password) {
      if (!account.username && account.email) {
        account.username = account.email;
      }
      accounts.push(account);
    }
  }

  return accounts;
}

// GET /api/accounts?productId=xxx&page=1&limit=50
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || 'available';

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Missing productId' },
        { status: 400 }
      );
    }

    const total = await Account.countDocuments({ productId, status });
    const accounts = await Account.find({ productId, status })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: accounts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get accounts' },
      { status: 500 }
    );
  }
}
