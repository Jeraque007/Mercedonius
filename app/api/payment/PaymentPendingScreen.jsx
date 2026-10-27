// frontend/src/screens/payfast/PaymentPendingScreen.jsx
// Reusable PayFast pending/polling screen.
// Shown while waiting for the server ITN to confirm payment status.
// Polls /api/payfast/status?email=... and transitions on result.

import { useEffect, useState } from "react";
import SEO from "../../components/SEO.jsx";
import ScreenWrapper from "../../components/ScreenWrapper.jsx";
import GoldButton from "../../components/GoldButton.jsx";
import { apiFetch } from "../../utils/apiBase.js";

export default function PaymentPendingScreen({
  appName = "App",
  brandColor = "#D4AF37",
  email,
  pollIntervalMs = 4000,
  maxPolls = 15,
  onPaid,
  onCancel,
  onError,
  title = "Processing Payment",
  message = "We are confirming your payment with PayFast…",
}) {
  const [status, setStatus] = useState("polling"); // polling | paid | cancelled | error
  const [polls, setPolls] = useState(0);

  useEffect(() => {
    if (!email || status !== "polling") return;

    const timer = setInterval(async () => {
      setPolls((p) => p + 1);
      try {
        const res = await apiFetch(`/api/payfast/status?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.isPaid) {
            setStatus("paid");
            if (onPaid) onPaid(data);
          } else if (polls >= maxPolls) {
            setStatus("error");
            if (onError) onError("Payment confirmation timed out.");
          }
        } else if (polls >= maxPolls) {
          setStatus("error");
          if (onError) onError("Unable to confirm payment status.");
        }
      } catch (e) {
        if (polls >= maxPolls) {
          setStatus("error");
          if (onError) onError("Status check failed.");
        }
      }
    }, pollIntervalMs);

    return () => clearInterval(timer);
  }, [email, status, polls, maxPolls, onPaid, onCancel, onError]);

  const handleCancel = () => {
    setStatus("cancelled");
    if (onCancel) onCancel();
  };

  const spinning = (
    <div
      className="w-12 h-12 border-4 border-white/20 border-t-[#D4AF37] rounded-full mx-auto mb-6"
      style={{ animation: "spin 1s linear infinite" }}
    />
  );

  return (
    <ScreenWrapper>
      <SEO title="Processing Payment" description={message} path="/payment-pending" noindex={true} />
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="glass-gold rounded-2xl p-10 max-w-md w-full animate-fade-in-up">
          {status === "polling" && spinning}
          {status === "paid" && (
            <div style={{ fontSize: "3rem", marginBottom: "16px", color: brandColor }}>
              &#10003;
            </div>
          )}
          {status === "cancelled" && (
            <div style={{ fontSize: "3rem", marginBottom: "16px", color: "#ef4444" }}>
              &#10007;
            </div>
          )}
          {status === "error" && (
            <div style={{ fontSize: "3rem", marginBottom: "16px", color: "#ef4444" }}>
              &#x26A0;
            </div>
          )}

          <h2
            className="font-cinzel text-xl font-bold mb-4"
            style={{
              background: `linear-gradient(135deg,#f0d060,${brandColor},#8a7020)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {status === "polling" ? title : status === "paid" ? "Payment Confirmed" : status === "cancelled" ? "Payment Not Confirmed" : "Unable to Confirm"}
          </h2>
          <p className="font-cormorant text-base text-white/80 italic leading-relaxed mb-6">
            {status === "polling" ? message : status === "paid" ? "Your payment has been confirmed by PayFast." : status === "cancelled" ? "We did not receive payment confirmation. No charges were made." : "Please try again or contact support."}
          </p>

          {status === "polling" && (
            <button
              onClick={handleCancel}
              className="w-full py-4 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37]/70 font-cinzel text-xs tracking-widest uppercase hover:bg-[#D4AF37]/5 transition-all"
            >
              Cancel
            </button>
          )}
          {(status === "paid" || status === "cancelled" || status === "error") && (
            <GoldButton
              onClick={() => (status === "paid" ? window.location.href = "/success" : window.location.href = "/")}
              disabled={status === "polling"}
            >
              {status === "paid" ? "Continue" : status === "cancelled" ? "Try Again" : "Retry"}
            </GoldButton>
          )}
        </div>
      </div>
    </ScreenWrapper>
  );
}
