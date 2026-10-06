#!/usr/bin/env node
// check-trust-schema-invariant.mjs
//
// enforces the behavior-only trust invariant from
// security/aml/considerations/trust-and-geography.md in code, not only in review:
//
//   no market, geography or corridor field may enter the trust computation or
//   its schema.
//
// three checks against a built database:
//   1. trust tables carry no geography-like column.
//   2. payout signal evidence tables carry no geography-like column. the
//      policy table is check-selection configuration and is the one exemption.
//   3. no foreign key links a trust table to a signal table in either direction,
//      so signal data cannot be joined into trust by constraint.
//
// usage:
//   node scripts/check-trust-schema-invariant.mjs
//   import { checkGeographyInvariant } from './scripts/check-trust-schema-invariant.mjs';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PRIVATE_SCHEMA = 'sculptura_private';

/** trust tables that must exist. a checker that finds none would pass vacuously. */
export const EXPECTED_TRUST_TABLES = [
  'creator_trust',
  'creator_trust_events',
  'buyer_trust',
  'buyer_trust_events',
];

/** signal evidence tables, which must also be free of geography columns. */
export const SIGNAL_EVIDENCE_TABLES = ['creator_signal_events', 'payout_signal_decisions'];

/** the one signal table allowed to carry a market code. */
export const SIGNAL_CONFIG_TABLES = ['payout_signal_policy'];

/** whole-token matches, so `isolation` is not flagged by `iso`. */
const GEOGRAPHY_TOKENS = new Set([
  'market', 'markets', 'geo', 'geography', 'geographic', 'geolocation',
  'country', 'countries', 'region', 'regions', 'corridor', 'corridors',
  'location', 'territory', 'timezone', 'tz', 'city', 'nation', 'nationality',
  'continent', 'jurisdiction', 'locale', 'iso', 'lat', 'lon', 'lng', 'latitude', 'longitude',
]);

/** @param {string} columnName */
export function columnLooksGeographic(columnName) {
  return columnName
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .some((token) => GEOGRAPHY_TOKENS.has(token));
}

/**
 * @param {{ query: (sql: string, params?: any[]) => Promise<{ rows: any[] }> }} db
 */
export async function checkGeographyInvariant(db) {
  const tables = (
    await db.query(
      `select table_name from information_schema.tables
        where table_schema = $1 and table_type = 'BASE TABLE'`,
      [PRIVATE_SCHEMA],
    )
  ).rows.map((r) => r.table_name);

  const trustTables = tables.filter((t) => /trust/i.test(t));
  const missingTrustTables = EXPECTED_TRUST_TABLES.filter((t) => !trustTables.includes(t));
  const missingSignalTables = [...SIGNAL_EVIDENCE_TABLES, ...SIGNAL_CONFIG_TABLES].filter(
    (t) => !tables.includes(t),
  );

  const columnsOf = async (names) =>
    names.length === 0
      ? []
      : (
          await db.query(
            `select table_name, column_name from information_schema.columns
              where table_schema = $1 and table_name = any($2::text[])
              order by table_name, ordinal_position`,
            [PRIVATE_SCHEMA, names],
          )
        ).rows;

  const trustViolations = (await columnsOf(trustTables))
    .filter((c) => columnLooksGeographic(c.column_name))
    .map((c) => ({ table: c.table_name, column: c.column_name }));

  const signalViolations = (await columnsOf(SIGNAL_EVIDENCE_TABLES.filter((t) => tables.includes(t))))
    .filter((c) => columnLooksGeographic(c.column_name))
    .map((c) => ({ table: c.table_name, column: c.column_name }));

  const signalSide = [...SIGNAL_EVIDENCE_TABLES, ...SIGNAL_CONFIG_TABLES];
  const fks = (
    await db.query(
      `select c.conrelid::regclass::text as from_table, c.confrelid::regclass::text as to_table
         from pg_constraint c
         join pg_namespace n on n.oid = c.connamespace
        where c.contype = 'f' and n.nspname = $1`,
      [PRIVATE_SCHEMA],
    )
  ).rows;
  const bare = (qualified) => qualified.replace(/^"?[a-z_]+"?\./, '').replace(/"/g, '');
  const crossReferences = fks
    .map((f) => ({ from: bare(f.from_table), to: bare(f.to_table) }))
    .filter(
      (f) =>
        (trustTables.includes(f.from) && signalSide.includes(f.to)) ||
        (signalSide.includes(f.from) && trustTables.includes(f.to)),
    );

  return {
    trustTables,
    missingTrustTables,
    missingSignalTables,
    trustViolations,
    signalViolations,
    crossReferences,
    ok:
      missingTrustTables.length === 0 &&
      missingSignalTables.length === 0 &&
      trustViolations.length === 0 &&
      signalViolations.length === 0 &&
      crossReferences.length === 0,
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const { buildTestDatabase } = await import('./build-security-test-db.mjs');
  const log = console.log;
  console.log = () => {}; // the builder is chatty; keep this script's output to the result.
  const db = await buildTestDatabase();
  console.log = log;
  const r = await checkGeographyInvariant(db);
  if (!r.ok) {
    console.error('geography invariant violated:');
    for (const t of r.missingTrustTables) console.error(`  expected trust table missing: ${t}`);
    for (const t of r.missingSignalTables) console.error(`  expected signal table missing: ${t}`);
    for (const v of r.trustViolations) console.error(`  trust table ${v.table} has column ${v.column}`);
    for (const v of r.signalViolations) console.error(`  signal table ${v.table} has column ${v.column}`);
    for (const x of r.crossReferences) console.error(`  foreign key links ${x.from} to ${x.to}`);
    process.exit(1);
  }
  console.log(
    `geography invariant holds: ${r.trustTables.length} trust tables and ` +
      `${SIGNAL_EVIDENCE_TABLES.length} signal evidence tables have no geography column, ` +
      `no foreign key crosses between trust and signals`,
  );
  process.exit(0);
}
