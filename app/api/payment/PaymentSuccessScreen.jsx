// frontend/src/screens/payfast/PaymentSuccessScreen.jsx
// Reusable PayFast success screen.
// Shown after PayFast returns ?paid=1 (pending server ITN fulfillment).
// Customize via props (appName, brandColor, onContinue, message, orderId).

import SEO from "../../components/SEO.jsx";
import ScreenWrapper from "../../components/ScreenWrapper.jsx";
import GoldButton from "../../components/GoldButton.jsx";

export default function PaymentSuccessScreen({
  appName = "App",
  brandColor = "#D4AF37",
  orderId,
  message = "Your payment was successful.",
  subMessage = "Your access is now active. Thank you for your purchase.",
  btnLabel = "Continue",
  onContinue,
}) {
  const handleContinue = () => {
    if (onContinue) onContinue();
    else window.location.href = "/";
  };

  return (
    <ScreenWrapper>
      <SEO
        title="Payment Successful"
        description={message}
        path="/payment-success"
        noindex={true}
      />
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="glass-gold rounded-2xl p-10 max-w-md w-full animate-fade-in-up">
          <div style={{ fontSize: "3rem", marginBottom: "16px", color: brandColor }}>
            &#10003;
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
            Payment Successful
          </h1>
          {orderId && (
            <p className="font-cormorant text-sm text-white/60 mb-4">
              Order ID: {orderId}
            </p>
          )}
          <p className="font-cormorant text-lg text-white/80 italic leading-relaxed mb-6">
            {message}
          </p>
          <p className="font-cormorant text-base text-white/60 italic mb-8">
            {subMessage}
          </p>
          <GoldButton onClick={handleContinue}>{btnLabel}</GoldButton>
        </div>
      </div>
    </ScreenWrapper>
  );
}
