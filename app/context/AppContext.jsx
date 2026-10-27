'use client';

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * AppContext — Mercedonius own navigation & payment-state shell.
 *
 * Provides `goTo` (client-side navigation) and the payment/UI state that the
 * package & payment screens depend on. Values are persisted to localStorage so
 * a payment round-trip (including a local/simulated one) survives a reload.
 *
 * This is an intentionally thin, self-owned shell.
 * It only owns *where* to navigate and *what* payment state looks like locally.
 */
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const router = useRouter();

  const [screen, setScreen] = useState(() => {
    try { return localStorage.getItem("tl_screen") || "welcome"; } catch (e) { return "welcome"; }
  });
  const [previousScreen, setPreviousScreen] = useState(null);

  // Payment / subscription state
  const [isPaid, setIsPaidState] = useState(() => {
    try { return localStorage.getItem("tl_is_paid") === "true"; } catch (e) { return false; }
  });
  const [deeperPaid, setDeeperPaidState] = useState(() => {
    try { return localStorage.getItem("tl_deeper_paid") === "true"; } catch (e) { return false; }
  });
  const [user, setUserState] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tl_user") || "null"); } catch (e) { return null; }
  });
  const [selectedPackage, setSelectedPackageState] = useState(null);
  const setSelectedPackage = setSelectedPackageState;
  const [paymentPending, setPaymentPendingState] = useState(null);
  const [drawnCards, setDrawnCardsState] = useState([]);
  const [immutableReadings, setImmutableReadingsState] = useState([]);
  const [currencyData, setCurrencyDataState] = useState({ symbol: "$", rate: 1, code: "USD", country: "US" });
  const [drawHistory, setDrawHistoryState] = useState(null);

  // Persist to localStorage whenever state changes
  useEffect(() => { try { localStorage.setItem("tl_screen", screen); } catch (e) {} }, [screen]);
  useEffect(() => { try { localStorage.setItem("tl_is_paid", String(isPaid)); } catch (e) {} }, [isPaid]);
  useEffect(() => { try { localStorage.setItem("tl_deeper_paid", String(deeperPaid)); } catch (e) {} }, [deeperPaid]);
  useEffect(() => { try { localStorage.setItem("tl_user", JSON.stringify(user)); } catch (e) {} }, [user]);

  const goTo = useCallback((to) => {
    setPreviousScreen(screen);
    setScreen(to);
    try {
      if (typeof router.push === "function") {
        const map = {
          packages: "/packages",
          payment: "/payment",
          "payment/success": "/payment/success",
          "payment/cancel": "/payment/cancel",
          reveal: "/calendar",
          calendar: "/calendar",
          welcome: "/calendar",
        };
        const target = map[to] || to;
        router.push(target);
      }
    } catch (e) {
      console.warn("[AppContext] goTo failed:", e && e.message ? e.message : e);
    }
  }, [router, screen]);

  const setIsPaid = useCallback((v) => { setIsPaidState(Boolean(v)); }, []);
  const setDeeperPaid = useCallback((v) => { setDeeperPaidState(Boolean(v)); }, []);
  const setUser = useCallback((v) => setUserState(v), []);
  const setPaymentPending = useCallback((v) => setPaymentPendingState(v), []);
  const setDrawnCards = useCallback((v) => setDrawnCardsState(Array.isArray(v) ? v : []), []);
  const setImmutableReadings = useCallback((v) => setImmutableReadingsState(Array.isArray(v) ? v : []), []);
  const setCurrencyData = useCallback((v) => setCurrencyDataState(v || {}), []);
  const setDrawHistory = useCallback((v) => setDrawHistoryState(v), []);

  const value = {
    goTo,
    previousScreen,
    setPreviousScreen,
    screen,
    setScreen,
    isPaid,
    setIsPaid,
    deeperPaid,
    setDeeperPaid,
    user,
    setUser,
    selectedPackage,
    setSelectedPackage,
    paymentPending,
    setPaymentPending,
    drawnCards,
    setDrawnCards,
    immutableReadings,
    setImmutableReadings,
    currencyData,
    setCurrencyData,
    drawHistory,
    setDrawHistory,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    // Defensive fallback so components that import useApp do not crash if the
    // provider is missing. goTo is a no-op that logs a clear question instead
    // of silently failing.
    const noopGoTo = (to) => {
      console.warn(
        "[AppContext] useApp() used without an <AppProvider>. `goTo(\"%s\")` " +
        "cannot navigate. Wrap the app in <AppProvider> (typically in app/layout.tsx).",
        to
      );
    };
    return {
      goTo: noopGoTo,
      previousScreen: null,
      screen: null,
      isPaid: false,
      setIsPaid: (_v) => {},
      deeperPaid: false,
      setDeeperPaid: (_v) => {},
      user: null,
      setUser: (_v) => {},
      selectedPackage: null,
      setSelectedPackage: (_v) => {},
      paymentPending: null,
      setPaymentPending: (_v) => {},
      drawnCards: [],
      setDrawnCards: (_v) => {},
      immutableReadings: [],
      setImmutableReadings: (_v) => {},
      currencyData: { symbol: "$", rate: 1, code: "USD", country: "US" },
      setCurrencyData: (_v) => {},
      drawHistory: null,
      setDrawHistory: (_v) => {},
    };
  }
  return ctx;
};

export default AppContext;