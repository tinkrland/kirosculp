// compact currency switcher for the header.
//
// click the chip → opens a popover with every supported currency. the
// chosen code is saved to localStorage and broadcast through
// currency context so every price on the page updates immediately.

import { useState, useRef, useEffect } from "react";
import { useCurrency } from "@/lib/CurrencyContext";
import { CURRENCIES } from "@/lib/currency";
import { Check } from "lucide-react";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 px-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/60 hover:bg-secondary text-[11px] tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        aria-label="change display currency"
      >
        {currency}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 z-50 rounded-2xl border border-border/60 bg-card shadow-paper py-1.5">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[12px] tracking-wide text-foreground hover:bg-secondary/60 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground/60 w-7 text-left">{c.code}</span>
                <span className="text-muted-foreground/70 lowercase">{c.label}</span>
              </span>
              {currency === c.code && <Check className="w-3 h-3 text-foreground" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
