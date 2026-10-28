/**
 * apiBase.js — lightweight fetch wrapper for Mercedonius API calls.
 * Provides `apiFetch` used by BillingContext and payment screens.
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  return res;
}

export default { apiFetch };