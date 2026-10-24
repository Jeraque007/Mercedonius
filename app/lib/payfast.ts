/**
 * PayFast payment integration for Mercedonius (Next.js).
 *
 * Generates PayFast checkout URLs server-side and handles ZAR conversion.
 * Merchant config matches layout.tsx values.
 */

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
const PAYFAST_GATEWAY_URL = PAYFAST_SANDBOX ? PAYFAST_SANDBOX_URL : 'https://www.payfast.co.za/eng/process';

export { PAYFAST_GATEWAY_URL };

const PRICE_MONTHLY_USD = 2.99;
const PRICE_ANNUAL_USD = 39.99;
const DEFAULT_EXCHANGE_RATE = 19.10; // USD → ZAR fallback

interface PlanConfig {
  id: 'monthly' | 'annual';
  name: string;
  amountUsd: number;
  description: string;
}

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  monthly: {
    id: 'monthly',
    name: 'Mercedonius Monthly Subscription',
    amountUsd: PRICE_MONTHLY_USD,
    description: 'Mercedonius calendar — monthly subscription ($2.99 USD)',
  },
  annual: {
    id: 'annual',
    name: 'Mercedonius Annual Subscription',
    amountUsd: PRICE_ANNUAL_USD,
    description: 'Mercedonius calendar — annual subscription ($39.99 USD)',
  },
};

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
    .replace(/\$/g, '%24')
    .replace(/~/g, '%7E')
    .replace(/%2F/g, '/');
}

let cachedExchangeRate: number | null = null;
let cachedAt: number = 0;
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Fetch USD→ZAR exchange rate from exchangerate-api.com, with fallback.
 */
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

/**
 * Convert a USD amount to ZAR using the current exchange rate.
 */
export async function usdToZar(usdAmount: number): Promise<number> {
  const rate = await getUsdToZarRate();
  return Math.round(usdAmount * rate * 100) / 100;
}

/**
 * Build PayFast form fields + signature for a given plan.
 * Returns fields object ready to be rendered as a hidden form POST.
 */
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
  if (!plan) throw new Error(`Unknown plan: ${planId}`);

  const amountZar = await usdToZar(plan.amountUsd);
  const paymentId = `MER-${planId}-${Date.now()}`;

  // Build fields INCLUDING merchant_key (merchant_key IS part of the
  // signature string per PayFast spec — all parameters except `signature`
  // itself are included, sorted alphabetically, with RAW unencoded values).
  const sigFields: Record<string, string> = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    name_first: nameFirst,
    name_last: nameLast,
    email_address: emailAddress || 'customer@mercedonius.sae963.com',
    m_payment_id: paymentId,
    amount: amountZar.toFixed(2),
    item_name: plan.name,
    item_description: plan.description,
    custom_str1: planId,
  };

  // PayFast signature: alphabetical keys, ampersand-separated, exclude empty values + signature.
  // Values ARE URL-encoded (PHP-compatible) per PayFast spec.
  const sigInputs = Object.keys(sigFields)
    .sort()
    .filter((k) => sigFields[k] !== '')
    .map((k) => `${k}=${pfEncode(sigFields[k])}`)
    .join('&');

  // Append passphrase if configured (PayFast requires &passphrase= at the end)
  const stringToHash = PAYFAST_PASSPHRASE
    ? `${sigInputs}&passphrase=${pfEncode(PAYFAST_PASSPHRASE)}`
    : sigInputs;

  const crypto = await import('crypto');
  const signature = crypto.createHash('md5').update(stringToHash).digest('hex');

  // Final fields sent to PayFast — includes all sigFields (with merchant_key) + signature
  const fields: Record<string, string> = {
    ...sigFields,
    signature,
  };

  return fields;
}

export function getPlanUsdPrice(planId: 'monthly' | 'annual'): number {
  return PLAN_CONFIGS[planId].amountUsd;
}
