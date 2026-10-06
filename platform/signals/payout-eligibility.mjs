// payout-eligibility.mjs
//
// batch 9: "not yet" at payout onboarding, before any signal check. two owner
// rulings (2026-10-06) share one shape, so they share one module.
//
//   minor creator (jeremiah brown jr. case). v1 is a pure park. publication
//   needs the age attestation, earnings accrue in the ledger with no payout rail,
//   and payout onboarding says "not yet" until the creator reaches 18, when the
//   creator passes their own provider kyc. no parental payee, no parental kyc, no
//   third-party payout.
//
//   parked market (faizah aisler case). a creator resident in a v2 parked market
//   publishes and earns, the balance accrues, and payout onboarding says "not
//   yet". funds release when the market opens or when the creator presents a bank
//   rail in an already enabled market. the rail market selects the checks, never
//   the residence, per the strict-corridor rule.
//
// what this module is not:
//   - not a signal check. it writes nothing, so no decision row, no device
//     collection and no needs_review come from it. a creator who is told "not yet"
//     never reaches the signal service.
//   - not a trust input. it reads no trust table and writes none.
//   - not a ledger writer. accrual is an ordinary creator_payable liability made
//     by the order and escrow path. no special event type exists or is needed.
//   - not a refusal. the only two outcomes are `proceed` and `not_yet`. there is
//     no `no`, no `fail` and no `review` here.
//
// residence is read, used to choose between "proceed" and "not yet", and
// discarded. it is not stored, returned or logged.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PARKED_MARKET_HOLD, holdMarketCodes } from './parked-market-policy.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_RAILS_PATH = path.resolve(here, '..', '..', 'operations', 'country-rollout', 'creator-payout-rails.json');

export const ELIGIBILITY_STATUSES = Object.freeze(['proceed', 'not_yet']);
export const NOT_YET_CAUSES = Object.freeze([
  'minor_creator', 'market_not_open', 'age_attestation_missing', 'age_attestation_invalid',
]);

const MARKET = /^[A-Z]{2}$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export class RailsMatrixUnavailableError extends Error {
  constructor(reason) {
    super(`rails matrix unavailable: ${reason}`);
    this.name = 'RailsMatrixUnavailableError';
    this.code = 'rails_matrix_unavailable';
  }
}

export class InvalidEligibilityInputError extends TypeError {
  constructor(field) {
    super(`invalid eligibility input: ${field}`);
    this.name = 'InvalidEligibilityInputError';
    this.code = 'invalid_eligibility_input';
  }
}

/**
 * reads the enabled and parked markets from the rails matrix.
 *
 * the matrix says it must be queried at runtime (`runtime_query_required`), so the
 * provider below reads the file on every call instead of caching it. a market that
 * moves from parked to enabled is seen on the next request.
 *
 * @param {string} file
 * @returns {{ enabledMarkets: Set<string>, parkedMarkets: Map<string, string> }}
 */
export function loadRailsMatrix(file = DEFAULT_RAILS_PATH) {
  let matrix;
  try {
    matrix = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    throw new RailsMatrixUnavailableError('unreadable');
  }
  if (matrix?.deny_by_default !== true) throw new RailsMatrixUnavailableError('deny_by_default is not true');
  if (!Array.isArray(matrix.markets) || !Array.isArray(matrix.parked_markets)) throw new RailsMatrixUnavailableError('malformed');
  const enabledMarkets = new Set();
  const parkedMarkets = new Map();
  for (const row of matrix.markets) {
    if (typeof row?.market !== 'string' || !MARKET.test(row.market)) throw new RailsMatrixUnavailableError('bad market code');
    enabledMarkets.add(row.market);
  }
  for (const row of matrix.parked_markets) {
    if (typeof row?.market !== 'string' || !MARKET.test(row.market)) throw new RailsMatrixUnavailableError('bad parked code');
    parkedMarkets.set(row.market, typeof row.reason === 'string' ? row.reason : '');
  }
  if (enabledMarkets.size === 0) throw new RailsMatrixUnavailableError('no enabled markets');
  for (const code of parkedMarkets.keys()) {
    if (enabledMarkets.has(code)) throw new RailsMatrixUnavailableError('a market is both enabled and parked');
  }
  return { enabledMarkets, parkedMarkets };
}

/** @param {{ file?: string }} [opts] */
export const createRailsMatrixProvider = ({ file = DEFAULT_RAILS_PATH } = {}) => async () => loadRailsMatrix(file);

/**
 * a calendar date in the shape yyyy-mm-dd, or null. rejects impossible dates such
 * as 2026-02-30, which Date would silently roll forward.
 * @param {unknown} value
 * @returns {string | null}
 */
export function parseIsoDate(value) {
  if (typeof value !== 'string') return null;
  const m = ISO_DATE.exec(value);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  return value;
}

const utcDate = (date) => date.toISOString().slice(0, 10);

/**
 * @typedef {object} AgeAttestation
 * @property {'adult' | 'minor'} status
 * @property {string} [majorityDate] for a minor: the date they turn 18, as yyyy-mm-dd.
 *   the attestation capture at publication computes it. a february 29 birth should
 *   be recorded as march 1 of the eighteenth year, so the park never ends early.
 *
 * @typedef {{ status: 'proceed' } | { status: 'not_yet', cause: typeof NOT_YET_CAUSES[number] }} EligibilityResult
 */

/**
 * @param {object} deps
 * @param {() => Promise<{ enabledMarkets: Set<string>, parkedMarkets: Map<string, string> }>} deps.loadRails
 * @param {typeof PARKED_MARKET_HOLD} [deps.holdPolicy]
 * @param {() => Date} [deps.now]
 */
export function createEligibilityEvaluator({ loadRails, holdPolicy = PARKED_MARKET_HOLD, now = () => new Date() }) {
  if (typeof loadRails !== 'function') throw new TypeError('loadRails is required');
  const holdMarkets = holdMarketCodes(holdPolicy);

  /** @returns {null | { cause: 'age_attestation_missing' | 'age_attestation_invalid' | 'minor_creator' }} */
  function ageBarrier(attestation) {
    if (attestation === null || attestation === undefined) return { cause: 'age_attestation_missing' };
    if (typeof attestation !== 'object') return { cause: 'age_attestation_invalid' };
    if (attestation.status === 'adult') return null;
    if (attestation.status !== 'minor') return { cause: 'age_attestation_invalid' };
    const majority = parseIsoDate(attestation.majorityDate);
    if (majority === null) return { cause: 'age_attestation_invalid' };
    const today = utcDate(now());
    // nobody is younger than zero: a majority date more than 18 years away is a bad record.
    const latest = new Date(now());
    latest.setUTCFullYear(latest.getUTCFullYear() + 18);
    if (majority > utcDate(latest)) return { cause: 'age_attestation_invalid' };
    return today < majority ? { cause: 'minor_creator' } : null;
  }

  return {
    /**
     * @param {{ residenceMarket: string | null, railMarket: string | null, ageAttestation: AgeAttestation | null | undefined }} facts
     *   residenceMarket is where the creator lives, when known. railMarket is the market of
     *   the creator's verified payout record, or null when there is none yet.
     * @returns {Promise<EligibilityResult>}
     */
    async evaluate({ residenceMarket, railMarket, ageAttestation }) {
      if (residenceMarket !== null && residenceMarket !== undefined
          && !(typeof residenceMarket === 'string' && MARKET.test(residenceMarket))) {
        throw new InvalidEligibilityInputError('residenceMarket');
      }
      if (railMarket !== null && railMarket !== undefined
          && !(typeof railMarket === 'string' && MARKET.test(railMarket))) {
        throw new InvalidEligibilityInputError('railMarket');
      }

      // 1. age first: a minor has no payout path in any market, with or without a rail.
      const barrier = ageBarrier(ageAttestation);
      if (barrier) return { status: 'not_yet', cause: barrier.cause };

      // 2. the rail, then the residence. the matrix is read fresh, so an opened market lifts the hold.
      const rails = await loadRails();
      if (typeof railMarket === 'string') {
        // deny by default: a rail in a market the matrix does not enable cannot be paid out to yet.
        return rails.enabledMarkets.has(railMarket)
          ? { status: 'proceed' }
          : { status: 'not_yet', cause: 'market_not_open' };
      }
      const parkedResident = typeof residenceMarket === 'string'
        && holdMarkets.has(residenceMarket)
        && rails.parkedMarkets.has(residenceMarket)
        && !rails.enabledMarkets.has(residenceMarket);
      return parkedResident ? { status: 'not_yet', cause: 'market_not_open' } : { status: 'proceed' };
    },
  };
}
