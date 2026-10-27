// frontend/src/screens/payfast/PackageScreen.jsx
// Reusable PayFast package-selection screen.
// Drop into any project. Customize via props (packages, onSelect, appName, brandColor).
//
// Expected package shape:
//   { id, name, desc, price, type: "standard" | "sub" | "deeper", priceUSD? }

import { useState } from "react";
import SEO from "../../components/SEO.jsx";
import ScreenWrapper from "../../components/ScreenWrapper.jsx";
import GoldButton from "../../components/GoldButton.jsx";

export default function PackageScreen({
  packages = [],
  appName = "App",
  brandColor = "#D4AF37",
  onSelect,
  onContinue,
  disabledPackageIds = [],
  title = "Choose Your Package",
  subtitle = "Select the plan that fits your needs.",
}) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (pkg) => {
    setSelected(pkg);
    if (onSelect) onSelect(pkg);
  };

  const disabled = !selected || disabledPackageIds.includes(selected.id);

  return (
    <ScreenWrapper>
      <SEO
        title={`${title} | ${appName}`}
        description={subtitle}
        path="/packages"
      />
      <div className="flex flex-col min-h-screen px-6 py-10">
        <div className="animate-fade-in-up pt-10 mb-6 text-center">
          <p
            className="font-cinzel text-[10px] tracking-[0.4em] uppercase mb-3"
            style={{ color: brandColor, textShadow: `0 0 8px rgba(212,175,55,0.6)` }}
          >
            Plans & Pricing
          </p>
          <h2 className="font-cinzel text-2xl font-bold" style={{ textShadow: `0 0 12px ${brandColor}` }}>
            {title}
          </h2>
          <p className="font-cormorant text-base text-white/70 italic mt-2">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-3 w-full animate-fade-in-up delay-200">
          {packages.map((pkg) => {
            const isSelected = selected?.id === pkg.id;
            const isDisabled = disabledPackageIds.includes(pkg.id);
            return (
              <button
                key={pkg.id}
                onClick={() => !isDisabled && handleSelect(pkg)}
                disabled={isDisabled}
                className={[
                  "w-full py-4 px-5 rounded-xl text-left transition-all duration-300 border backdrop-blur-sm",
                  isDisabled
                    ? "opacity-30 grayscale cursor-not-allowed border-white/5"
                    : isSelected
                      ? `border-${brandColor.replace("#", "")} bg-white/10 shadow-[0_0_20px_rgba(212,175,55,0.3)]`
                      : "border-white/10 bg-white/4 hover:border-white/30 hover:bg-white/7",
                ].join(" ")}
              >
                <div className="flex justify-between items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel text-sm text-white leading-snug">{pkg.name}</p>
                    <p className="font-cormorant text-sm text-white italic mt-1">
                      {isDisabled ? "Unavailable" : pkg.desc}
                    </p>
                  </div>
                  <div
                    className="animate-glow-pulse"
                    style={{
                      border: `1.5px solid rgba(212,175,55,0.6)`,
                      borderRadius: "10px",
                      padding: "8px 14px",
                      background:
                        "linear-gradient(135deg, rgba(10,12,26,0.9), rgba(26,21,53,0.8))",
                      flexShrink: 0,
                      textAlign: "center",
                      minWidth: "72px",
                    }}
                  >
                    <span
                      className="font-cinzel font-bold"
                      style={{
                        fontSize: "clamp(0.75rem,2.5vw,0.85rem)",
                        color: "#f0d060",
                        letterSpacing: "0.03em",
                        textShadow: "0 0 8px rgba(212,175,55,0.5)",
                      }}
                    >
                      {pkg.price}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-8 pb-8 animate-fade-in-up delay-400 flex flex-col gap-3">
          <GoldButton
            onClick={onContinue}
            disabled={disabled || !onContinue}
          >
            {disabled ? "Select a package first" : "Continue to Payment"}
          </GoldButton>
        </div>
      </div>
    </ScreenWrapper>
  );
}
