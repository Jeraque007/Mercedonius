import { NextRequest, NextResponse } from 'next/server';
import { paymentStore } from '../../../lib/paymentStore';

const PAYFAST_SANDBOX = process.env.PAYFAST_SANDBOX === 'true';

const PAYFAST_SANDBOX_MERCHANT_ID = process.env.PAYFAST_SANDBOX_MERCHANT_ID || '10004002';
const PAYFAST_SANDBOX_MERCHANT_KEY = process.env.PAYFAST_SANDBOX_MERCHANT_KEY || 'q1cd2rdny4a53';
const PAYFAST_SANDBOX_URL = process.env.PAYFAST_SANDBOXURL || 'https://sandbox.payfast.co.za/eng/process';

const PAYFAST_MERCHANT_ID = PAYFAST_SANDBOX
  ? PAYFAST_SANDBOX_MERCHANT_ID
  : (process.env.PAYFAST_MERCHANT_ID || '13644024');
const PAYFAST_MERCHANT_KEY = PAYFAST_SANDBOX
  ? PAYFAST_SANDBOX_MERCHANT_KEY
  : (process.env.PAYFAST_MERCHANT_KEY || 'eki2ah3zqprwe');
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || 'payfast';



function md5(str: string): string {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * PHP-compatible URL encoding for PayFast signature strings.
 * Mirrors PHP's urlencode(): spaces as '+', special chars like ! ' ( ) * encoded.
 */
function pfEncode(str: string): string {
  return encodeURIComponent(String(str).trim())
    .replace(/%20/g, '+')
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/~/g, '%7E')
    // PHP urlencode() does NOT encode '/' — leave it as-is to match PayFast
    .replace(/%2F/g, '/');
}

function verifyPayFastSignature(params: Record<string, string>): boolean {
  const providedSignature = params.signature;
  if (!providedSignature) return false;

  const signatureInputs = Object.keys(params)
    .sort()
    .filter((k) => k !== 'signature' && params[k] !== '')
    .map((k) => `${k}=${pfEncode(params[k])}`)
    .join('&');

  // Append passphrase if configured (must match initiate side exactly)
  const stringToHash = PAYFAST_PASSPHRASE
    ? `${signatureInputs}&passphrase=${pfEncode(PAYFAST_PASSPHRASE)}`
    : signatureInputs;

  const expected = md5(stringToHash);
  return expected === providedSignature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params: Record<string, string> = {};

    for (const pair of body.split('&')) {
      const [key, ...valueParts] = pair.split('=');
      if (key) {
        params[key] = decodeURIComponent(valueParts.join('='));
      }
    }

    if (params.merchant_id !== PAYFAST_MERCHANT_ID) {
      return NextResponse.json({ error: 'Invalid merchant_id' }, { status: 400 });
    }

    if (!verifyPayFastSignature(params)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const paymentId = params.m_payment_id || 'unknown';
    const amount = params.amount || '0';
    const status = params.payment_status || 'COMPLETE';
    const plan = params.custom_str1 || null;

    paymentStore.set(paymentId, {
      paymentId,
      amount,
      status,
      plan,
      mode: null,
      at: new Date().toISOString(),
    });

    console.log('[PayFast IPN]', { paymentId, amount, status, plan });

    return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (e) {
    console.error('[PayFast IPN error]', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    count: paymentStore.count(),
    payments: paymentStore.list(),
  });
}