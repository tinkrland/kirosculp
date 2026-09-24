// store-update
//
// updates a market_accounts row only after re-verifying the caller's
// access key against the stored hash. the rls policy on the table is
// admin-only for updates, so all dashboard writes flow through here.
//
// the key is hashed using the same web-crypto sha256 as the client
// (lib/crypto.js) so the existing hashes keep working unchanged.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// fields a store owner is allowed to update via this function. anything
// not in this list is dropped silently to avoid status / hash tampering.
const ALLOWED = new Set([
  "display_name","bio","avatar_url","banner_url","logo_url",
  "store_heading","store_subheading","accent_color","accent_color_secondary","store_icon",
  "social_instagram","social_twitter","social_tiktok","social_youtube","social_website","social_discord","social_patreon",
  "tip_jar_enabled","tip_jar_label","tip_jar_url",
  "waitlist_enabled","waitlist_message",
  "coupons","order_message","faq_items",
  "materials","tools",
  "commission_open","hourly_rate","turnaround_time","rush_available",
  "pricing_margin_pct","pricing_currency","default_margin_pct",
  "newsletter_enabled","newsletter_label","newsletter_signups",
  "payout_method","payout_details","payout_legal_name",
  "commission_terms","commission_allow_commercial","commission_allow_resell",
  "commission_allow_modifications","commission_min_budget",
  "commission_intake_questions","commission_intro",
  "insights_time_spent","insights_tool_costs",
  // public username — uniqueness + format validated below
  "handle",
  // status: only allowed transition is draft -> pending_review
  "status",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { id, handle, key, patch } = await req.json();
    if (!id || !handle || !key || !patch) return json({ error: "missing fields" }, 400);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: account, error } = await serviceClient
      .from("market_accounts")
      .select("id,handle,access_key_hash,status")
      .eq("id", id)
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (!account || account.handle !== handle) return json({ error: "account not found" }, 404);

    const expected = await sha256Hex(key);
    if (expected !== account.access_key_hash) return json({ error: "invalid access key" }, 403);

    // build the safe patch
    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (!ALLOWED.has(k)) continue;
      if (k === "status") {
        if (v === "pending_review" && account.status === "draft") safe.status = "pending_review";
        continue;
      }
      if (k === "handle") {
        const next = String(v || "").toLowerCase().trim();
        if (!/^[a-z0-9]{4,}$/.test(next)) {
          return json({ error: "username must be 4+ lowercase letters or numbers" }, 400);
        }
        if (next !== account.handle) {
          const { data: clash } = await serviceClient
            .from("market_accounts")
            .select("id")
            .ilike("handle", next)
            .neq("id", account.id)
            .maybeSingle();
          if (clash) return json({ error: "username already taken" }, 409);
        }
        safe.handle = next;
        continue;
      }
      safe[k] = v;
    }

    if (Object.keys(safe).length === 0) return json({ error: "no allowed fields to update" }, 400);

    const { data: updated, error: uerr } = await serviceClient
      .from("market_accounts")
      .update(safe)
      .eq("id", id)
      .select()
      .single();
    if (uerr) return json({ error: uerr.message }, 400);

    return json({ ok: true, account: updated });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
