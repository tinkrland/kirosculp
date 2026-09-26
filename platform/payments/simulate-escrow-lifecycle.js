// simulate-escrow-lifecycle.js
//
// end-to-end simulation of the escrow and ledger state machine against a
// real supabase project, over postgrest, exactly the way the platform leg
// will drive it. the gateway here is the sandbox adapter (localstripe /
// fetchsandbox semantics: authorize, capture, refund) so no real money
// or stripe involvement happens.
//
// usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node simulate-escrow-lifecycle.js
//
// it creates its own test rows (commission request + holds + entries),
// runs every legal transition and every rejection path, prints pass/fail
// per check, and exits nonzero on any failure. cleanup of its rows is a
// management-api step owned by the caller (the ledger is append-only by
// design, so the script itself cannot delete entries).

const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_ || !KEY) {
  console.error('set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(2);
}

const api = (path) => `${URL_}/rest/v1/${path}`;

async function req(method, path, body, query = '') {
  const res = await fetch(api(path + query), {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* raw error */ }
  const out = { status: res.status, ok: res.ok, json, text };
  if (!res.ok) out.error = json?.message || (text || '').slice(0, 200);
  return out;
}

const first = (j) => (Array.isArray(j) ? j[0] : j);
const results = [];
const lastErrors = [];
function check(name, pass, detail = '', err = '') {
  results.push({ name, pass });
  console.log(`${pass ? 'pass' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}${!pass && err ? '  [' + err + ']' : ''}`);
}

const crypto = await import('node:crypto');
const uuid = () => crypto.randomUUID();

// ---------------------------------------------------------------- run

// 1. a commission request exists (created directly by service role here;
//    in production the buyer's authenticated insert creates it)
const cr = await req('POST', 'commission_requests', {
  creator_handle: 'escrow-sim-creator',
  customer_name: 'escrow sim buyer',
  customer_email: 'sim-buyer@example.com',
  description: 'escrow lifecycle simulation run',
  status: 'new',
});
check('create commission_request', cr.ok && first(cr.json)?.id, `status ${cr.status}`, cr.error);
const commissionId = first(cr.json)?.id;

// 2. server opens an escrow hold for it
const holdA = await req('POST', 'escrow_holds', {
  kind: 'commission',
  commission_request_id: commissionId,
  amount_cents: 10000,
  currency: 'usd',
  gateway: 'sandbox',
  gateway_ref: `sim_${uuid()}`,
});
check('open hold (awaiting_payment)', holdA.ok && first(holdA.json)?.state === 'awaiting_payment', `status ${holdA.status}`, holdA.error);
const holdId = first(holdA.json)?.id;

// 3. hold terms are immutable
const mut = await req('PATCH', `escrow_holds?id=eq.${holdId}`, { amount_cents: 99999 });
check('hold terms immutable', !mut.ok, `status ${mut.status}`);

// 4. illegal transition rejected: awaiting_payment -> released
const bad = await req('PATCH', `escrow_holds?id=eq.${holdId}`, { state: 'released' });
check('illegal transition awaiting_payment -> released rejected', !bad.ok, `status ${bad.status}`);

// 5. gateway captures: payment moves buyer_source -> platform_escrow, then hold flips to held
const group1 = uuid();
const e1 = await req('POST', 'ledger_entries', [
  { group_id: group1, escrow_hold_id: holdId, account: 'buyer_source', direction: 'debit', amount_cents: 10000, currency: 'usd', memo: 'capture: buyer pays' },
  { group_id: group1, escrow_hold_id: holdId, account: 'platform_escrow', direction: 'credit', amount_cents: 10000, currency: 'usd', memo: 'capture: platform holds' },
]);
check('capture entries written', e1.ok && Array.isArray(e1.json) && e1.json.length === 2, `status ${e1.status}`);

const flip = await req('PATCH', `escrow_holds?id=eq.${holdId}`, { state: 'held' });
check('awaiting_payment -> held', flip.ok && first(flip.json)?.state === 'held', `status ${flip.status}`);

// 6. terminal state never reopens
const reopen = await req('PATCH', `escrow_holds?id=eq.${holdId}`, { state: 'awaiting_payment' });
check('held cannot revert to awaiting_payment', !reopen.ok, `status ${reopen.status}`);

// 7. delivery: release splits the held amount into creator net, manufacturing, platform fee
//    two-way pricing means the split is computed by the trusted pricing service;
//    here: 10000 = 6000 creator + 3000 manufacturing + 1000 platform fee
const group2 = uuid();
const e2 = await req('POST', 'ledger_entries', [
  { group_id: group2, escrow_hold_id: holdId, account: 'platform_escrow', direction: 'debit', amount_cents: 10000, currency: 'usd', memo: 'release: escrow out' },
  { group_id: group2, escrow_hold_id: holdId, account: 'creator_payable', direction: 'credit', amount_cents: 6000, currency: 'usd', memo: 'release: creator net' },
  { group_id: group2, escrow_hold_id: holdId, account: 'manufacturer_payable', direction: 'credit', amount_cents: 3000, currency: 'usd', memo: 'release: manufacturing' },
  { group_id: group2, escrow_hold_id: holdId, account: 'platform_fee', direction: 'credit', amount_cents: 1000, currency: 'usd', memo: 'release: platform fee' },
]);
check('release entries written', e2.ok && Array.isArray(e2.json) && e2.json.length === 4, `status ${e2.status}`);

const rel = await req('PATCH', `escrow_holds?id=eq.${holdId}`, { state: 'released' });
check('held -> released', rel.ok && first(rel.json)?.state === 'released', `status ${rel.status}`);

// 8. refund path on a second hold: held -> refunded with full reversal
const holdB = await req('POST', 'escrow_holds', {
  kind: 'commission',
  commission_request_id: commissionId,
  amount_cents: 5000,
  currency: 'usd',
  gateway: 'sandbox',
  gateway_ref: `sim_${uuid()}`,
});
const holdBId = first(holdB.json)?.id;
const group3 = uuid();
await req('POST', 'ledger_entries', [
  { group_id: group3, escrow_hold_id: holdBId, account: 'buyer_source', direction: 'debit', amount_cents: 5000, currency: 'usd', memo: 'capture' },
  { group_id: group3, escrow_hold_id: holdBId, account: 'platform_escrow', direction: 'credit', amount_cents: 5000, currency: 'usd', memo: 'capture' },
]);
const flipB = await req('PATCH', `escrow_holds?id=eq.${holdBId}`, { state: 'held' });
check('second hold captured', flipB.ok, `status ${flipB.status}`);

const group4 = uuid();
const e4 = await req('POST', 'ledger_entries', [
  { group_id: group4, escrow_hold_id: holdBId, account: 'platform_escrow', direction: 'debit', amount_cents: 5000, currency: 'usd', memo: 'refund: escrow out' },
  { group_id: group4, escrow_hold_id: holdBId, account: 'refund_source', direction: 'credit', amount_cents: 5000, currency: 'usd', memo: 'refund: buyer repaid' },
]);
check('refund entries written', e4.ok, `status ${e4.status}`);
const ref = await req('PATCH', `escrow_holds?id=eq.${holdBId}`, { state: 'refunded' });
check('held -> refunded', ref.ok && first(ref.json)?.state === 'refunded', `status ${ref.status}`);

// 9. ledger is append-only even for service_role
const up = await req('PATCH', `ledger_entries?id=eq.${e1.json[0].id}`, { amount_cents: 1 });
check('ledger entry update rejected for service_role', !up.ok, `status ${up.status}`);
const del = await req('DELETE', `ledger_entries?group_id=eq.${group1}`);
check('ledger entry delete rejected for service_role', !del.ok, `status ${del.status}`);

// 10. every group balanced
const bal = await req('GET', 'ledger_group_balances', undefined, `?group_id=in.("${group1}","${group2}","${group3}","${group4}")&select=group_id,net_cents,entry_count`);
const rows = bal.json || [];
check('capture group balanced', rows.some(r => r.group_id === group1 && r.net_cents === 0 && r.entry_count === 2), JSON.stringify(rows));
check('release group balanced', rows.some(r => r.group_id === group2 && r.net_cents === 0 && r.entry_count === 4));
check('capture group balanced (second)', rows.some(r => r.group_id === group3 && r.net_cents === 0 && r.entry_count === 2));
check('refund group balanced', rows.some(r => r.group_id === group4 && r.net_cents === 0 && r.entry_count === 2));

const failed = results.filter(r => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
if (failed > 0) process.exit(1);
