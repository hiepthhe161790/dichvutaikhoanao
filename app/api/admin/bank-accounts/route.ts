import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import BankAccount from '@/lib/models/BankAccount';
import { getTokenFromCookies } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';

// Helper: verify admin
function requireAdmin(request: NextRequest) {
  const token = getTokenFromCookies(request);
  if (!token) return null;
  const decoded = verifyToken(token) as any;
  if (!decoded || decoded.role !== 'admin') return null;
  return decoded;
}

/**
 * GET /api/admin/bank-accounts
 * Public endpoint – FE deposit flow calls this to render VietQR
 * Returns all active bank accounts ordered by displayOrder
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true'; // admin: get all including inactive

    const query = all ? {} : { isActive: true };
    const bankAccounts = await BankAccount.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: bankAccounts });
  } catch (error) {
    console.error('Get bank accounts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bank accounts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/bank-accounts
 * Admin only – Create a new bank account
 */
export async function POST(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { bankCode, bankName, accountNumber, accountName, isActive, displayOrder, note } = body;

    if (!bankCode || !bankName || !accountNumber || !accountName) {
      return NextResponse.json(
        { success: false, error: 'bankCode, bankName, accountNumber, accountName are required' },
        { status: 400 }
      );
    }

    const bankAccount = new BankAccount({
      bankCode: bankCode.toLowerCase().trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim().toUpperCase(),
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
      note,
    });

    const saved = await bankAccount.save();
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error('Create bank account error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create bank account' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/bank-accounts
 * Admin only – Update a bank account
 */
export async function PUT(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { id, bankCode, bankName, accountNumber, accountName, isActive, displayOrder, note } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const updated = await BankAccount.findByIdAndUpdate(
      id,
      {
        ...(bankCode && { bankCode: bankCode.toLowerCase().trim() }),
        ...(bankName && { bankName: bankName.trim() }),
        ...(accountNumber && { accountNumber: accountNumber.trim() }),
        ...(accountName && { accountName: accountName.trim().toUpperCase() }),
        ...(isActive !== undefined && { isActive }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(note !== undefined && { note }),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Bank account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update bank account error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update bank account' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/bank-accounts
 * Admin only – Delete a bank account
 */
export async function DELETE(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const deleted = await BankAccount.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Bank account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Bank account deleted' });
  } catch (error) {
    console.error('Delete bank account error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete bank account' },
      { status: 500 }
    );
  }
}
