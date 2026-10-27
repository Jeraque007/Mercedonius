import { NextRequest, NextResponse } from 'next/server';
import { buildPayFastFields, PAYFAST_GATEWAY_URL } from '../../../lib/payfast';

/**
 * POST /api/payfast/initiate
 * Body: { planId: 'monthly' | 'annual', email?: string }
 * Returns PayFast form fields for client-side auto-submit.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, email } = body;

    if (!planId || !(planId === 'monthly' || planId === 'annual')) {
      return NextResponse.json(
        { error: 'planId must be "monthly" or "annual"' },
        { status: 400 }
      );
    }

    const origin = new URL(req.url).origin;
    const returnUrl = `${origin}/payment/success?plan=${planId}`;
    const cancelUrl = `${origin}/payment/cancel?plan=${planId}`;
    const notifyUrl = `${origin}/api/payfast/notify`;

    const fields = await buildPayFastFields({
      planId,
      returnUrl,
      cancelUrl,
      notifyUrl,
      emailAddress: email,
    });

    return NextResponse.json({ fields, action: PAYFAST_GATEWAY_URL });
  } catch (e) {
    console.error('[PayFast initiate error]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Payment initiation failed' },
      { status: 500 }
    );
  }
}