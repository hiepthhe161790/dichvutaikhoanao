import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import { getTokenFromCookies } from "@/lib/auth";
import User from "@/lib/models/User";
import { Types } from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Verify authentication
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { orderId } = await params;

    // Validate orderId
    if (!Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    // Fetch order with populated product and user info
    const order = await Order.findById(orderId)
      .populate("productId", "title price platform description")
      .populate("userId", "email username phone fullName balance totalPurchased totalSpent status createdAt")
      .lean() as any;

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify user owns this order (skip for admin)
    const userIdFromToken = await getUserIdFromToken(token);
    const isAdmin = await checkIsAdmin(userIdFromToken);
    
    if (!isAdmin && order.userId._id.toString() !== userIdFromToken) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Return order details
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to extract userId from JWT token
async function getUserIdFromToken(token: string): Promise<string> {
  try {
    // Decode JWT token
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.userId;
  } catch {
    return "";
  }
}

// Helper function to check if user is admin
async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const user = await User.findById(userId).lean() as any;
    return user?.role === "admin";
  } catch {
    return false;
  }
}
