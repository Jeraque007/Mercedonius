// frontend/src/screens/payfast/PaymentScreen.jsx
// Reusable PayFast payment screen.
// Shows the selected package and triggers the PayFast redirect (sandbox or live).
//
// Requires a `processPayment(pkg, user, callbacks)` function that calls
// /api/payfast/initiate and submits the hidden POST form to PayFast.

import { useState } from "react";
import SEO from "../../components/SEO.jsx";
import ScreenWrapper from "../../components/ScreenWrapper.jsx";
import GoldButton from "../../components/GoldButton.jsx";

export default function PaymentScreen({
  appName = "App",
  brandColor = "#D4AF37",
  selectedPackage,
  user,
  processPayment,
  onSuccess,
  onError,
  title = "Secure Payment",
  tag = "Secure Checkout",
  awaitText = "Awaiting Payment",
  awaitBody = "You will be redirected to complete your purchase securely.",
  btnText = "Pay Now",
  processingText = "Processing…",
  backLabel = "Change Selection",
  onBack,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (!selectedPackage) return;
    setLoading(true);
    setError("");
    try {
      await processPayment(selectedPackage, user, {
        onSuccess: () => {
          setLoading(false);
          if (onSuccess) onSuccess();
        },
        onError: (msg) => {
          setError(msg);
          setLoading(false);
        },
      });
    } catch (err) {
      setError(err.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <SEO
        title={`${title} | ${appName}`}
        description="Complete your purchase securely."
        path="/payment"
        noindex={true}
      />
      <div className="flex flex-col min-h-screen px-6 pb-10">
        <div
          className="animate-fade-in-up mb-6 text-center"
          style={{ paddingTop: "64px" }}
        >
          <p
            className="font-cinzel text-[10px] tracking-[0.4em] uppercase mb-3"
            style={{ color: brandColor }}
          >
            {tag}
          </p>
          <h2
            className="font-cinzel text-2xl font-bold"
            style={{
              background: `linear-gradient(135deg,#f0d060,${brandColor},#8a7020)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {title}
          </h2>
        </div>

        <div className="flex flex-col gap-4 animate-fade-in-up delay-200">
          {selectedPackage && (
            <div className="glass-gold rounded-2xl p-5">
              <p
                className="font-cinzel text-[10px] tracking-[0.2em] uppercase mb-3"
                style={{ color: brandColor }}
              >
                Selected Package
              </p>
              <div className="flex justify-between items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-cinzel text-sm text-white">{selectedPackage.name}</p>
                  <p
                    className="font-cormorant text-sm italic mt-0.5"
                    style={{ color: "rgba(240,232,216,0.55)" }}
                  >
                    {selectedPackage.desc}
                  </p>
                </div>
                <div
                  className="animate-glow-pulse"
                  style={{
                    border: `1.5px solid rgba(212,175,55,0.6)`,
                    borderRadius: "10px",
                    padding: "10px 16px",
                    background:
                      "linear-gradient(135deg,rgba(10,12,26,0.9),rgba(26,21,53,0.8))",
                    flexShrink: 0,
                    textAlign: "center",
                    minWidth: "80px",
                  }}
                >
                  <span
                    className="font-cinzel font-bold"
                    style={{
                      fontSize: "1rem",
                      color: "#f0d060",
                      letterSpacing: "0.03em",
                      textShadow: "0 0 8px rgba(212,175,55,0.5)",
                    }}
                  >
                    {selectedPackage.price}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="glass-gold rounded-2xl p-5 text-center">
            <p
              className="font-cinzel text-xs mb-2"
              style={{ color: brandColor, letterSpacing: "0.15em" }}
            >
              {awaitText}
            </p>
            <p className="font-cormorant text-base italic leading-relaxed" style={{ color: "rgba(240,232,216,0.6)" }}>
              {awaitBody}
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-center font-cormorant text-sm px-4">
              {error}
            </p>
          )}
        </div>

        <div className="mt-auto pt-8 pb-8 flex flex-col gap-3 animate-fade-in-up delay-400">
          <GoldButton
            onClick={handlePay}
            disabled={loading || !selectedPackage}
          >
            {loading ? processingText : btnText}
          </GoldButton>

          {/* Security trust badge */}
          <div
            className="w-full py-4 px-5 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={brandColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span
                className="font-cinzel text-[11px] tracking-[0.15em]"
                style={{ color: brandColor, fontWeight: "bold", textTransform: "uppercase" }}
              >
                Secure Payment
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={brandColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <p className="font-cormorant text-sm text-white/70 italic">
              Protected by PayFast
            </p>
            <p className="font-cinzel text-[9px] tracking-[0.2em] text-white/40 mt-1 uppercase">
              PCI-DSS Compliant &bull; 256-bit SSL Encryption
            </p>
          </div>

          <button
            onClick={onBack}
            className="w-full py-4 rounded-xl border border-white/10 text-white/70 font-cinzel text-xs tracking-widest hover:border-white/20 transition-all"
          >
            {backLabel}
          </button>
        </div>
      </div>
    </ScreenWrapper>
  );
}
