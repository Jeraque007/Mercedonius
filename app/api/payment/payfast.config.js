// frontend/src/config/payfast.config.js
// Reusable PayFast configuration (sandbox vs live)
// Drop this into any project and adjust the URLs/credentials as needed.

export const PAYFAST = {
  // Gateway host URLs
  SANDBOX_PROCESS_URL: "https://sandbox.payfast.co.za/eng/process",
  LIVE_PROCESS_URL: "https://www.payfast.co.za/eng/process",

  // ITN validation hosts
  SANDBOX_VALIDATE_HOST: "sandbox.payfast.co.za",
  LIVE_VALIDATE_HOST: "www.payfast.co.za",

  // Allowed relay hosts (security whitelist)
  ALLOWED_RELAY_HOSTS: ["sandbox.payfast.co.za", "www.payfast.co.za"],

  // Default currency PayFast settles in
  DEFAULT_CURRENCY: "ZAR",

  // Read sandbox mode from env
  isSandbox() {
    return typeof process !== "undefined" && process.env
      ? process.env.PAYFAST_SANDBOX === "true"
      : false;
  },

  // Resolve the correct process URL based on sandbox mode
  processUrl() {
    return this.isSandbox() ? this.SANDBOX_PROCESS_URL : this.LIVE_PROCESS_URL;
  },

  // Resolve the correct ITN validation host
  validateHost() {
    return this.isSandbox() ? this.SANDBOX_VALIDATE_HOST : this.LIVE_VALIDATE_HOST;
  },
};

// Fixed field order for PayFast MD5 signature (must match PayFast spec)
export const PF_FIELD_ORDER = [
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "name_first",
  "name_last",
  "email_address",
  "m_payment_id",
  "amount",
  "item_name",
  "item_description",
  "custom_str1",
  "custom_str2",
  "subscription_type",
  "billing_date",
  "recurring_amount",
  "frequency",
  "cycles",
];

// PayFast-specific URL encoding
export function pfEncode(str) {
  return encodeURIComponent(String(str).trim())
    .replace(/%20/g, "+")
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A")
    .replace(/~/g, "%7E");
}

// Generate PayFast MD5 signature
// NOTE: Backend/Node-only. Requires the `crypto` built-in. Do not call from the browser;
// the backend (/api/payfast/initiate) generates signatures and returns signed fields.
export function generatePayFastSignature(data, passphrase = "") {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("generatePayFastSignature is backend/Node-only (requires `crypto`).");
  }
  const pfParamString = PAYFAST.PF_FIELD_ORDER
    .filter((k) => data[k] !== undefined && data[k] !== null && data[k] !== "")
    .map((k) => `${k}=${pfEncode(data[k])}`)
    .join("&");
  const stringToHash = passphrase
    ? `${pfParamString}&passphrase=${pfEncode(passphrase)}`
    : pfParamString;
  // MD5 via Web Crypto is not directly supported; this is a Node fallback reference.
  // Use the backend implementation (backend/controllers/payfastController.js) for real signing.
  throw new Error("Use the backend generateSignature (Node crypto md5) for real PayFast signatures.");
}

export default PAYFAST;
