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
      .limit(3)
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

export async function POST(req) {
  try {
    const client = await clientPromise;

    const db = client.db(DB_NAME);
    const bankingsCollection = db.collection(COLLECTION_NAME);

    let data = await req.json();

    const dataOrder = await bankingsCollection.insertOne(data);

    return NextResponse.json({ success: true, message: "Nhận qr thành công", data: dataOrder });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const client = await clientPromise;

    const db = client.db(DB_NAME);
    const bankingsCollection = db.collection(COLLECTION_NAME);

    let { content, transferAmount } = await req.json();

    // Find banking document that matches both content and transferAmount
    const banking = await bankingsCollection.findOne({
      content: { $regex: content, $options: "i" }, // Case-insensitive search for content
      transferAmount: transferAmount
    });

    if (!banking) {
      return NextResponse.json({ success: true, data: "none" }, { status: 200 });
    }

    // If you need to modify or return the banking document, continue with your logic here
    return NextResponse.json({ success: true, data: "done" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
