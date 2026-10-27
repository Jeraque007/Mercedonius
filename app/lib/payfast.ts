/**
 * PayFast payment integration for Mercedonius (Next.js).
 *
 * Generates PayFast checkout URLs server-side and handles ZAR conversion.
 * Merchant config matches layout.tsx values.
 */

const PAYFAST_SANDBOX = process.env.PAYFAST_SANDBOX === 'true';

const PAYFAST_SANDBOX_MERCHANT_ID = process.env.PAYFAST_SANDBOX_MERCHANT_ID || '10036507';
const PAYFAST_SANDBOX_MERCHANT_KEY = process.env.PAYFAST_SANDBOX_MERCHANT_KEY || '7zwxmbbv6nbz1';
const PAYFAST_SANDBOX_URL = process.env.PAYFAST_SANDBOX_URL || 'https://sandbox.payfast.co.za/eng/process';
const PAYFAST_SANDBOX_VALIDATE_URL =
  process.env.PAYFAST_SANDBOX_VALIDATE_URL || 'https://sandbox.payfast.co.za/eng/query/validate';

const PAYFAST_MERCHANT_ID = PAYFAST_SANDBOX
  ? PAYFAST_SANDBOX_MERCHANT_ID
  : (process.env.PAYFAST_MERCHANT_ID || '13644024');
const PAYFAST_MERCHANT_KEY = PAYFAST_SANDBOX
  ? PAYFAST_SANDBOX_MERCHANT_KEY
  : (process.env.PAYFAST_MERCHANT_KEY || 'eki2ah3zqprwe');
const PAYFAST_PASSPHRASE = PAYFAST_SANDBOX
  ? (process.env.PAYFAST_SANDBOX_SALT_PASSPHRASE || '963hlvbsbtest')
  : (process.env.PAYFAST_SECURITY_PASSPHRASE || ',Usiness-ynergy/octor75');
const PAYFAST_GATEWAY_URL = PAYFAST_SANDBOX
  ? PAYFAST_SANDBOX_URL
  : (process.env.PAYFAST_URL || 'https://my.payfast.io');
const PAYFAST_VALIDATE_URL = PAYFAST_SANDBOX
  ? PAYFAST_SANDBOX_VALIDATE_URL
  : 'https://www.payfast.co.za/eng/query/validate';

export {
  PAYFAST_GATEWAY_URL,
  PAYFAST_VALIDATE_URL,
  PAYFAST_MERCHANT_ID,
  PAYFAST_MERCHANT_KEY,
  PAYFAST_PASSPHRASE,
  PAYFAST_SANDBOX,
};

const PRICE_MONTHLY_USD = 2.99;
const PRICE_ANNUAL_USD = 39.99;
const DEFAULT_EXCHANGE_RATE = 19.10; // USD -> ZAR fallback
const CACHE_TTL_MS = 5 * 60 * 1000;

function pfEncode(str: string): string {
  return encodeURIComponent(String(str).trim())
    .replace(/%20/g, '+')
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/\$/g, '%24')
    .replace(/~/g, '%7E')
    .replace(/,/g, '%2C')
    // PHP urlencode() does NOT encode '/' — leave it as-is to match PayFast
    .replace(/%2F/g, '/');
}

let cachedExchangeRate: number | null = null;
let cachedAt: number = 0;

export async function getUsdToZarRate(): Promise<number> {
  const now = Date.now();
  if (cachedExchangeRate && now - cachedAt < CACHE_TTL_MS) {
    return cachedExchangeRate;
  }
  try {
    const res = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { cache: 'no-store', signal: AbortSignal.timeout(3500) }
    );
    if (res.ok) {
      const data = await res.json();
      const rate = data?.rates?.['ZAR'];
      if (rate && typeof rate === 'number') {
        cachedExchangeRate = rate;
        cachedAt = now;
        return rate;
      }
    }
  } catch {
    /* fall through to fallback */
  }
  return DEFAULT_EXCHANGE_RATE;
}

export async function usdToZar(usdAmount: number): Promise<number> {
  const rate = await getUsdToZarRate();
  return Math.round(usdAmount * rate * 100) / 100;
}

interface PlanConfig {
  id: "monthly" | "annual";
  name: string;
  amountUsd: number;
  description: string;
}

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  monthly: {
    id: "monthly",
    name: "Mercedonius Monthly Subscription",
    amountUsd: PRICE_MONTHLY_USD,
    description: "Mercedonius calendar - monthly subscription ($2.99 USD)",
  },
  annual: {
    id: "annual",
    name: "Mercedonius Annual Subscription",
    amountUsd: PRICE_ANNUAL_USD,
    description: "Mercedonius calendar - annual subscription ($39.99 USD)",
  },
};

export async function buildPayFastFields({
  planId,
  returnUrl,
  cancelUrl,
  notifyUrl,
  emailAddress,
  nameFirst = 'Mercedonius',
  nameLast = 'Customer',
}: {
  planId: 'monthly' | 'annual';
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  emailAddress?: string;
  nameFirst?: string;
  nameLast?: string;
}): Promise<Record<string, string>> {
  const plan = PLAN_CONFIGS[planId];
  if (!plan) throw new Error('Unknown plan: ' + planId);

  const amountZar = await usdToZar(plan.amountUsd);
  const paymentId = 'MER-' + planId + '-' + Date.now();

  const sigFields: Record<string, string> = {
    merchant_id: String(PAYFAST_MERCHANT_ID).trim(),
    merchant_key: String(PAYFAST_MERCHANT_KEY).trim(),
    return_url: String(returnUrl).trim(),
    cancel_url: String(cancelUrl).trim(),
    notify_url: String(notifyUrl).trim(),
    name_first: String(nameFirst).trim(),
    name_last: String(nameLast).trim(),
    email_address: String(emailAddress || 'customer@mercedonius.sae963.com').trim(),
    m_payment_id: String(paymentId).trim(),
    amount: amountZar.toFixed(2),
    item_name: String(plan.name).trim(),
    item_description: String(plan.description).trim(),
    custom_str1: String(planId).trim(),
  };

  const sigInputs = Object.keys(sigFields)
    .sort()
    .filter((k) => sigFields[k] !== '')
    .map((k) => k + '=' + pfEncode(sigFields[k]))
    .join('&');

  const stringToHash = PAYFAST_PASSPHRASE
    ? sigInputs + '&passphrase=' + pfEncode(PAYFAST_PASSPHRASE)
    : sigInputs;

  const crypto = await import('crypto');
  const signature = crypto.createHash('md5').update(stringToHash).digest('hex');

  const fields: Record<string, string> = {
    ...sigFields,
    signature,
  };

  return fields;
}

export function getPlanUsdPrice(planId: 'monthly' | 'annual'): number {
  return PLAN_CONFIGS[planId].amountUsd;
}