// promo code badge strip
//
// shows the creator's active promo codes on their storefront so visitors
// know what to enter at checkout. inactive or expired codes are hidden.

import { Tag } from 'lucide-react';
import { toast } from 'sonner';

function isActive(coupon) {
  if (!coupon?.active) return false;
  if (coupon.expires) {
    const exp = new Date(coupon.expires);
    if (!Number.isNaN(exp.getTime()) && exp < new Date()) return false;
  }
  return !!coupon.code;
}

export default function ShopPromoCodes({ coupons }) {
  const list = (coupons || []).filter(isActive);
  if (list.length === 0) return null;

  return (
    <div className="bg-card rounded-[18px] border border-border/50 p-5 space-y-3">
      <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">active promos</p>
      <div className="flex flex-wrap gap-2">
        {list.map((c, i) => (
          <button
            key={`${c.code}-${i}`}
            onClick={() => {
              navigator.clipboard?.writeText(c.code).then(
                () => toast.success(`copied ${c.code}`),
                () => toast.error('could not copy'),
              );
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-dashed border-border/60 hover:border-foreground/40 transition-colors group"
            title="click to copy"
          >
            <Tag className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-xs font-mono uppercase tracking-widest text-foreground">{c.code}</span>
            <span className="text-[10px] tracking-wider text-muted-foreground/60">−{c.discount_pct}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}
