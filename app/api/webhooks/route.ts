
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Webhook from '@/lib/models/Webhook';
import { paymentCache } from '@/lib/payment-cache';

interface WebhookRequestData {
  code?: string;
  desc?: string;
  success?: boolean;
  data: {
    accountNumber: string;
    amount: number;
    description: string;
    reference: string;
    transactionDateTime: string;
    virtualAccountNumber?: string;
    counterAccountBankId?: string;
    counterAccountBankName?: string;
    counterAccountName?: string;
    counterAccountNumber?: string;
    virtualAccountName?: string;
    currency?: string;
    orderCode?: number;
    paymentLinkId?: string;
    code?: string;
    desc?: string;
    signature?: string;
  };
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const description: string | null = searchParams.get('description');
    const amount: string | null = searchParams.get('amount');
    const orderCode: string | null = searchParams.get('orderCode'); // Thêm parameter cho PayOS
    const page: string | null = searchParams.get('page');
    const limitParam: string | null = searchParams.get('limit');

    let query: any = {};
    let limit: number = 10;
    let skip: number = 0;

    // If description and amount provided, search for specific transaction (VietQR)
    if (description && amount) {
      query = {
        'data.description': { $regex: description, $options: "i" },
        'data.amount': parseInt(amount)
      };
      limit = 5;
    }
    // If orderCode provided, search for PayOS transaction
    else if (orderCode) {
      console.log('Searching for orderCode:', orderCode);
      query = {
        'data.orderCode': parseInt(orderCode)
      };
      limit = 1;
    }
    else {
      // Handle pagination for list view
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limitParam ? parseInt(limitParam) : 10;
      limit = Math.min(limitNum, 100);
      skip = (pageNum - 1) * limit;
    }

    const webhooks = await Webhook.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // If searching for specific transaction, return simplified response
    if ((description && amount) || orderCode) {
      if (webhooks.length > 0) {
        const status = webhooks[0]?.data?.orderCode ? "done" : "done";
        
        // Update cache with payment status
        if (orderCode) {
          paymentCache.set(orderCode, status, webhooks[0]?.data?.amount);
        }
        
        return NextResponse.json({
          success: true,
          data: "done",
          webhooks: webhooks
        });
      } else {
        return NextResponse.json({
          success: true,
          data: "none"
        });
      }
    }

    // Regular list response with pagination info
    const total = await Webhook.countDocuments(query);
    return NextResponse.json({
      success: true,
      data: webhooks,
      pagination: {
        page: page ? parseInt(page) : 1,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const webhookData: WebhookRequestData = await req.json();

    // Validate required fields
    if (!webhookData.data || !webhookData.data.accountNumber || !webhookData.data.amount) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields: data.accountNumber, data.amount"
      }, { status: 400 });
    }

    // Check if webhook already exists (prevent duplicates)
    const existingWebhook = await Webhook.findOne({
      'data.reference': webhookData.data.reference,
      'data.amount': webhookData.data.amount
    });

    if (existingWebhook) {
      return NextResponse.json({
        success: true,
        message: "Webhook already exists",
        data: existingWebhook
      });
    }

    // Create webhook document
    const webhook = new Webhook({
      code: webhookData.code || '00',
      desc: webhookData.desc || 'success',
      success: webhookData.success !== undefined ? webhookData.success : true,
      data: webhookData.data
    });

    const savedWebhook = await webhook.save();

    // Update cache with payment status
    if (webhookData.data.orderCode) {
      paymentCache.set(
        webhookData.data.orderCode.toString(),
        "done",
        webhookData.data.amount
      );
    }

    return NextResponse.json({
      success: true,
      message: "Webhook received successfully",
      data: savedWebhook
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
