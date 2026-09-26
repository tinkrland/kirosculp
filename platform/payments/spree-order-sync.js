// spree-order-sync.js
//
// mirrors a completed spree storefront order into the supabase escrow
// ledger. spree owns the cart and the checkout; once it reports the order
// paid, the platform records the money movement the same way
// order-service.js does: an orders row, an escrow hold, the balanced
// capture entries, and the hold flipped to held.
//
// the charge itself happened inside spree (the check payment method
// simulates gateway capture in the prototype). so this module never
// captures anything; it only writes what spree already did, with
// gateway 'spree-check' and the spree payment number as the gateway ref.
//
// idempotency: the client_request_key is `spree:{order number}`. a replay
// (a cron catching the same order twice, a retry) returns the existing
// order and writes nothing.
//
// splits: spree knows the retail total only. the trusted pricing service
// decides the split later; optional splits passed here are recorded on
// the order row for the release path, they are not invented here.
//
// usage as a library:
//   import { makeSpreeSync } from './spree-order-sync.js';
//   const sync = makeSpreeSync({
//     supabaseUrl, serviceKey,
//     spreeBaseUrl: 'http://localhost:3000',   // or the sandbox proxy url
//     spreeApiKey: 'pk_...',                   // x-spree-api-key header
//   });
//   await sync.syncOrder({ orderPrefixId: 'ord_xxx', cartToken: 'tok' });
//
// usage as a cli:
//   SPREE_URL=... SPREE_API_KEY=... SPREE_TOKEN=... SPREE_ORDER=ord_xxx \
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=<service_role_jwt> \
//   node spree-order-sync.js

const first = (j) => (Array.isArray(j) ? j[0] : j);

const toCents = (decimalAmount) => Math.round(Number(decimalAmount) * 100);

export function makeSpreeSync({ supabaseUrl, serviceKey, spreeBaseUrl, spreeApiKey, spreeProxyAuth }) {
  if (!supabaseUrl || !serviceKey || !spreeBaseUrl || !spreeApiKey) {
    throw new Error('supabaseUrl, serviceKey, spreeBaseUrl, spreeApiKey are required');
  }

  async function supabaseReq(method, path, body, query = '') {
    const res = await fetch(`${supabaseUrl}/rest/v1/${path + query}`, {
      method,
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* raw */ }
    if (!res.ok) throw new Error(`${method} ${path}: ${first(json)?.message || text.slice(0, 200)}`);
    return json;
  }

  // fetch the order from the spree store api v3. the cart token from
  // checkout authorizes the guest read; orders are addressed by prefix id.
  async function fetchSpreeOrder({ orderPrefixId, cartToken }) {
    const headers = { 'x-spree-api-key': spreeApiKey, 'x-spree-token': cartToken };
    // when spree sits behind an authenticating proxy (the blaxel sandbox
    // port proxy), pass spreeProxyAuth to satisfy it, e.g. 'Bearer <token>'
    if (spreeProxyAuth) headers.Authorization = spreeProxyAuth;
    const res = await fetch(`${spreeBaseUrl}/api/v3/store/orders/${orderPrefixId}`, { headers });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(`spree order fetch failed (${res.status}): ${json?.error?.message || res.statusText}`);
    }
    return json;
  }

  function mirrorFromSpree(spreeOrder, splits = {}) {
    const payment = (spreeOrder.payments || []).find((p) => p.status === 'completed');
    const ship = spreeOrder.shipping_address || {};
    const address = [ship.address1, ship.address2, ship.city, ship.state_text, ship.postal_code, ship.country_iso]
      .filter(Boolean).join(', ');
    return {
      customerEmail: spreeOrder.email,
      customerName: ship.full_name || null,
      shippingAddress: address || null,
      artifactName: (spreeOrder.items || [])[0]?.name || 'spree order',
      retailCents: toCents(spreeOrder.total),
      currency: (spreeOrder.currency || 'usd').toLowerCase(),
      gatewayRef: payment?.number || spreeOrder.number,
    };
  }

  async function syncOrder({ orderPrefixId, cartToken, creatorHandle = 'unassigned', splits = {} }) {
    const spreeOrder = await fetchSpreeOrder({ orderPrefixId, cartToken });

    if (spreeOrder.payment_status !== 'paid') {
      throw new Error(`spree order ${spreeOrder.number} is not paid (status: ${spreeOrder.payment_status})`);
    }
    const completedPayment = (spreeOrder.payments || []).some((p) => p.status === 'completed');
    if (!completedPayment) {
      throw new Error(`spree order ${spreeOrder.number} has no completed payment`);
    }

    const m = mirrorFromSpree(spreeOrder);
    const manufacturingCents = Math.max(0, splits.manufacturingCents || 0);
    const creatorNetCents = Math.max(0, splits.creatorNetCents || 0);

    // idempotent: the spree order number is the natural key
    const clientRequestKey = `spree:${spreeOrder.number}`;
    const existing = await supabaseReq('GET', 'orders', undefined,
      `?client_request_key=eq.${encodeURIComponent(clientRequestKey)}&select=id,status,customer_email`);
    if (existing.length) return { order: existing[0], idempotentReplay: true };

    const order = first(await supabaseReq('POST', 'orders', {
      customer_email: m.customerEmail,
      customer_name: m.customerName,
      shipping_address: m.shippingAddress,
      artifact_name: m.artifactName,
      creator_handle: creatorHandle,
      price: m.retailCents / 100,
      manufacturing_cost: manufacturingCents / 100,
      creator_earnings: creatorNetCents / 100,
      status: 'placed',
      client_request_key: clientRequestKey,
    }));

    const hold = first(await supabaseReq('POST', 'escrow_holds', {
      kind: 'order',
      order_id: order.id,
      amount_cents: m.retailCents,
      currency: m.currency,
      gateway: 'spree-check',
      gateway_ref: m.gatewayRef,
    }));

    const groupId = crypto.randomUUID();
    await supabaseReq('POST', 'ledger_entries', [
      { group_id: groupId, escrow_hold_id: hold.id, account: 'buyer_source', direction: 'debit', amount_cents: m.retailCents, currency: m.currency, memo: `spree capture: order ${spreeOrder.number}` },
      { group_id: groupId, escrow_hold_id: hold.id, account: 'platform_escrow', direction: 'credit', amount_cents: m.retailCents, currency: m.currency, memo: `spree capture: order ${spreeOrder.number}` },
    ]);
    await supabaseReq('PATCH', `escrow_holds?id=eq.${hold.id}`, { state: 'held' });

    return {
      order,
      hold: { ...hold, state: 'held' },
      spreeNumber: spreeOrder.number,
      retailCents: m.retailCents,
      groupId,
      idempotentReplay: false,
    };
  }

  return { fetchSpreeOrder, syncOrder };
}

// cli entry: mirror one order and print the result
if (process.argv[1] && process.argv[1].endsWith('spree-order-sync.js')) {
  const {
    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
    SPREE_URL, SPREE_API_KEY, SPREE_TOKEN, SPREE_ORDER, SPREE_PROXY_AUTH,
  } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SPREE_URL || !SPREE_API_KEY || !SPREE_TOKEN || !SPREE_ORDER) {
    console.error('set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SPREE_URL, SPREE_API_KEY, SPREE_TOKEN, SPREE_ORDER');
    process.exit(2);
  }
  const sync = makeSpreeSync({
    supabaseUrl: SUPABASE_URL,
    serviceKey: SUPABASE_SERVICE_ROLE_KEY,
    spreeBaseUrl: SPREE_URL,
    spreeApiKey: SPREE_API_KEY,
    spreeProxyAuth: SPREE_PROXY_AUTH,
  });
  sync.syncOrder({ orderPrefixId: SPREE_ORDER, cartToken: SPREE_TOKEN })
    .then((r) => {
      console.log(r.idempotentReplay
        ? `replay: order ${r.order.id} already mirrored`
        : `synced: spree ${r.spreeNumber} -> order ${r.order.id}, hold held, ${r.retailCents} cents, group ${r.groupId}`);
    })
    .catch((e) => { console.error(e.message); process.exit(1); });
}
