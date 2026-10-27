/**
 * PaymentFactory.js — provider factory for Mercedonius payments.
 *
 * Returns a payment provider with a consistent interface:
 *   provider.processPayment(plan, user, callbacks)
 *   provider.getPrices()
 *   provider.mode
 *   provider.isTestMode()
 *
 * The factory is the single place to swap payment backends. It is intentionally
 *
 */
import { processPayment, getPaymentMode, isTestMode } from "../PaymentEngine.js";

export class PaymentProvider {
  constructor() {
    this.mode = getPaymentMode();
  }

  async processPayment(plan, user, callbacks) {
    return processPayment(plan, user, callbacks);
  }

  async getPrices() {
    // Localized/local prices — no external host required.
    return {
      monthly: { id: "monthly", name: "Monthly Subscription", priceUSD: "2.99" },
      annual: { id: "annual", name: "Annual Subscription", priceUSD: "39.99" },
    };
  }

  isTestMode() {
    return isTestMode();
  }
}

export const PaymentFactory = {
  providers: new Map(),
  getProvider(name = "default") {
    if (!this.providers.has(name)) {
      this.providers.set(name, new PaymentProvider());
    }
    return this.providers.get(name);
  },
  async getPrices() {
    const provider = this.getProvider();
    return provider.getPrices();
  },
  mode: getPaymentMode(),
  isTestMode,
};

export default PaymentFactory;