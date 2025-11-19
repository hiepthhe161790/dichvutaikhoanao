import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import FAQ from '@/lib/models/FAQ';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// GET /api/admin/faq - Lấy tất cả FAQ (cho admin)
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Verify admin token (you might want to add admin role check)
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const faqs = await FAQ.find({})
      .sort({ category: 1, order: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    console.error('Get admin FAQ error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// POST /api/admin/faq - Tạo FAQ mới
export async function POST(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Verify admin token
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { question, answer, category, isActive, order } = body;

    // Validate input
    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const faq = new FAQ({
      question: question.trim(),
      answer: answer.trim(),
      category: category || 'general',
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    await faq.save();

    return NextResponse.json(
      {
        success: true,
        message: 'FAQ created successfully',
        data: faq,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create FAQ error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}