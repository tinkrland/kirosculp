// payout-signal-check.mjs
//
// the money-moment decision service (requirements req-6, req-7, req-9).
//
// it runs at exactly two moments, payout onboarding and payout request, takes a
// device payload and an observed ip, applies the market's check policy, and
// records one reviewable, idempotent decision. the decision is evidence. it does
// not move funds, freeze, ban, report, or score anyone.
//
// the market only selects which checks are mandatory. it is used to read the
// policy and is then discarded: it is not stored, not returned, and not passed to
// any lookup. nothing here reads or writes a person's standing.
//
// outcomes (owner rulings, 2026-10-06):
//   a mandatory check that is positive  -> the policy's positive_outcome,
//                                          needs_review in the v1 seed
//   a mandatory feed that is unavailable -> needs_review, feed_unavailable
//   a mandatory check with no coverage   -> needs_review, coverage_unavailable
//   a failed device collection           -> needs_review, collection_unavailable
//   otherwise                            -> pass
// unavailable data never resolves to pass, and our own outage is never a hard
// user fail.

import { processDevicePayload, disposeRawPayload } from './device-processor.mjs';
import {
  parseIp, InvalidIpError, assertIpIntelligenceResult, toStoredNetworkFlags, toStoredGeoEvidence,
  FLAG_NAMES,
} from './ip-intelligence.mjs';

export const SERVICE_VERSION = 'payout-signal-check-1';

/** the only moments a check may run. the sql check constraint enforces the same pair. */
export const MONEY_MOMENTS = Object.freeze(['payout_onboarding', 'payout_request']);

/** every reason code the database accepts. */
export const REASON_CODES = Object.freeze([
  'proxy_detected', 'vpn_detected', 'tor_detected', 'datacenter_detected',
  'feed_unavailable', 'coverage_unavailable', 'collection_unavailable',
  'ip_geo_embargoed_territory',
]);

const INPUT_KEYS = Object.freeze([
  'creatorProfileId', 'moment', 'submissionId', 'observedIp', 'rawDevicePayload', 'market',
]);
// shape only. the database uuid type accepts any well-formed uuid, so requiring
// version bits here would reject valid ids such as the seeded test identities.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MARKET = /^[A-Z]{2}$/;

// ------------------------------------------------------------------- errors

class ServiceError extends Error {
  constructor(name, code, message) {
    super(message);
    this.name = name;
    this.code = code;
  }
}

/** the caller passed something the service will not act on. nothing was recorded. */
export class ServiceInputError extends ServiceError {
  constructor(message) { super('ServiceInputError', 'invalid_input', message); }
}

/** a check was requested outside the two money moments. */
export class MoneyMomentNotAllowedError extends ServiceError {
  constructor() {
    super('MoneyMomentNotAllowedError', 'not_a_money_moment',
      'checks run only at payout onboarding and payout request');
  }
}

/** no enabled policy row could be read. a hold, not a pass and not a user fail. */
export class PolicyUnavailableError extends ServiceError {
  constructor() { super('PolicyUnavailableError', 'policy_unavailable', 'no enabled check policy is available'); }
}

/** the submission id was already used for different input. */
export class ReplayMismatchError extends ServiceError {
  constructor() {
    super('ReplayMismatchError', 'replay_mismatch', 'this submission id was already used for different input');
  }
}

/**
 * the decision could not be stored. nothing was decided, so the payout workflow
 * must hold and may retry with the same submission id. only the error class and
 * database code are kept: a database message can quote sql or input.
 */
export class CheckNotRecordedError extends ServiceError {
  constructor(cause) {
    super('CheckNotRecordedError', 'check_not_recorded', 'the check could not be recorded');
    this.causeClass = cause?.name ?? 'Error';
    this.causeCode = typeof cause?.code === 'string' ? cause.code : null;
  }
}

// --------------------------------------------------------------- pure policy

/**
 * applies a policy to device and network results. pure: no io, no clock, no
 * randomness, so the same inputs always give the same decision.
 *
 * the embargoed-territory check (batch 8 addendum) is independent of corridor
 * strictness: it is evaluated whether or not `policy.mandatoryChecks` is
 * empty, because it targets the ip's resolved territory, not the creator's
 * payout rail. a us-rail creator (non-strict) with an embargoed-territory ip
 * gets the same needs_review hold a strict-corridor creator would. it never
 * produces `fail` on its own, regardless of `policy.positiveOutcome`: an
 * embargoed-territory hit is always a human-review hold, per the owner
 * addendum, not an automatic rejection.
 *
 * missing or unusable geo (no source configured, a satellite range, a
 * non-public address) is a normal condition: `geo.coverage === 'none'` adds
 * no reason code at all. it is attribution recorded alongside the decision,
 * never a reason the outcome can turn on.
 *
 * @param {{ mandatoryChecks: string[], positiveOutcome: 'needs_review' | 'fail' }} policy
 * @param {{ collectionStatus: string }} device
 * @param {object | null} network a validated port result, or null when the adapter failed
 * @param {{ embargoedTerritories: Set<string> }} territoryConfig the active review-trigger list
 * @returns {{ outcome: 'pass' | 'needs_review' | 'fail', reasonCodes: string[], selectedChecks: string[] }}
 */
export function evaluateChecks(policy, device, network, territoryConfig) {
  const selectedChecks = FLAG_NAMES.filter((name) => policy.mandatoryChecks.includes(name));
  const reasons = new Set();
  let positive = false;
  let territoryHold = false;

  for (const name of selectedChecks) {
    if (network === null || network.availability[name] === 'unavailable') {
      reasons.add('feed_unavailable');
    } else if (network.coverage[name] === 'none') {
      reasons.add('coverage_unavailable');
    }
    if (network !== null && network.flags[name].value === true) {
      reasons.add(`${name}_detected`);
      positive = true;
    }
  }
  if (device.collectionStatus === 'unavailable') reasons.add('collection_unavailable');

  // independent of selectedChecks and of policy.mandatoryChecks: this runs
  // for every money moment, strict corridor or not. a geo result that was not
  // evaluated (coverage none) is a normal miss, not a reason code.
  if (network !== null && network.geo.coverage === 'full' && network.geo.countryCode !== null
      && territoryConfig.embargoedTerritories.has(network.geo.countryCode)) {
    reasons.add('ip_geo_embargoed_territory');
    territoryHold = true;
  }

  const reasonCodes = REASON_CODES.filter((code) => reasons.has(code));
  if (reasonCodes.length === 0) return { outcome: 'pass', reasonCodes, selectedChecks };
  // the embargoed-territory hold is never auto-fail, regardless of the
  // mandatory-check policy's own positiveOutcome configuration. if a
  // mandatory check also failed, that outcome still applies; the territory
  // hold alone never escalates past needs_review.
  const mandatoryOutcome = positive && policy.positiveOutcome === 'fail' ? 'fail' : 'needs_review';
  const outcome = territoryHold && !positive ? 'needs_review' : mandatoryOutcome;
  return { outcome, reasonCodes, selectedChecks };
}

/** flags stored when the adapter could not answer: nothing was evaluated. */
function unevaluatedFlags() {
  return Object.fromEntries(
    FLAG_NAMES.map((name) => [name, { value: false, coverage: 'none', source_id: null, dataset_version: null }]),
  );
}

// ------------------------------------------------------------------ service

/**
 * @typedef {object} PolicyStore
 * @property {(policyVersion: string, market: string) => Promise<null | {
 *   policyVersion: string, mandatoryChecks: string[], positiveOutcome: 'needs_review' | 'fail' }>} getPolicy
 *
 * @typedef {object} TerritoryListStore
 * @property {(listVersion: string) => Promise<null | { embargoedTerritories: Set<string> }>} getEmbargoList
 *
 * @typedef {object} Recorder
 * @property {(row: object) => Promise<object>} record
 * @property {(submissionId: string) => Promise<null | {
 *   creatorProfileId: string, moment: string, deviceHash: string | null, ipDigest: string | null,
 *   decision: { outcome: string, reasonCodes: string[], policyVersion: string, selectedChecks: string[] } }>} findExisting
 */
export class PayoutSignalCheckService {
  #ipAdapter;
  #keyRing;
  #policyStore;
  #territoryListStore;
  #recorder;
  #policyVersion;
  #territoryListVersion;
  #telemetry;

  /**
   * @param {{ ipAdapter: { lookup: Function }, keyRing: import('./key-ring.mjs').KeyRing,
   *   policyStore: PolicyStore, territoryListStore: TerritoryListStore, recorder: Recorder,
   *   policyVersion?: string, territoryListVersion?: string,
   *   telemetry?: (event: object) => void }} deps
   */
  constructor({
    ipAdapter, keyRing, policyStore, territoryListStore, recorder,
    policyVersion = 'v1', territoryListVersion = 'v1', telemetry = null,
  }) {
    for (const [name, value] of Object.entries({ ipAdapter, keyRing, policyStore, territoryListStore, recorder })) {
      if (!value) throw new TypeError(`${name} is required`);
    }
    this.#ipAdapter = ipAdapter;
    this.#keyRing = keyRing;
    this.#policyStore = policyStore;
    this.#territoryListStore = territoryListStore;
    this.#recorder = recorder;
    this.#policyVersion = policyVersion;
    this.#territoryListVersion = territoryListVersion;
    this.#telemetry = telemetry;
  }

  /**
   * @param {{ creatorProfileId: string, moment: string, submissionId: string,
   *   observedIp: string, rawDevicePayload: unknown, market: string }} input
   * @returns {Promise<{ submissionId: string, outcome: string, reasonCodes: string[],
   *   policyVersion: string, selectedChecks: string[], replayed: boolean }>}
   */
  async check(input) {
    // 1. validate everything before any adapter, policy or storage call.
    if (input === null || typeof input !== 'object' || Array.isArray(input)) {
      throw new ServiceInputError('input must be an object');
    }
    if (!MONEY_MOMENTS.includes(input.moment)) throw new MoneyMomentNotAllowedError();
    for (const key of Object.keys(input)) {
      if (!INPUT_KEYS.includes(key)) throw new ServiceInputError(`unexpected field ${String(key).slice(0, 40)}`);
    }
    if (typeof input.creatorProfileId !== 'string' || !UUID.test(input.creatorProfileId)) {
      throw new ServiceInputError('creatorProfileId must be a uuid');
    }
    if (typeof input.submissionId !== 'string' || !UUID.test(input.submissionId)) {
      throw new ServiceInputError('submissionId must be a uuid');
    }
    if (typeof input.market !== 'string' || !MARKET.test(input.market)) {
      throw new ServiceInputError('market must be an iso 3166-1 alpha-2 code');
    }
    const ip = parseIp(input.observedIp); // throws InvalidIpError

    const creatorProfileId = input.creatorProfileId.toLowerCase();
    const submissionId = input.submissionId.toLowerCase();

    // 2. the raw payload is processed once and then disposed, whatever happens next.
    let device;
    try {
      device = processDevicePayload(input.rawDevicePayload, this.#keyRing);
    } finally {
      if (input.rawDevicePayload && typeof input.rawDevicePayload === 'object') {
        disposeRawPayload(input.rawDevicePayload);
      }
    }
    const ipDigest = this.#keyRing.digest('ip', `${ip.version}:${ip.value}`, device.hashKeyId);

    // 3. a repeat of a known submission returns the stored decision. it is never
    //    recomputed, so a feed that changed state between two tries cannot turn an
    //    honest retry into a conflict. a different device or address is rejected.
    const existing = await this.#readExisting(submissionId);
    if (existing) {
      return this.#replay(existing, { creatorProfileId, moment: input.moment, device, ipDigest, submissionId });
    }

    // 4. policy for the market, falling back to DEFAULT. the market is not kept.
    let policy = null;
    try {
      policy = await this.#policyStore.getPolicy(this.#policyVersion, input.market);
    } catch {
      policy = null; // a read failure is an unavailable policy; the message is not kept
    }
    if (!policy) throw new PolicyUnavailableError();

    // 4b. the embargoed-territory list. loaded independently of the market
    // policy: this check runs regardless of corridor strictness, so an
    // unavailable list is treated the same way an unavailable mandatory feed
    // is, not folded into PolicyUnavailableError (the market policy did load).
    let territoryConfig = null;
    try {
      territoryConfig = await this.#territoryListStore.getEmbargoList(this.#territoryListVersion);
    } catch {
      territoryConfig = null;
    }
    if (!territoryConfig) throw new PolicyUnavailableError();

    // 5. network evidence. an adapter failure is treated as unavailable feeds.
    let network = null;
    let adapterVersion = 'adapter-unavailable';
    try {
      network = assertIpIntelligenceResult(
        await this.#ipAdapter.lookup(input.observedIp, { moment: input.moment }),
      );
      adapterVersion = network.adapterVersion;
    } catch (error) {
      if (error instanceof InvalidIpError) throw error;
      network = null; // includes a result that broke the contract
    }

    // 6. decide, then record atomically.
    const decision = evaluateChecks(policy, device, network, territoryConfig);
    const row = {
      creatorProfileId,
      moment: input.moment,
      submissionId,
      deviceHash: device.deviceHash,
      ipDigest,
      hashKeyId: device.hashKeyId,
      collectionStatus: device.collectionStatus,
      deviceFeatures: device.features,
      processorVersion: device.processorVersion,
      policyVersion: policy.policyVersion,
      selectedChecks: decision.selectedChecks,
      outcome: decision.outcome,
      reasonCodes: decision.reasonCodes,
      networkFlags: network ? toStoredNetworkFlags(network) : unevaluatedFlags(),
      geoEvidence: network
        ? toStoredGeoEvidence(network)
        : { country_code: null, coverage: 'none', source_id: null, dataset_version: null },
      adapterVersion,
    };

    let stored;
    try {
      stored = await this.#recorder.record(row);
    } catch (error) {
      // a concurrent request may have recorded this submission first.
      if (error?.code === '22023') {
        const raced = await this.#readExisting(submissionId);
        if (raced) return this.#replay(raced, { creatorProfileId, moment: input.moment, device, ipDigest, submissionId });
        throw new ReplayMismatchError();
      }
      throw new CheckNotRecordedError(error);
    }

    const result = {
      submissionId,
      outcome: stored.outcome,
      reasonCodes: [...stored.reason_codes],
      policyVersion: stored.policy_version,
      selectedChecks: [...stored.selected_checks],
      replayed: stored.replayed === true,
    };
    this.#emit(result);
    return result;
  }

  async #readExisting(submissionId) {
    try {
      return await this.#recorder.findExisting(submissionId);
    } catch (error) {
      throw new CheckNotRecordedError(error);
    }
  }

  #replay(existing, { creatorProfileId, moment, device, ipDigest, submissionId }) {
    const same =
      existing.creatorProfileId === creatorProfileId &&
      existing.moment === moment &&
      existing.deviceHash === device.deviceHash &&
      existing.ipDigest === ipDigest;
    if (!same) throw new ReplayMismatchError();
    const result = {
      submissionId,
      outcome: existing.decision.outcome,
      reasonCodes: [...existing.decision.reasonCodes],
      policyVersion: existing.decision.policyVersion,
      selectedChecks: [...existing.decision.selectedChecks],
      replayed: true,
    };
    this.#emit(result);
    return result;
  }

  #emit(result) {
    if (!this.#telemetry) return;
    try {
      // ids, outcome and reason codes only: no payload, no address, no market.
      this.#telemetry({
        event: 'payout_signal_check',
        submissionId: result.submissionId,
        outcome: result.outcome,
        reasonCodes: result.reasonCodes,
        policyVersion: result.policyVersion,
        replayed: result.replayed,
        serviceVersion: SERVICE_VERSION,
      });
    } catch { /* telemetry must never change a decision */ }
  }
}
