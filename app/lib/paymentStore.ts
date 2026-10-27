/**
 * paymentStore.ts — shared in-memory record of verified payments.
 *
 * Used by:
 *   - /api/payfast/notify  (PayFast ITN, verified server-side before storing)
 *   - /api/payment/verify  (frontend checks whether a payment was verified)
 *
 * In-memory only (resets on deploy/restart). For production persistence,
 * back this with Supabase/Convex/the app database.
 */
export interface PaymentRecord {
  paymentId: string;
  plan: string | null;
  status: string;
  amount: string | null;
  mode: string | null;
  at: string;
}

const store = new Map<string, PaymentRecord>();

export const paymentStore = {
  set(paymentId: string, record: PaymentRecord) {
    store.set(paymentId, record);
  },
  get(paymentId: string): PaymentRecord | null {
    return store.get(paymentId) || null;
  },
  list(): PaymentRecord[] {
    return Array.from(store.values());
  },
  count(): number {
    return store.size;
  },
};

export default paymentStore;