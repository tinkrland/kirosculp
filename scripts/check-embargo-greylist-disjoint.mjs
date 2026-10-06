#!/usr/bin/env node
// check-embargo-greylist-disjoint.mjs
//
// the embargoed-territory review-trigger list must never contain a market that
// is fatf grey-listed in operations/country-rollout/creator-payout-rails.json.
// a grey list is a rail-capability and laundering-risk signal; an embargo is a
// sanctions regime. folding one into the other is the geography-as-trust-proxy
// error security/aml/considerations/trust-and-geography.md warns against.
//
// migration 0012 enforces the rule with a trigger, but the trigger holds a
// hardcoded list, because the rails matrix is a dated file outside the
// database. this script is the reconciliation: it compares the live list table
// against the matrix, and separately proves the trigger's hardcoded list still
// covers every grey-listed market the matrix names.
//
// usage:
//   node scripts/check-embargo-greylist-disjoint.mjs
//   import { checkEmbargoGreylistDisjoint } from './scripts/check-embargo-greylist-disjoint.mjs';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const RAILS_PATH = path.join(root, 'operations/country-rollout/creator-payout-rails.json');

/** @returns {string[]} grey-listed market codes named by the rails matrix */
export function readGreyListed(railsPath = RAILS_PATH) {
  const rails = JSON.parse(fs.readFileSync(railsPath, 'utf8'));
  return rails.markets.filter((m) => m.fatf_grey_list === true).map((m) => m.market).sort();
}

/**
 * @param {{ query: (sql: string, params?: any[]) => Promise<{ rows: any[] }> }} db
 * @param {{ greyListed?: string[] }} [opts]
 */
export async function checkEmbargoGreylistDisjoint(db, { greyListed = readGreyListed() } = {}) {
  const listed = (
    await db.query(`select list_version, territory_code, enabled from sculptura_private.embargoed_territory_review_list`)
  ).rows;

  // 1. the live table: no row, enabled or not, may name a grey-listed market.
  const overlaps = listed
    .filter((r) => greyListed.includes(r.territory_code))
    .map((r) => ({ listVersion: r.list_version, territory: r.territory_code, enabled: r.enabled }));

  // 2. the trigger: it must reject every grey-listed market the matrix names.
  //    probed inside a transaction that is rolled back, so nothing persists.
  const triggerGaps = [];
  for (const code of greyListed) {
    await db.query('begin');
    try {
      await db.query(
        `insert into sculptura_private.embargoed_territory_review_list
           (list_version, territory_code, authority, effective_date)
         values ('probe', $1, 'drift probe', current_date)`,
        [code],
      );
      triggerGaps.push(code); // the insert was accepted: the trigger does not cover it
    } catch (error) {
      if (error.code !== '22023') throw error; // 22023 is the trigger rejecting, which is the pass
    } finally {
      await db.query('rollback');
    }
  }

  return {
    greyListed,
    listedCount: listed.length,
    overlaps,
    triggerGaps,
    ok: listed.length > 0 && overlaps.length === 0 && triggerGaps.length === 0,
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const { buildTestDatabase } = await import('./build-security-test-db.mjs');
  const log = console.log;
  console.log = () => {};
  const db = await buildTestDatabase();
  console.log = log;
  const r = await checkEmbargoGreylistDisjoint(db);
  if (!r.ok) {
    console.error('embargo list and fatf grey list are not disjoint:');
    if (r.listedCount === 0) console.error('  the review-trigger list is empty, so this check would pass vacuously');
    for (const o of r.overlaps) console.error(`  ${o.territory} is on list ${o.listVersion} and is grey-listed`);
    for (const g of r.triggerGaps) console.error(`  the trigger does not reject grey-listed ${g}`);
    process.exit(1);
  }
  console.log(
    `embargo list is disjoint from the fatf grey list: ${r.listedCount} listed territories, ` +
      `${r.greyListed.length} grey-listed markets all rejected by the trigger`,
  );
  process.exit(0);
}
