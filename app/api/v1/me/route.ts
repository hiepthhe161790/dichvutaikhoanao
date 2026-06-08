import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateApiKey(request);
    
    if (auth.error || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { user } = auth;

    return NextResponse.json({
      success: true,
      data: {
        username: user.email, // using email as username or we could use fullName
        fullName: user.fullName,
        balance: user.balance,
        role: user.role,
        bonusPercentage: user.bonusPercentage,
      }
    });
  } catch (error) {
    console.error('API v1 /me error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
