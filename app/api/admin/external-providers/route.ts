import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Provider from '@/lib/models/Provider';

// GET /api/admin/external-providers — Danh sách tất cả providers
export async function GET() {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ success: false, error: 'DB unavailable' }, { status: 503 });

  // Không trả authValue để bảo mật
  const providers = await Provider.find()
    .select('-authValue')
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: providers });
}

// POST /api/admin/external-providers — Tạo provider mới
export async function POST(request: NextRequest) {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ success: false, error: 'DB unavailable' }, { status: 503 });

  const body = await request.json();
  const {
    name, slug, description, baseUrl,
    authType, authParamName, authValue,
    endpoints, buyConfig, responseMap,
    requestsPerMinute, lowBalanceAlert,
  } = body;

  if (!name || !slug || !baseUrl || !authType || !authParamName || !authValue) {
    return NextResponse.json(
      { success: false, error: 'Thiếu các trường bắt buộc: name, slug, baseUrl, authType, authParamName, authValue' },
      { status: 400 }
    );
  }

  // Kiểm tra slug trùng
  const exists = await Provider.findOne({ $or: [{ name }, { slug }] });
  if (exists) {
    return NextResponse.json(
      { success: false, error: 'Tên hoặc slug đã tồn tại' },
      { status: 409 }
    );
  }

  const provider = await Provider.create({
    name, slug, description, baseUrl,
    authType, authParamName, authValue,
    endpoints: endpoints || {},
    buyConfig: {
      method: buyConfig?.method || 'POST',
      productIdParam: buyConfig?.productIdParam || 'id',
      quantityParam: buyConfig?.quantityParam || 'amount',
      couponParam: buyConfig?.couponParam,
      extraBodyParams: buyConfig?.extraBodyParams,
    },
    responseMap: {
      successField: responseMap?.successField || 'status',
      successValue: responseMap?.successValue || 'success',
      dataField: responseMap?.dataField || 'data',
      transIdField: responseMap?.transIdField,
      errorMsgField: responseMap?.errorMsgField,
      itemFormat: responseMap?.itemFormat || 'pipe_separated',
      itemFields: responseMap?.itemFields || ['username', 'password'],
    },
    requestsPerMinute: requestsPerMinute || 60,
    lowBalanceAlert,
    status: 'testing',
  });

  // Trả về không có authValue
  const safeProvider = provider.toObject();
  delete safeProvider.authValue;

  return NextResponse.json({ success: true, data: safeProvider }, { status: 201 });
}
