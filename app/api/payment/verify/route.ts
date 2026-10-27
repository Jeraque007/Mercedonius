import { NextRequest, NextResponse } from "next/server";
import { paymentStore } from "../../../lib/paymentStore";

/**
 * GET /api/payment/verify?paymentId=...
 *
 * Frontend calls this after the customer returns to /payment/success to confirm the
 * payment was verified server-side before
 * unlocking purchased content. Never unlock on the browser redirect alone.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");

  if (!paymentId) {
    return NextResponse.json({ verified: false, error: "paymentId required" }, { status: 400 });
  }

  const record = paymentStore.get(paymentId);
  const verified = !!record && record.status === "COMPLETE";

  return NextResponse.json({
    verified,
    paymentId,
    plan: record?.plan ?? null,
    amount: record?.amount ?? null,
    status: record?.status ?? null,
    mode: record?.mode ?? null,
    at: record?.at ?? null,
  });
}
