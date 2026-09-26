// order-service.js
//
// the idempotent server-side purchase operation for the order flow, plus
// the delivery release and refund paths. this is the shape 0004 deferred
// to: no client ever writes an order row; the server owns the whole path.
//
// flow: purchase() = look up the idempotency key, authorize (manual
// capture) on the gateway, insert the order, open the escrow hold, capture,
// write the capture entries, flip the hold to held. deliver() = release
// the split. refund() = gateway refund plus reversal entries.
//
// pricing note: the amounts arrive here from the trusted pricing service
// (two-way model: creator fixes net or retail). this service records what
// it is told; the ledger proves the books balance.

const first = (j) => (Array.isArray(j) ? j[0] : j);

export function makeOrderService({ supabaseUrl, serviceKey, gateway }) {
  const api = (path) => `${supabaseUrl}/rest/v1/${path}`;
  async function req(method, path, body, query = '') {
    const res = await fetch(api(path + query), {
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

  async function purchase({ clientRequestKey, customerEmail, customerName, shippingAddress, artifactName, creatorHandle, retailCents, manufacturingCents, creatorNetCents, currency = 'usd' }) {
    if (!clientRequestKey) throw new Error('clientRequestKey is required');
    // idempotency: a retry returns the original order, never a second charge
    const existing = await req('GET', 'orders', undefined,
      `?client_request_key=eq.${encodeURIComponent(clientRequestKey)}&select=id,status,customer_email`);
    if (existing.length) return { order: existing[0], idempotentReplay: true };

    const intent = await gateway.createIntent({ amountCents: retailCents, currency });

    const order = first(await req('POST', 'orders', {
      customer_email: customerEmail,
      customer_name: customerName,
      shipping_address: shippingAddress,
      artifact_name: artifactName,
      creator_handle: creatorHandle,
      price: retailCents / 100,
      manufacturing_cost: manufacturingCents / 100,
      creator_earnings: creatorNetCents / 100,
      status: 'placed',
      client_request_key: clientRequestKey,
    }));

    const hold = first(await req('POST', 'escrow_holds', {
      kind: 'order',
      order_id: order.id,
      amount_cents: retailCents,
      currency,
      gateway: gateway.provider,
      gateway_ref: intent.id,
    }));

    await gateway.capture(intent.id);

    const groupId = crypto.randomUUID();
    await req('POST', 'ledger_entries', [
      { group_id: groupId, escrow_hold_id: hold.id, account: 'buyer_source', direction: 'debit', amount_cents: retailCents, currency, memo: 'capture: buyer pays' },
      { group_id: groupId, escrow_hold_id: hold.id, account: 'platform_escrow', direction: 'credit', amount_cents: retailCents, currency, memo: 'capture: platform holds' },
    ]);
    await req('PATCH', `escrow_holds?id=eq.${hold.id}`, { state: 'held' });

    return { order, hold: { ...hold, state: 'held' }, intentId: intent.id, groupId, idempotentReplay: false };
  }

  async function deliver({ orderId }) {
    const order = first(await req('GET', 'orders', undefined, `?id=eq.${orderId}&select=id,price,manufacturing_cost,creator_earnings&limit=1`));
    const hold = first(await req('GET', 'escrow_holds', undefined, `?order_id=eq.${orderId}&state=eq.held&limit=1`));
    if (!hold) throw new Error(`no held escrow for order ${orderId}`);
    const feeCents = Math.round(order.price * 100) - Math.round(order.manufacturing_cost * 100) - Math.round(order.creator_earnings * 100);
    if (feeCents < 0) throw new Error('price split is negative; refusing to release');
    const heldCents = hold.amount_cents;
    const splitTotal = Math.round(order.manufacturing_cost * 100) + Math.round(order.creator_earnings * 100) + feeCents;
    if (splitTotal !== heldCents) throw new Error(`split ${splitTotal} does not equal held ${heldCents}; refusing to release`);

    const groupId = crypto.randomUUID();
    await req('POST', 'ledger_entries', [
      { group_id: groupId, escrow_hold_id: hold.id, account: 'platform_escrow', direction: 'debit', amount_cents: heldCents, currency: hold.currency, memo: 'release: escrow out' },
      { group_id: groupId, escrow_hold_id: hold.id, account: 'creator_payable', direction: 'credit', amount_cents: Math.round(order.creator_earnings * 100), currency: hold.currency, memo: 'release: creator net' },
      { group_id: groupId, escrow_hold_id: hold.id, account: 'manufacturer_payable', direction: 'credit', amount_cents: Math.round(order.manufacturing_cost * 100), currency: hold.currency, memo: 'release: manufacturing' },
      { group_id: groupId, escrow_hold_id: hold.id, account: 'platform_fee', direction: 'credit', amount_cents: feeCents, currency: hold.currency, memo: 'release: platform fee' },
    ]);
    await req('PATCH', `escrow_holds?id=eq.${hold.id}`, { state: 'released' });
    await req('PATCH', `orders?id=eq.${orderId}`, { status: 'delivered' });
    return { groupId, feeCents };
  }

  async function refund({ orderId }) {
    const hold = first(await req('GET', 'escrow_holds', undefined, `?order_id=eq.${orderId}&state=eq.held&limit=1`));
    if (!hold) throw new Error(`no held escrow for order ${orderId}`);
    await gateway.refund(hold.gateway_ref, hold.amount_cents);
    const groupId = crypto.randomUUID();
    await req('POST', 'ledger_entries', [
      { group_id: groupId, escrow_hold_id: hold.id, account: 'platform_escrow', direction: 'debit', amount_cents: hold.amount_cents, currency: hold.currency, memo: 'refund: escrow out' },
      { group_id: groupId, escrow_hold_id: hold.id, account: 'refund_source', direction: 'credit', amount_cents: hold.amount_cents, currency: hold.currency, memo: 'refund: buyer repaid' },
    ]);
    await req('PATCH', `escrow_holds?id=eq.${hold.id}`, { state: 'refunded' });
    await req('PATCH', `orders?id=eq.${orderId}`, { status: 'cancelled' });
    return { groupId };
  }

  return { purchase, deliver, refund };
}
