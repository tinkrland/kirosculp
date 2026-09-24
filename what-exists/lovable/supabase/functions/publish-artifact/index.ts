// publish-artifact
//
// creates an artifact on behalf of a verified store. stores authenticate
// via access key (not supabase auth), so the artifacts rls policy that
// requires `created_by = auth.uid()` would block direct inserts. this
// function verifies the store's access key against the stored hash and
// then inserts the row using the service role.

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

// only these fields can be set by the client. status is forced to
// pending_review server-side so a creator cannot self-publish.
const ALLOWED = new Set([
  "name","description","category","artifact_type","specs",
  "dimensions","weight_grams",
  "image_url","image_urls","model_url",
  "made_to_order","region",
  "materials","manufacturing_costs","creator_earnings","prices",
  "size_type","sizes","size_surcharges",
  "slug","seo_title","seo_description","keywords","tags",
  "collection_id",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { handle, key, payload } = await req.json();
    if (!handle || !key || !payload) return json({ error: "missing fields" }, 400);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: account, error: aerr } = await serviceClient
      .from("market_accounts")
      .select("id,handle,access_key_hash,status")
      .eq("handle", handle)
      .maybeSingle();
    if (aerr) return json({ error: aerr.message }, 500);
    if (!account) return json({ error: "store not found" }, 404);

    const expected = await sha256Hex(key);
    if (expected !== account.access_key_hash) return json({ error: "invalid access key" }, 403);

    // build a safe row from the payload
    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(payload)) {
      if (ALLOWED.has(k)) safe[k] = v;
    }
    if (!safe.name) return json({ error: "name required" }, 400);

    safe.creator_handle = account.handle;
    safe.status = "pending_review";
    safe.admin_reviewed = false;

    const { data: inserted, error: ierr } = await serviceClient
      .from("artifacts")
      .insert(safe)
      .select()
      .single();
    if (ierr) return json({ error: ierr.message }, 400);

    return json({ ok: true, artifact: inserted });
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
