import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/payment/notify
 *
 * Local payment-notification endpoint. Receives payment-result callbacks
 * (from the engine's simulated/test mode) and stores them in-memory.
 * This gives the app a REAL local endpoint so tests do NOT need to contact
 * an external host to prove the connection.
 *
 * NOTE: PayFast Instant Payment Notifications (IPN/ITN) are handled by a
 * separate endpoint — /api/payfast/notify — which verifies the PayFast
 * signature and stores the result in paymentStore for this route's
 * /api/payment/verify endpoint to read.
 *
 * This replaces any ghost "/true" POST target: the engine notifies here (and
 * the browser returns to /payment/success | /payment/cancel) instead of
 * posting to a non-existent route.
 */

const receivedNotifications = new Map<string, {
  paymentId: string;
  plan: string | null;
  status: string;
  amount: string | null;
  mode: string | null;
  at: string;
}>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, plan, status, amount, mode } = body || {};

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId is required" }, { status: 400 });
    }

    receivedNotifications.set(paymentId, {
      paymentId,
      plan: plan ?? null,
      status: status ?? "COMPLETE",
      amount: amount ?? null,
      mode: mode ?? null,
      at: new Date().toISOString(),
    });

    console.log("[Payment notify]", { paymentId, plan, status, amount, mode });

    return NextResponse.json({ ok: true, received: true, paymentId });
  } catch (e) {
    console.error("[Payment notify error]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    count: receivedNotifications.size,
    notifications: Array.from(receivedNotifications.values()),
  });
}