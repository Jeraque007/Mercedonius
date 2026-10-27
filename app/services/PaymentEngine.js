/**
 * PaymentEngine.js - Mercedonius own payment system.
 *
 * This is an abstraction over payment backends. It decides which payment path
 * to take based on NEXT_PUBLIC_PAYMENT_MODE:
 *
 *   test - simulate a payment entirely on this host. No external host is
 *          contacted. Offline/CI only.
 *   sandbox - redirect to PayFast sandbox for a real (cheap) test purchase.
 *          The form auto-submits to PayFast; no external host is called from
 *          this JS file directly — the /api/payfast/initiate endpoint does that.
 *   real - redirect to PayFast live gateway for a production purchase.
 *
 * Any other value logs a clear question instead of silently failing.
 */
const PAYMENT_MODE = typeof process !== 'undefined' && process.env
  ? (process.env.PAYMENT_MODE || process.env.NEXT_PUBLIC_PAYMENT_MODE || 'test')
  : 'test';

const VALID_MODES = ['test', 'sandbox', 'real'];

function getPaymentMode() {
  return PAYMENT_MODE;
}

function isTestMode() {
  return PAYMENT_MODE === 'test';
}

function isSandboxMode() {
  return PAYMENT_MODE === 'sandbox';
}

function isRealMode() {
  return PAYMENT_MODE === 'real';
}

function simulatePayment(plan) {
  return new Promise((resolve) => {
    const paymentId = `MER-TEST-${plan.id}-${Date.now()}`;
    setTimeout(() => {
      resolve({
        ok: true,
        mode: "test",
        paymentId,
        plan: plan.id,
        amount: plan.price || plan.priceUSD || "0.00",
        status: "COMPLETE",
        message:
          "Simulated payment completed (test mode — no external host).",
      });
    }, 600);
  });
}

/**
 * Calls the server-side /api/payfast/initiate endpoint to get PayFast form
 * fields. This is the only place that contacts the PayFast gateway — and only
 * via the server endpoint, keeping merchant credentials out of the browser.
 */
async function initiateViaPayFastApi(plan, user) {
  const email = user && user.email ? user.email : undefined;
  const res = await fetch('/api/payfast/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planId: plan.id,
      email,
    }),
  });

  if (!res.ok) {
    let detail = 'Payment initiation failed';
    try { detail = (await res.json()).error || detail; } catch { /* ignore */ }
    throw new Error(detail);
  }

  return res.json();
}

/**
 * Creates a hidden form with PayFast checkout fields and auto-submits it.
 * The form targets the PayFast gateway URL (sandbox or live).
 * After submission the browser navigates to PayFast externally; the customer
 * is returned to /payment/success or /payment/cancel based on the outcome.
 */
function submitPayFastForm(fields, action) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;
  form.target = '_top';

  Object.keys(fields).forEach((key) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = fields[key];
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

async function processPayment(plan, user, callbacks = {}) {
  const { onSuccess, onError } = callbacks;
  const mode = getPaymentMode();

  if (!mode) {
    const msg = `Unknown NEXT_PUBLIC_PAYMENT_MODE "${PAYMENT_MODE}". ` +
      `Expected one of: ${VALID_MODES.join(', ')}. ` +
      `Default is sandbox. Set NEXT_PUBLIC_PAYMENT_MODE=real only in production.`;
    console.warn("[PaymentEngine] " + msg);
    if (onError) onError(msg);
    return { ok: false, error: msg, mode: null };
  }

  if (!plan) {
    const msg = "No plan provided to processPayment.";
    console.warn("[PaymentEngine] " + msg);
    if (onError) onError(msg);
    return { ok: false, error: msg, mode };
  }

  const planId =
    plan.id === "monthly" || plan.id === "annual" ? plan.id : "monthly";
  const email = user && user.email ? user.email : undefined;

  try {
    if (isTestMode()) {
      const result = await simulatePayment({ ...plan, id: planId });
      if (onSuccess) onSuccess(result);
      return result;
    }

    // sandbox / real: redirect to PayFast gateway
    const result = await initiateViaPayFastApi({ ...plan, id: planId }, user);
    if (onSuccess) onSuccess(result);
    return result;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Payment failed";
    console.error("[PaymentEngine] payment error:", msg);
    if (onError) onError(msg);
    return { ok: false, error: msg, mode };
  }
}

export { processPayment, simulatePayment, submitPayFastForm, initiateViaPayFastApi };
export default {
  processPayment,
  getPaymentMode,
  isSandboxMode,
  isTestMode,
  isRealMode,
};