/**
 * huaweiIap.js — Huawei HMS IAP integration stubs.
 * Provides graceful no-op implementations so the app builds and runs
 * without Huawei IAP configured. Replace with real HMS SDK calls when
 * Huawei IAP is enabled.
 */
export async function checkHmsReady() {
  return false;
}

export async function redeliverPurchases() {
  return { paid: false, sub: false };
}

export async function consumeOrphanedPurchases() {
  return;
}

export default {
  checkHmsReady,
  redeliverPurchases,
  consumeOrphanedPurchases,
};