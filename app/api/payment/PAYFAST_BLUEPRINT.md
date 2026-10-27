# PayFast Integration Blueprint & Sandbox Setup Guide

> Reusable blueprint for adding PayFast (South African payment gateway) to any project.
> Based on the production-tested integration in `Tessera Lumen / Sophia-Tarot-App`.

---

## 1. Architecture Overview

PayFast is a **redirect-based** gateway. The flow is:

```
Client ──POST /api/payfast/initiate──► Backend (signed fields + paymentUrl)
                                                        │
                                                        ▼ form POST / redirect
                                              PayFast Sandbox (user pays / cancels)
                                                        │
          ┌───────────────────────┬─────────────────────┴─────────────────────┐
          │ ITN (server-to-server)│ Browser return (redirect)                 │
          │ POST /api/payfast/notify│ GET /?paid=1 or ?cancelled=1            │
          ▼                     ▼                                         ▼
   Backend validate ITN   Frontend success pg                    Frontend cancel pg
```

Key principle: **Never trust the browser return alone.** Always verify payment via the server-to-server ITN (Instant Transaction Notification) before granting access.

---

## 2. Environment Variables

Create a `.env` (backend) and `.env.local` / `VITE_*` (frontend). Never commit real values.

**Backend (`.env`):**

```
PAYFAST_MERCHANT_ID=10000100          # Sandbox merchant ID from PayFast dashboard
PAYFAST_MERCHANT_KEY=your_sandbox_key # Sandbox merchant key
PAYFAST_PASSPHRASE=your_passphrase    # Optional but recommended signature salt
PAYFAST_SANDBOX=true                  # "true" = sandbox, omit/false = live
API_SECRET_KEY=shared_secret          # Protects /api routes (fail-closed)
SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
```

**Frontend (`.env.local` / Vite):**

```
VITE_API_SECRET_KEY=shared_secret     # Must match backend API_SECRET_KEY
```

**Sandbox credentials (obtain from PayFast):**
- Log into the PayFast Sandbox Merchant Dashboard → My Account → API Credentials
- You get `merchant_id`, `merchant_key`, and can set a `passphrase`.
- Sandbox test cards are provided by PayFast (do not use real cards).

---

## 3. Backend Routes

Mount these under `/api/payfast/...`:

| Route | Method | Purpose |
|-------|--------|---------|
| `/initiate` | POST | Build signed PayFast request, return `paymentUrl` + `fields` |
| `/notify` | POST | Receive ITN from PayFast, validate, fulfill order |
| `/status` | GET | Query payment status by email (client polling) |
| `/relay` | GET | Safe relay page that POSTs form to PayFast (bypasses CORS on native) |

### Route wiring (Express)

```js
import payfastRoutes from "./routes/payfast.js";
router.use("/payfast", payfastRoutes);
```

### `backend/routes/payfast.js`

```js
import express from "express";
import { initiate, notify, getStatus, relay } from "../controllers/payfastController.js";

const router = express.Router();

router.post("/initiate", initiate);
router.post("/notify", notify);
router.get("/status", getStatus);
router.get("/relay", relay);

export default router;
```

## 4. Backend Controller (Core Logic)

### Signature generation (MD5)

PayFast signs parameters with MD5. Fields must be in a **fixed order**, empty values omitted, values URL-encoded with PayFast's custom encoding (` ` → `+`, etc.).

```js
import crypto from "crypto";

const PF_FIELD_ORDER = [
  "merchant_id","merchant_key","return_url","cancel_url","notify_url",
  "name_first","name_last","email_address","m_payment_id","amount",
  "item_name","item_description","custom_str1","custom_str2",
  "subscription_type","billing_date","recurring_amount","frequency","cycles"
];

function pfEncode(str) {
  return encodeURIComponent(String(str).trim())
    .replace(/%20/g, "+")
    .replace(/!/g, "%21").replace(/'/g, "%27")
    .replace(/\(/g, "%28").replace(/\)/g, "%29")
    .replace(/\*/g, "%2A").replace(/~/g, "%7E");
}

function generateSignature(data, passphrase = "") {
  const pfParamString = PF_FIELD_ORDER
    .filter(k => data[k] !== undefined && data[k] !== null && data[k] !== "")
    .map(k => `${k}=${pfEncode(data[k])}`)
    .join("&");
  const stringToHash = passphrase
    ? `${pfParamString}&passphrase=${pfEncode(passphrase)}`
    : pfParamString;
  return crypto.createHash("md5").update(stringToHash).digest("hex");
}
```

### Initiate endpoint

```js
export const initiate = async (req, res) => {
  const { package: pkg, user, native } = req.body;
  if (!pkg || !user) return res.status(400).json({ error: "Missing package or user" });

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["host"];
  const SITE_URL = `${protocol}://${host}`;
  const RETURN_BASE = SITE_URL;

  let exchangeRate = 19.10;
  try {
    const fx = await fetch("https://api.exchangerate-api.com/v4/latest/USD", { signal: AbortSignal.timeout(3500) });
    const fxData = await fx.json();
    exchangeRate = fxData.rates?.ZAR || 19.10;
  } catch (_) { /* keep fallback */ }

  const usdAmount = parseFloat(pkg.priceUSD || pkg.price || "9.99");
  const amountZAR = (usdAmount * exchangeRate).toFixed(2);

  const pfData = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID?.trim(),
    merchant_key: process.env.PAYFAST_MERCHANT_KEY?.trim(),
    return_url: `${RETURN_BASE}/?paid=1`,
    cancel_url: `${RETURN_BASE}/?cancelled=1`,
    notify_url: `${SITE_URL}/api/payfast/notify`,
    name_first: user.firstName || "",
    name_last: user.lastName || "",
    email_address: user.email,
    m_payment_id: `m_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    amount: amountZAR,
    item_name: pkg.name,
    item_description: pkg.desc || "",
    custom_str1: pkg.id || "",
    custom_str2: pkg.type || "standard",
    subscription_type: pkg.type === "sub" ? "1" : "",
    recurring_amount: pkg.type === "sub" ? amountZAR : "",
    frequency: pkg.type === "sub" ? "1" : "",
    cycles: pkg.type === "sub" ? "0" : "",
  };

  if (!pfData.merchant_id || !pfData.merchant_key) {
    return res.status(500).json({ error: "Server configuration error (Credentials)" });
  }

  pfData.signature = generateSignature(pfData, process.env.PAYFAST_PASSPHRASE || "");

  const isSandbox = process.env.PAYFAST_SANDBOX === "true";
  const pfHost = isSandbox
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";

  res.json({ paymentUrl: pfHost, fields: pfData, isSandbox });
};
```

### Notify (ITN) endpoint

```js
export const notify = async (req, res) => {
  const pfData = req.body;
  const isSandbox = process.env.PAYFAST_SANDBOX === "true";
  const host = isSandbox ? "sandbox.payfast.co.za" : "www.payfast.co.za";

  // 1. Re-POST to PayFast to validate the ITN (server-to-server)
  try {
    const validation = await fetch(`https://${host}/eng/query/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(pfData),
    });
    const valid = await validation.text(); // expect "VALID"
    if (valid !== "VALID") return res.status(400).send("Invalid ITN");
  } catch (e) {
    return res.status(500).send("Validation failed");
  }

  // 2. Check security fields
  const { payment_status: status, pf_payment_id, m_payment_id, email_address,
          amount_gross, item_name, custom_str1, signature } = pfData;
  const email = email_address?.toLowerCase().trim();
  if (!email) return res.status(400).send("No email");

  // 3. Log payment
  await logPayment({ ... });

  // 4. Fulfill only on COMPLETE
  if (status === "COMPLETE") {
    const isDeeper = custom_str1 === "deeper";
    const planId = isDeeper ? null : parseInt(custom_str1 || "0");
    // activate subscription / unlock content in your DB
  }

  res.status(200).send("OK"); // acknowledge to PayFast
};
```


## 5. Host URLs (Sandbox vs Live)

| Environment | Process URL | ITN Validation Host |
|-------------|-------------|---------------------|
| Sandbox | `https://sandbox.payfast.co.za/eng/process` | `sandbox.payfast.co.za` |
| Live | `https://www.payfast.co.za/eng/process` | `www.payfast.co.za` |

Switch via `PAYFAST_SANDBOX=true` (sandbox) or unset/false (live).

## 6. Frontend Integration

### PayFast utility (`frontend/src/utils/payfast.js`)

Calls `/api/payfast/initiate`, receives `paymentUrl` + `fields`, then submits a hidden POST form directly to PayFast.

```js
import { apiUrl, apiHeaders } from "./apiBase.js";

export const PACKAGE_PRICES_USD = {
  1: "1.99", 2: "9.99", 3: "14.99",
  4: "9.99", 5: "17.99", 6: "24.99",
};

export async function initiatePayFastPayment(pkg, user) {
  const isNative = window.Capacitor?.isNativePlatform?.();
  const endpoint = apiUrl("/api/payfast/initiate");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: apiHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ package: { ...pkg, price: PACKAGE_PRICES_USD[pkg.id] || "9.99" }, user, native: isNative }),
  });

  if (!res.ok) throw new Error(`Payment initiation failed (${res.status})`);
  const { paymentUrl, fields } = await res.json();

  const form = document.createElement("form");
  form.method = "POST";
  form.action = paymentUrl;
  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden"; input.name = key; input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit(); // redirects browser to PayFast
}

export async function initiateDeeperPayment(user) {
  const res = await fetch(apiUrl("/api/payfast/initiate"), {
    method: "POST",
    headers: apiHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ package: { id: "deeper", type: "deeper", name: "Advanced Reading", desc: "...", price: "44.00" }, user, native: false }),
  });
  if (!res.ok) throw new Error("Deeper payment initiation failed");
  const { paymentUrl, fields } = await res.json();
  const form = document.createElement("form");
  form.method = "POST"; form.action = paymentUrl;
  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden"; input.name = key; input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}
```

### Provider pattern (`frontend/src/services/payments/PayFastProvider.js`)

```js
import { PaymentProvider } from "./PaymentProvider.js";
import { initiatePayFastPayment, initiateDeeperPayment } from "../../utils/payfast.js";

export class PayFastProvider extends PaymentProvider {
  async isAvailable() { return true; } // fallback for Web / non-HMS Android
  async purchase(selectedPackage, user, callbacks) {
    const { onError, onPending } = callbacks;
    try {
      if (onPending) onPending({ type: "standard", pkgId: selectedPackage.id, timestamp: Date.now() });
      if (selectedPackage.id === "deeper") {
        await initiateDeeperPayment(user);
      } else {
        await initiatePayFastPayment(selectedPackage, user);
      }
    } catch (err) {
      const msg = err.message === "Failed to fetch" ? "Connectivity Error: Unable to reach payment gateway." : (err.message || "Payment initiation failed");
      onError(msg);
    }
  }
}
```


## 7. Screens Needed (Frontend)

These are the screens required to set up PayFast sandbox for any project:

| Screen | File | Purpose |
|--------|------|---------|
| Package Selection | `PackageScreen.jsx` | User picks a reading/subscription package |
| Payment | `PaymentScreen.jsx` | Shows selected package, triggers PayFast redirect |
| Success | `PaymentSuccessScreen.jsx` | Shown after `?paid=1` return (pending ITN fulfillment) |
| Cancel | `PaymentCancelScreen.jsx` | Shown after `?cancelled=1` return |
| Pending | `PaymentPendingScreen.jsx` | Optional polling screen while ITN is processed |

### Route mapping example

```js
{
  "packages": PackageScreen,
  "payment": PaymentScreen,
  "success": PaymentSuccessScreen,
  "cancel": PaymentCancelScreen,
  "purchase": PaymentScreen,   // alias
  "checkout": PaymentScreen,   // alias
}
```

## 8. Security Checklist

- [ ] `PAYFAST_SANDBOX=true` during development; remove/set false for live
- [ ] Never expose `PASSPHRASE` or merchant key in frontend bundle
- [ ] Validate ITN server-to-server before fulfilling (never trust `?paid=1` alone)
- [ ] Whitelist relay targets (`sandbox.payfast.co.za`, `www.payfast.co.za`)
- [ ] HTML-escape all values in relay page (XSS protection)
- [ ] Rate-limit `/initiate` and `/notify`
- [ ] Require `X-API-Key` on `/api` routes (fail-closed)
- [ ] Log all ITN payloads for dispute reconciliation

## 9. Sandbox Testing Steps

1. Sign up at [PayFast Sandbox](https://www.sandbox.payfast.co.za) (merchant signup).
2. Get sandbox `merchant_id` + `merchant_key` from dashboard → API Credentials.
3. Set a `passphrase` in sandbox profile → passphrase.
4. Add env vars to backend `.env` with `PAYFAST_SANDBOX=true`.
5. Add return/notify/notify URLs in sandbox profile (use `https://yourdomain/api/payfast/notify` — ngrok works for local dev).
6. Start backend, open frontend, click Pay on a package → browser redirects to `sandbox.payfast.co.za`.
7. Complete payment using PayFast sandbox test card details.
8. Confirm ITN `notify` endpoint receives `payment_status=COMPLETE` and fulfills the order.
9. Confirm browser returns to `/?paid=1` → success screen.
10. Switch `PAYFAST_SANDBOX=false` + live credentials for production.

