#!/usr/bin/env node
// check-parked-hold-policy.mjs
//
// the parked-market "not yet" list (platform/signals/parked-market-policy.mjs) is
// for markets that are parked for roadmap reasons only. it must never contain a
// sanctions market, an fatf grey-listed market or an out-of-scope market, because
// "not yet" promises a future those markets are not on track for, and a sanctions
// market needs the embargo review path, not a friendly park.
//
// this reconciles the list against the rails matrix and, when a database is
// supplied, against the embargoed-territory list. it fails on an empty list rather
// than passing vacuously.
//
// usage:
//   node scripts/check-parked-hold-policy.mjs
//   import { checkParkedHoldPolicy } from './scripts/check-parked-hold-policy.mjs';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRailsMatrix } from '../platform/signals/payout-eligibility.mjs';
import { PARKED_MARKET_HOLD } from '../platform/signals/parked-market-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAILS_PATH = path.join(root, 'operations/country-rollout/creator-payout-rails.json');

/** reasons that mark a parked market as something other than roadmap state. */
export const NOT_ROADMAP = /out of scope|sanction|grey/i;

/**
 * @param {object} [opts]
 * @param {typeof PARKED_MARKET_HOLD} [opts.policy]
 * @param {string} [opts.railsPath]
 * @param {string[]} [opts.embargoedCodes] territory codes on the embargo review list
 * @returns {{ ok: boolean, problems: string[], opened: string[], listed: number }}
 */
export function checkParkedHoldPolicy({ policy = PARKED_MARKET_HOLD, railsPath = RAILS_PATH, embargoedCodes = [] } = {}) {
  const { enabledMarkets, parkedMarkets } = loadRailsMatrix(railsPath);
  const raw = JSON.parse(fs.readFileSync(railsPath, 'utf8'));
  const greyEnabled = new Set(raw.markets.filter((m) => m.fatf_grey_list === true).map((m) => m.market));
  const problems = [];
  const opened = [];
  const seen = new Set();

  if (policy.markets.length === 0) problems.push('the list is empty, so this check would pass vacuously');
  for (const { market } of policy.markets) {
    if (!/^[A-Z]{2}$/.test(market)) { problems.push(`${String(market)} is not an iso alpha-2 code`); continue; }
    if (seen.has(market)) problems.push(`${market} is listed twice`);
    seen.add(market);
    if (embargoedCodes.includes(market)) problems.push(`${market} is on the embargoed-territory list; that path is a review, not a park`);
    if (greyEnabled.has(market)) problems.push(`${market} is fatf grey-listed in the rails matrix`);
    if (parkedMarkets.has(market)) {
      if (NOT_ROADMAP.test(parkedMarkets.get(market))) {
        problems.push(`${market} is parked for a reason that is not roadmap state: ${parkedMarkets.get(market)}`);
      }
    } else if (enabledMarkets.has(market)) {
      opened.push(market); // the market opened. eligibility already ignores the entry; remove it at leisure.
    } else {
      problems.push(`${market} is in neither the enabled nor the parked markets of the rails matrix`);
    }
  }
  return { ok: problems.length === 0, problems, opened, listed: policy.markets.length };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const { buildTestDatabase } = await import('./build-security-test-db.mjs');
  const log = console.log;
  console.log = () => {};
  const db = await buildTestDatabase();
  console.log = log;
  const embargoedCodes = (await db.query(`select territory_code from sculptura_private.embargoed_territory_review_list`)).rows
    .map((r) => r.territory_code);
  const r = checkParkedHoldPolicy({ embargoedCodes });
  if (!r.ok) {
    console.error('parked-market hold list is not clean:');
    for (const p of r.problems) console.error(`  ${p}`);
    process.exit(1);
  }
  const note = r.opened.length ? `; ${r.opened.join(', ')} has opened and can be removed from the list` : '';
  console.log(`parked-market hold list is clean: ${r.listed} listed, all roadmap-parked, none sanctioned, grey-listed or embargoed${note}`);
  process.exit(0);
}
