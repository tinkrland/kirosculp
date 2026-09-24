// place-order
//
// canonical order creation. the client sends a list of {artifact_id,
// material, quantity} plus customer/shipping info. we look up each
// artifact server-side, snapshot its price/manufacturing/earnings for
// the requested material, and insert one orders row per item with
// user_id derived from the caller's jwt. this stops the client from
// inventing prices.
//
// security notes:
//   - verify_jwt = false because we read the auth header ourselves so
//     the function can return clean json errors instead of a 401 wall
//   - we use the service role only for the artifacts read; order
//     inserts are done with the user's anon-key client so the rls
//     policy "user_id = auth.uid()" is enforced

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // user-scoped client: respects rls, used for the order inserts.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    // service-role client: used for the trusted artifact lookup so
    // pricing isn't snapshotted from a draft / unpublished record.
    const serviceClient = createClient(supabaseUrl, serviceKey);

    // optional auth: guests may also place orders. when a jwt is present
    // we attach user_id so the order shows up in their buyer dashboard.
    let userId: string | null = null;
    if (jwt) {
      const { data: userData } = await userClient.auth.getUser(jwt);
      if (userData?.user) userId = userData.user.id;
    }

    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const customer = body?.customer || {};
    const shippingAddress = String(body?.shipping_address || "");
    const notes = String(body?.notes || "");

    if (!items.length) return json({ error: "cart is empty" }, 400);
    if (!customer.email || !customer.name) return json({ error: "missing customer info" }, 400);
    if (!shippingAddress) return json({ error: "missing shipping address" }, 400);

    const couponCode = String(body?.coupon_code || "").trim().toUpperCase();
    const ids = [...new Set(items.map((i: any) => String(i.artifact_id)))];
    const { data: artifacts, error: aerr } = await serviceClient
      .from("artifacts")
      .select("id,name,image_url,creator_handle,prices,manufacturing_costs,creator_earnings,size_surcharges,sizes,size_type,status")
      .in("id", ids);
    if (aerr) return json({ error: aerr.message }, 500);

    const byId = new Map<string, any>((artifacts || []).map((a) => [a.id, a]));

    // resolve coupon discount per creator handle (coupons live on the
    // creator's market_account row).
    const handles = [...new Set((artifacts || []).map((a: any) => a.creator_handle).filter(Boolean))];
    const discountByHandle = new Map<string, number>();
    if (couponCode && handles.length) {
      const { data: accounts } = await serviceClient
        .from("market_accounts")
        .select("handle, coupons")
        .in("handle", handles);
      for (const acc of accounts || []) {
        const match = (acc.coupons || []).find((c: any) =>
          String(c.code || "").toUpperCase() === couponCode &&
          c.active &&
          (!c.expires || new Date(c.expires) >= new Date())
        );
        if (match) discountByHandle.set(acc.handle, Number(match.discount_pct) || 0);
      }
    }

    const rows: any[] = [];
    for (const item of items) {
      const a = byId.get(String(item.artifact_id));
      if (!a) return json({ error: `unknown artifact ${item.artifact_id}` }, 400);
      if (a.status !== "published") return json({ error: `artifact ${a.name} is not available` }, 400);
      const material = String(item.material || "");
      const size = item.size ? String(item.size) : null;
      const qty = Math.max(1, Math.min(10, Number(item.quantity || 1)));
      // validate size against the artifact's offered sizes when applicable
      const offeredSizes: string[] = Array.isArray(a.sizes) ? a.sizes : [];
      if (offeredSizes.length > 1 && (!size || !offeredSizes.includes(size))) {
        return json({ error: `pick a size for ${a.name}` }, 400);
      }
      const baseUnitPrice = Number((a.prices || {})[material] || 0);
      const sizeSurcharge = size ? Number((a.size_surcharges || {})[size] || 0) : 0;
      const discountPct = discountByHandle.get(a.creator_handle) || 0;
      const unitPrice = (baseUnitPrice + sizeSurcharge) * (1 - discountPct / 100);
      const unitMfg = Number((a.manufacturing_costs || {})[material] || 0);
      const unitEarn = Number((a.creator_earnings || {})[material] || 0);

      rows.push({
        user_id: userId,
        artifact_id: a.id,
        artifact_name: a.name,
        artifact_image_url: a.image_url || "",
        creator_handle: a.creator_handle,
        customer_email: String(customer.email),
        customer_name: String(customer.name),
        material,
        size,
        price: unitPrice * qty,
        manufacturing_cost: unitMfg * qty,
        creator_earnings: unitEarn * qty,
        shipping_address: shippingAddress,
        notes,
        status: "placed",
      });
    }

    const { data: inserted, error: ierr } = await userClient
      .from("orders")
      .insert(rows)
      .select();
    if (ierr) return json({ error: ierr.message }, 400);

    return json({ ok: true, orders: inserted });
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
