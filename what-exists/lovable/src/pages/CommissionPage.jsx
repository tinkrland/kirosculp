// public commission page for a creator.
//
// route: /shop/:username/commission
// pulls the creator's commission settings from market_accounts (or
// creator_profiles when no market account exists), shows their terms +
// intro, and renders the adaptive request form below. demo creator
// handles read from demoData; everyone else loads from the database.

import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { ArrowLeft, Clock, Zap, DollarSign } from "lucide-react";
import { DEMO_STORES } from "@/lib/demoData";
import { getDemoStoreOverrides } from "@/lib/demoSandbox";
import CommissionRequestForm from "@/components/commissions/CommissionRequestForm";
import SeoTags from "@/components/seo/SeoTags";
import { saveDemoCommissionRequest } from "@/lib/demoSandbox";

export default function CommissionPage() {
  const { username } = useParams();

  const demoStore = DEMO_STORES.find((s) => s.handle === username);
  const demoOverrides = demoStore ? getDemoStoreOverrides(username) : null;

  const { data: marketAccount } = useQuery({
    queryKey: ["commission-account", username],
    queryFn: () => db.entities.MarketAccount.filter({ handle: username }).then((r) => r?.[0] ?? null),
    enabled: !!username && !demoStore,
  });

  const { data: creatorProfile } = useQuery({
    queryKey: ["commission-profile", username],
    queryFn: () => db.entities.CreatorProfile.filter({ username }).then((r) => r?.[0] ?? null),
    enabled: !!username && !demoStore && !marketAccount,
  });

  // build a unified creator object regardless of source
  const creator = demoStore
    ? {
        handle: demoStore.handle,
        display_name: demoStore.display_name,
        commission_open: true,
        commission_intro: "this is a demo creator. requests are stored locally for preview only.",
        commission_allow_commercial: true,
        commission_allow_resell: false,
        commission_allow_modifications: true,
        commission_min_budget: 250,
        commission_terms: "50% deposit to begin work. one round of revisions included.",
        commission_intake_questions: [
          { id: "q1", label: "preferred material?", required: true },
          { id: "q2", label: "approximate dimensions?", required: false },
        ],
        hourly_rate: demoStore.hourly_rate,
        turnaround_time: demoStore.turnaround_time,
        rush_available: demoStore.rush_available,
        ...(demoOverrides || {}),
      }
    : marketAccount
    ? marketAccount
    : creatorProfile
    ? {
        handle: creatorProfile.username,
        display_name: creatorProfile.display_name,
        commission_open: creatorProfile.commission_open,
        hourly_rate: creatorProfile.hourly_rate,
        turnaround_time: creatorProfile.turnaround_time,
        rush_available: creatorProfile.rush_available,
        // creator_profiles doesn't yet store these - fall back to
        // sensible defaults so the form still renders meaningfully.
        commission_intro: "",
        commission_allow_commercial: false,
        commission_allow_resell: false,
        commission_allow_modifications: true,
        commission_intake_questions: [],
      }
    : null;

  if (!creator) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-2xl font-light tracking-wide text-muted-foreground/40 mb-4">creator not found</p>
        <Link to="/explore" className="text-sm tracking-wider text-muted-foreground hover:text-foreground">
          back to explore
        </Link>
      </div>
    );
  }

  if (!creator.commission_open) {
    return (
      <div className="px-6 py-20 text-center max-w-xl mx-auto">
        <p className="text-2xl font-light tracking-wide text-muted-foreground/60 mb-3">commissions are closed</p>
        <p className="text-sm text-muted-foreground/60 tracking-wide mb-8">
          {creator.display_name || creator.handle} isn't taking commissions right now.
        </p>
        <Link to={`/shop/${username}`} className="text-sm tracking-wider text-muted-foreground hover:text-foreground">
          back to their shop
        </Link>
      </div>
    );
  }

  // demo submissions go to localStorage instead of the live table
  const submitOverride = demoStore
    ? async (payload) => saveDemoCommissionRequest(username, payload)
    : null;

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <SeoTags
        title={`commission ${creator.display_name || creator.handle} on sculptura`}
        description={creator.commission_intro || `request a commission from ${creator.handle}`}
        canonical={`/shop/${creator.handle}/commission`}
      />

      <Link to={`/shop/${creator.handle || username}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 tracking-wide transition-colors">
        <ArrowLeft className="w-4 h-4" />
        back to shop
      </Link>

      <div className="space-y-2 mb-8">
        <p className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">commission</p>
        <h1 className="font-serif text-3xl font-light tracking-tight text-foreground lowercase">
          request custom work from {creator.display_name || creator.handle}
        </h1>
        {creator.commission_intro && (
          <p className="text-sm text-muted-foreground/80 tracking-wide leading-relaxed pt-2 whitespace-pre-line">
            {creator.commission_intro}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        {creator.hourly_rate && (
          <FactCard icon={DollarSign} label="hourly" value={`$${creator.hourly_rate}`} />
        )}
        {creator.turnaround_time && (
          <FactCard icon={Clock} label="turnaround" value={creator.turnaround_time} />
        )}
        {creator.rush_available && (
          <FactCard icon={Zap} label="rush" value="available" />
        )}
      </div>

      <CommissionRequestForm creator={creator} onSubmit={submitOverride} />
    </div>
  );
}

function FactCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-muted-foreground/60" />
      </div>
      <div>
        <p className="text-[10px] tracking-widest text-muted-foreground/50 uppercase">{label}</p>
        <p className="text-sm tracking-wide text-foreground">{value}</p>
      </div>
    </div>
  );
}
