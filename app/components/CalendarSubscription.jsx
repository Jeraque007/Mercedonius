import { useState, useEffect } from "react";

export default function CalendarSubscription() {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://mercedonius.sae963.com";
  const icsUrl = `${origin}/mercedonius.ics`;
  const webcalUrl = icsUrl.replace(/^https:\/\//, "webcal://");
  const googleUrl =
    "https://calendar.google.com/calendar/r?cid=" +
    encodeURIComponent("webcal://" + origin.replace(/^https:\/\//, "") + "/mercedonius.ics");

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const copyLink = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(icsUrl).then(() => setCopied(true));
  };

  return (
    <div style={{ margin: "1rem 0", width: "100%" }}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full py-4 px-5 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] font-cinzel text-xs tracking-widest uppercase hover:bg-[#D4AF37]/20 transition-all"
        style={{ fontSize: "12px", letterSpacing: "0.15em" }}
      >
        {expanded ? "▾  Hide calendar subscription" : "▸  Subscribe to Calendar"}
      </button>

      {expanded && (
        <div className="mt-3 p-5 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10" style={{ marginTop: "0.75rem" }}>
          <p className="font-cinzel text-[10px] tracking-[0.15em] uppercase mb-3" style={{ color: "#D4AF37" }}>
            Add Mercedonius to your calendar
          </p>

          <div className="mb-3 p-3 rounded-lg border border-white/5 bg-white/4">
            <p className="font-cinzel text-sm text-white mb-1">Add to Google Calendar</p>
            <p className="font-cormorant text-xs text-white/60 mb-2">Opens Google Calendar in a new tab.</p>
            <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full py-3 px-4 rounded border border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] font-cinzel text-[11px] tracking-widest uppercase text-center hover:bg-[#D4AF37]/20 transition-all" style={{ fontSize: "11px", letterSpacing: "0.1em" }}>
              Open in Google Calendar
            </a>
          </div>

          <div className="mb-3 p-3 rounded-lg border border-white/5 bg-white/4">
            <p className="font-cinzel text-sm text-white mb-1">Apple Calendar / Outlook (Mac)</p>
            <p className="font-cormorant text-xs text-white/60 mb-2">Click to subscribe in Apple Calendar or Classic Outlook.</p>
            <a href={webcalUrl} className="inline-block w-full py-3 px-4 rounded border border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] font-cinzel text-[11px] tracking-widest uppercase text-center hover:bg-[#D4AF37]/20 transition-all" style={{ fontSize: "11px", letterSpacing: "0.1em" }}>
              Subscribe via webcal://
            </a>
          </div>

          <div className="mb-3 p-3 rounded-lg border border-white/5 bg-white/4">
            <p className="font-cinzel text-sm text-white mb-1">Copy subscription link</p>
            <p className="font-cormorant text-xs text-white/60 mb-2">For New Outlook, Cal.com or manual paste.</p>
            <button type="button" onClick={copyLink} className="w-full py-3 px-4 rounded border border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] font-cinzel text-[11px] tracking-widest uppercase text-center hover:bg-[#D4AF37]/20 transition-all" style={{ fontSize: "11px", letterSpacing: "0.1em" }}>
              {copied ? "Copied!" : "Copy https link"}
            </button>
            <p className="font-cormorant text-[10px] text-white/50 mt-2">{icsUrl}</p>
          </div>

          <div className="mt-4 p-3 rounded-lg border border-white/5 bg-white/8">
            <p className="font-cinzel text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: "#D4AF37" }}>
              Manual setup
            </p>
            <p className="font-cormorant text-[11px] text-white/70 leading-relaxed mb-1">
              <strong className="text-white">Google Calendar:</strong> Open Google Calendar → left sidebar
              "Other calendars" → "+" → "From URL" → paste the https link → Add.
            </p>
            <p className="font-cormorant text-[11px] text-white/70 leading-relaxed mb-1">
              <strong className="text-white">New Outlook:</strong> Calendar → "Add calendar" →
              "Subscribe from web" → paste the https link → Import.
            </p>
            <p className="font-cormorant text-[11px] text-white/70 leading-relaxed">
              <strong className="text-white">Apple Calendar:</strong> Calendar → File → "New Calendar
              Subscription" → paste the link → Subscribe.
            </p>
          </div>

          <div className="mt-3 p-3 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5">
            <p className="font-cormorant text-[10px] text-white/60 italic leading-relaxed">
              Sync may take several hours: Google Calendar can take up to 12 hours,
              Outlook Web over 24 hours, and Microsoft 365 cross-tenant about 3 hours
              after the first load. Changes are not real-time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
