// commissions-muted nav item + placeholder page.
//
// drop-in for MarketSidebar.jsx (both repos). renders the tab as visibly
// present but disabled, with a "coming soon" marker, instead of either
// hiding the feature or half-wiring it before escrow exists.
//
// why this exists instead of just leaving commission settings as they are:
// commission REQUESTS already work today (CommissionRequestForm inserts
// into commission_requests with no login gate and no escrow). that's fine
// for collecting interest, but it's not the real commissioning flow the
// product actually promises (buyer login required, on-platform chat,
// escrow before the artist starts work). this shell marks that gap
// honestly in the ui rather than shipping it half-real.
//
// wire-up: replace the existing "commissions" entry (if creator settings
// already link to SettingsCommissions) with this, OR add it as a new
// top-level nav item pointing at buyer-facing commissioning specifically.
// SettingsCommissions.jsx (the creator's own commission terms/toggle)
// is unaffected — creators can still configure their terms. this shell
// is about the buyer-facing "commission this artist" flow requiring
// escrow, which isn't built yet.

import { Lock, Sparkles } from "lucide-react";

export function CommissionsMutedNavItem() {
  return (
    <div
      aria-disabled="true"
      title="commissions with escrow — coming soon"
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] tracking-wide lowercase
                 text-muted-foreground/40 cursor-not-allowed select-none"
    >
      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="flex-1">commissions</span>
      <span className="text-[9px] tracking-wider px-1.5 py-0.5 rounded-full border border-border/40">
        soon
      </span>
    </div>
  );
}

// full-page placeholder if a buyer/commissioner reaches a commissioning
// route directly (e.g. /shop/:username/commission) before this ships.
// keep this honest and specific, not a generic "coming soon" wall — it
// should say what's actually missing, since CommissionPage/CommissionRequestForm
// already exist and work as an intake form today.
export function CommissionsMutedPlaceholder({ creatorHandle }) {
  return (
    <div className="px-6 py-20 text-center max-w-lg mx-auto space-y-4">
      <Lock className="w-6 h-6 mx-auto text-muted-foreground/40" />
      <p className="text-2xl font-light tracking-wide text-muted-foreground/70">
        commissions are almost here
      </p>
      <p className="text-sm text-muted-foreground/60 tracking-wide leading-relaxed">
        {creatorHandle ? `requesting a commission from ${creatorHandle}` : "commissioning an artist"} needs
        a few things sculptura hasn't built yet: a required buyer login, on-platform chat with the
        creator, and an escrow hold so payment only releases once you approve the work. we're not
        shipping a half version of that — so this stays off until it's real.
      </p>
      <p className="text-xs text-muted-foreground/40 tracking-wide">
        in the meantime, browse this creator's ready-to-buy listings instead.
      </p>
    </div>
  );
}
