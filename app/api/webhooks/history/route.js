import clientPromise from "@muahub/lib/mongodb";
import { NextResponse } from "next/server";

const DB_NAME = "accounts";
const COLLECTION_NAME = "bankings";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}


export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const bankingsCollection = db.collection(COLLECTION_NAME);


    const bankings = await bankingsCollection
      .find({})
      .sort({ _id: -1 })
      .toArray();

    return new NextResponse(
      JSON.stringify({ success: true, data: bankings }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // hoặc cụ thể: http://localhost:3001
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
