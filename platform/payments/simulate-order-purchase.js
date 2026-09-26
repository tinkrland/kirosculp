// simulate-order-purchase.js
//
// end-to-end order-flow prototype against the live foundation project and
// a real localstripe server (stripe-shaped api, manual capture): purchase
// (authorize + capture + escrow), idempotent double-submit, delivery
// release split, gateway refund with reversal, ledger balance checks.
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//   STRIPE_URL=http://localhost:4242 node simulate-order-purchase.js

import { makeGateway } from './gateway-adapter.js';
import { makeOrderService } from './order-service.js';

const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) { console.error('set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'); process.exit(2); }

// gateway provider is configurable: GATEWAY=sandbox runs the pure in-memory
// simulation (no external service); GATEWAY=localstripe (the default) needs
// STRIPE_URL pointing at a running localstripe server.
const gateway = makeGateway({
  provider: process.env.GATEWAY || 'localstripe',
  baseUrl: process.env.STRIPE_URL,
});
const svc = makeOrderService({ supabaseUrl: URL_, serviceKey: KEY, gateway });

const results = [];
const check = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? 'pass' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
};

async function rest(method, path, body, query = '') {
  const res = await fetch(`${URL_}/rest/v1/${path + query}`, {
    method,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null; try { json = text ? JSON.parse(text) : null; } catch { /* raw */ }
  return { status: res.status, ok: res.ok, json, text };
}

// 1. purchase: $100 retail, $30 manufacturing, $60 creator net, $10 fee
const p1 = await svc.purchase({
  clientRequestKey: 'sim_order_001',
  customerEmail: 'order-sim-buyer@example.com',
  customerName: 'order sim buyer',
  shippingAddress: '456 Sim Ave',
  artifactName: 'sim artifact ring',
  creatorHandle: 'order-sim-creator',
  retailCents: 10000, manufacturingCents: 3000, creatorNetCents: 6000,
}).catch(e => ({ error: String(e.message) }));
check('purchase completes (order + hold + capture)', !p1.error && p1.hold?.state === 'held', p1.error || `intent ${p1.intentId}`);
if (p1.error) { console.log('\npurchase failed; aborting run'); process.exit(1); }

// 2. idempotency: same key submitted again returns the original order
const p2 = await svc.purchase({
  clientRequestKey: 'sim_order_001',
  customerEmail: 'order-sim-buyer@example.com',
  customerName: 'order sim buyer',
  shippingAddress: '456 Sim Ave',
  artifactName: 'sim artifact ring',
  creatorHandle: 'order-sim-creator',
  retailCents: 10000, manufacturingCents: 3000, creatorNetCents: 6000,
}).catch(e => ({ error: String(e.message) }));
check('double submit is an idempotent replay', p2.idempotentReplay === true && p2.order?.id === p1.order?.id, p2.error || '');

// 3. only one order exists for the key
const rows = await rest('GET', 'orders', undefined, '?client_request_key=eq.sim_order_001&select=id');
check('exactly one order for the idempotency key', Array.isArray(rows.json) && rows.json.length === 1, `count ${rows.json?.length}`);

// 4. delivery releases the split
const d1 = await svc.deliver({ orderId: p1.order.id }).catch(e => ({ error: String(e.message) }));
check('deliver releases (60/30/10 split)', !d1.error && d1.feeCents === 1000, d1.error || '');

// 5. hold is terminal released, order is delivered
const h1 = await rest('GET', 'escrow_holds', undefined, `?order_id=eq.${p1.order.id}&select=state`);
const o1 = await rest('GET', 'orders', undefined, `?id=eq.${p1.order.id}&select=status`);
check('hold released and order delivered', first(h1.json)?.state === 'released' && first(o1.json)?.status === 'delivered', `${first(h1.json)?.state}/${first(o1.json)?.status}`);

// 6. refund path on a second order
const p3 = await svc.purchase({
  clientRequestKey: 'sim_order_002',
  customerEmail: 'order-sim-buyer@example.com',
  customerName: 'order sim buyer',
  shippingAddress: '789 Sim Blvd',
  artifactName: 'sim artifact pendant',
  creatorHandle: 'order-sim-creator',
  retailCents: 7500, manufacturingCents: 2500, creatorNetCents: 4000,
}).catch(e => ({ error: String(e.message) }));
check('second purchase completes', !p3.error, p3.error || '');
const r3 = await svc.refund({ orderId: p3.order.id }).catch(e => ({ error: String(e.message) }));
check('refund reverses escrow and cancels order', !r3.error, r3.error || '');
const h3 = await rest('GET', 'escrow_holds', undefined, `?order_id=eq.${p3.order.id}&select=state`);
const o3 = await rest('GET', 'orders', undefined, `?id=eq.${p3.order.id}&select=status`);
check('hold refunded and order cancelled', first(h3.json)?.state === 'refunded' && first(o3.json)?.status === 'cancelled', `${first(h3.json)?.state}/${first(o3.json)?.status}`);

// 7. every group across both flows balances
const bal = await rest('GET', 'ledger_group_balances', undefined, '?select=group_id,net_cents,entry_count');
const all = (bal.json || []).filter(r => r.group_id === p1.groupId || r.group_id === d1.groupId || r.group_id === p3.groupId || r.group_id === r3.groupId);
check('all four groups balanced (net 0)', all.length === 4 && all.every(r => r.net_cents === 0), JSON.stringify(all.map(r => [r.entry_count, r.net_cents])));

// 8. delivered order cannot be re-released (state machine terminal)
const d2 = await svc.deliver({ orderId: p1.order.id }).catch(e => ({ error: String(e.message) }));
check('re-release of terminal hold rejected', !!d2.error, d2.error ? '' : 'no error');

function first(j) { return Array.isArray(j) ? j[0] : j; }

const failed = results.filter(r => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
if (failed) process.exit(1);
