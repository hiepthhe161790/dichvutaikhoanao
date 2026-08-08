import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { redis, isRedisEnabled } from "@/lib/redis";
import Invoice from "@/lib/models/Invoice";

/**
 * GET /api/webhooks/stream?orderCode=xxx
 * Server-Sent Events endpoint for real-time payment status updates.
 * Queries Redis or Database dynamically every 2 seconds, eliminating memory-sharing issues
 * across Serverless (Vercel) and persistent (Render) clusters.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderCode = searchParams.get("orderCode");
  
  if (!orderCode) {
    return new Response(JSON.stringify({ error: "orderCode is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      await connectDB();

      // Helper function to check status from Redis or Database
      const checkStatus = async (): Promise<boolean> => {
        // 1. Check Redis first (high performance)
        if (isRedisEnabled && redis) {
          try {
            const cachedStatus = await redis.get<string>(`payment-status:${orderCode}`);
            if (cachedStatus === "done") {
              return true;
            }
          } catch (redisError) {
            console.error("[Stream Webhook] Redis get status error:", redisError);
          }
        }

        // 2. Fallback to Database (MongoDB consistency check)
        try {
          const invoice = await Invoice.findOne({ orderCode: parseInt(orderCode) });
          if (invoice && invoice.status === "completed") {
            // Sync Redis cache state if it was missed
            if (isRedisEnabled && redis) {
              await redis.set(`payment-status:${orderCode}`, "done", { ex: 3600 });
            }
            return true;
          }
        } catch (dbError) {
          console.error("[Stream Webhook] DB find invoice error:", dbError);
        }

        return false;
      };

      // 1. Send initial status immediately
      const isPaidInitial = await checkStatus();
      if (isPaidInitial) {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ status: "done" })}\n\n`)
          );
          controller.close();
        } catch {}
        return;
      } else {
        // Send initial pending status
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ status: "pending" })}\n\n`)
          );
        } catch {
          return;
        }
      }

      // 2. Start polling interval (Backend Polling) every 2 seconds
      let ticks = 0;
      const maxTicks = 60; // 60 * 2s = 120 seconds (2 minutes connection timeout)
      
      const interval = setInterval(async () => {
        ticks++;
        
        if (ticks > maxTicks) {
          clearInterval(interval);
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ status: "timeout" })}\n\n`)
            );
            controller.close();
          } catch {
            // Stream might already be closed
          }
          return;
        }

        const isPaid = await checkStatus();
        if (isPaid) {
          clearInterval(interval);
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ status: "done" })}\n\n`)
            );
            controller.close();
          } catch {
            // Stream might already be closed
          }
        } else {
          // Send keep-alive tick
          try {
            controller.enqueue(encoder.encode(": keep-alive\n\n"));
          } catch {
            // Connection closed by client
            clearInterval(interval);
          }
        }
      }, 2000);

      // Cleanup on abort
      (request as any).signal?.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    },
    cancel() {
      // Stream canceled
    }
  });

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
