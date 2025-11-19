import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import FAQ from '@/lib/models/FAQ';

// GET /api/faq - Lấy danh sách FAQ
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
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    const query: any = { isActive: true };
    if (category) {
      query.category = category;
    }

    const faqs = await FAQ.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(limit);

    // Group by category
    const groupedFaqs = faqs.reduce((acc: any, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push({
        id: faq._id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        order: faq.order,
      });
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: groupedFaqs,
    });
  } catch (error) {
    console.error('Get FAQ error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}