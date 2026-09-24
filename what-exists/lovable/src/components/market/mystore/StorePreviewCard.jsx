// Live mini-preview of the store page using current account data
export default function StorePreviewCard({ account }) {
  if (!account) return null;

  const accent = account.accent_color || "#84A48B";
  const accent2 = account.accent_color_secondary || "#C1D8DF";

  return (
    <div className="sticky top-24">
      <p className="text-[10px] tracking-widest text-muted-foreground/40 uppercase mb-3">live preview</p>
      <div className="rounded-[20px] border border-border/50 overflow-hidden shadow-paper bg-card text-xs">
        {/* banner */}
        <div
          className="h-16 relative"
          style={{ background: `linear-gradient(135deg, ${accent}55, ${accent2}44)` }}
        >
          {account.banner_url && (
            <img src={account.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          )}
          {account.store_icon && (
            <div className="absolute bottom-2 left-3 text-2xl opacity-70">{account.store_icon}</div>
          )}
        </div>

        <div className="px-4 pb-4">
          {/* avatar */}
          <div className="-mt-5 mb-2">
            {account.avatar_url ? (
              <img src={account.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-card shadow-paper" />
            ) : (
              <div
                className="w-10 h-10 rounded-xl border-2 border-card shadow-paper flex items-center justify-center text-base font-wordmark text-white"
                style={{ background: accent }}
              >
                {(account.display_name || account.handle || "?")[0].toUpperCase()}
              </div>
            )}
          </div>

          <p className="font-medium tracking-wide text-foreground text-[11px] lowercase">
            {account.display_name || account.handle}
          </p>
          <p className="text-[10px] text-muted-foreground/40 tracking-wide mb-1">@{account.handle}</p>

          {account.store_heading && (
            <p className="text-[10px] text-muted-foreground/70 tracking-wide leading-relaxed mb-1 italic">
              "{account.store_heading}"
            </p>
          )}

          {account.bio && (
            <p className="text-[10px] text-muted-foreground/60 tracking-wide leading-relaxed mb-2 line-clamp-2">
              {account.bio}
            </p>
          )}

          {/* waitlist banner */}
          {account.waitlist_enabled && (
            <div
              className="rounded-[8px] px-2 py-1.5 mb-2 text-[9px] tracking-wide"
              style={{ background: `${accent}20`, color: accent }}
            >
              ⏳ {account.waitlist_message || "orders temporarily paused"}
            </div>
          )}

          {/* badges */}
          <div className="flex gap-1 flex-wrap mb-2">
            {account.commission_open && (
              <span className="px-2 py-0.5 rounded-full text-[9px] tracking-wide"
                style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
                commissions open
              </span>
            )}
            {account.tip_jar_enabled && (
              <span className="px-2 py-0.5 rounded-full text-[9px] tracking-wide bg-secondary border border-border/40 text-muted-foreground">
                {account.tip_jar_label || "tip jar"}
              </span>
            )}
          </div>

          {/* socials row */}
          <div className="flex gap-1.5 flex-wrap">
            {account.social_instagram && <SocialDot label="ig" />}
            {account.social_twitter && <SocialDot label="tw" />}
            {account.social_tiktok && <SocialDot label="tt" />}
            {account.social_youtube && <SocialDot label="yt" />}
            {account.social_discord && <SocialDot label="dc" />}
            {account.social_patreon && <SocialDot label="pt" />}
            {account.social_website && <SocialDot label="web" />}
          </div>
        </div>
      </div>

      <p className="text-[9px] tracking-wider text-muted-foreground/30 text-center mt-2">
        sculptura.shop/{account.handle}
      </p>
    </div>
  );
}

function SocialDot({ label }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[9px] tracking-wider bg-secondary border border-border/40 text-muted-foreground/50">
      {label}
    </span>
  );
}