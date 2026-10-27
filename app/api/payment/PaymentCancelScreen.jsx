// frontend/src/screens/payfast/PaymentCancelScreen.jsx
// Reusable PayFast cancel screen.
// Shown after PayFast returns ?cancelled=1.
// Customize via props (appName, brandColor, onRetry, message).

import SEO from "../../components/SEO.jsx";
import ScreenWrapper from "../../components/ScreenWrapper.jsx";
import GoldButton from "../../components/GoldButton.jsx";

export default function PaymentCancelScreen({
  appName = "App",
  brandColor = "#D4AF37",
  message = "Your transaction was cancelled.",
  subMessage = "No charges were made. You may try again at any time.",
  btnLabel = "Return to App",
  onRetry,
}) {
  const handleRetry = () => {
    if (onRetry) onRetry();
    else window.location.href = "/";
  };

  return (
    <ScreenWrapper>
      <SEO
        title="Payment Cancelled"
        description={message}
        path="/payment-cancelled"
        noindex={true}
      />
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="glass-gold rounded-2xl p-10 max-w-md w-full animate-fade-in-up">
          <div style={{ fontSize: "3rem", marginBottom: "16px", color: "#ef4444" }}>
            &#10007;
          </div>
          <h1
            className="font-cinzel text-2xl font-bold mb-4"
            style={{
              background: `linear-gradient(135deg,#f0d060,${brandColor},#8a7020)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Payment Cancelled
          </h1>
          <p className="font-cormorant text-lg text-white/80 italic leading-relaxed mb-2">
            {message}
          </p>
          <p className="font-cormorant text-base text-white/50 italic mb-6">
            {subMessage}
          </p>
          <GoldButton onClick={handleRetry}>{btnLabel}</GoldButton>
        </div>
      </div>
    </ScreenWrapper>
  );
}
