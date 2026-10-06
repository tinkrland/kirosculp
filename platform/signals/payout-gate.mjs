// payout-gate.mjs
//
// the server-side entry contract for the two money moments. transport-agnostic:
// it takes a plain request object and returns a plain result, so the platform
// payout endpoints wrap it in whatever http layer they use. no payout endpoint
// exists in product code yet (only legacy snapshots), so this is the contract the
// payout leg calls, not a duplicate payout flow. it never moves funds.
//
// what the browser may send: a submission id and the device payload. nothing else.
// everything that decides the outcome is derived on the server:
//   - the creator comes from the authenticated session, never from the body
//   - the market comes from the creator's verified payout record, never from the
//     body and never from the request address
//   - the client address comes from the trusted proxy chain, never the leftmost
//     x-forwarded-for entry, which the client controls
//
// what the browser gets back: continue, review, not_yet or hold. never a reason
// code, a flag, a source, a market or an age. telling an attacker which detector
// fired helps them evade it. the full decision goes to the server-side payout
// workflow only.
//
// not_yet (batch 9) is answered before any signal check. a minor creator, or a
// creator resident in a parked market with no rail in an enabled market, has no
// payout path yet. that is roadmap and age state, not fraud, so nothing is
// collected, nothing is recorded and no review is raised. see payout-eligibility.mjs.

import {
  PayoutSignalCheckService, ServiceInputError, MoneyMomentNotAllowedError, PolicyUnavailableError,
  ReplayMismatchError, CheckNotRecordedError,
} from './payout-signal-check.mjs';
import { InvalidIpError, parseIp } from './ip-intelligence.mjs';

/** the only routes that reach the service. everything else is a 404 that touches nothing. */
export const ROUTES = Object.freeze({
  '/payout/onboarding/signals': 'payout_onboarding',
  '/payout/request/signals': 'payout_request',
});

export const MAX_BODY_BYTES = 64 * 1024;
const BODY_KEYS = Object.freeze(['submissionId', 'device']);

/**
 * the client address, taken from the trusted proxy chain.
 *
 * each trusted proxy appends the address it received the connection from, so the
 * rightmost `trustedProxyHops` entries were written by infrastructure we control.
 * the client is the entry just before them. anything to its left is whatever the
 * client chose to send and is ignored. with no trusted proxy the socket address
 * is the only honest answer.
 *
 * @param {{ headers?: Record<string, string | string[] | undefined>, socketAddress?: string }} request
 * @param {{ trustedProxyHops: number }} opts
 * @returns {string | null} canonical text, or null when it cannot be determined
 */
export function clientIpFromTrustedProxy(request, { trustedProxyHops }) {
  if (!Number.isInteger(trustedProxyHops) || trustedProxyHops < 0 || trustedProxyHops > 10) {
    throw new TypeError('trustedProxyHops must be an integer from 0 to 10');
  }
  let candidate;
  if (trustedProxyHops === 0) {
    candidate = request.socketAddress;
  } else {
    const raw = request.headers?.['x-forwarded-for'];
    const joined = Array.isArray(raw) ? raw.join(',') : raw;
    if (typeof joined !== 'string') return null;
    const entries = joined.split(',').map((s) => s.trim());
    if (entries.length < trustedProxyHops) return null; // the chain is shorter than our proxies
    candidate = entries[entries.length - trustedProxyHops];
  }
  if (typeof candidate !== 'string') return null;
  try {
    parseIp(candidate);
  } catch {
    return null;
  }
  return candidate;
}

/** a tiny json reader with a size cap. returns null for anything that is not a json object. */
function readJsonObject(rawBody) {
  const text = typeof rawBody === 'string' ? rawBody : Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : null;
  if (text === null || Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) return null;
  try {
    const value = JSON.parse(text);
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

const reply = (status, body, decision = null) => ({ status, body, decision });

/** what the browser is told. one word, no reasons. */
const toClientStatus = (outcome) => (outcome === 'pass' ? 'continue' : 'review');

/**
 * @param {object} deps
 * @param {PayoutSignalCheckService} deps.service
 * @param {(request: object) => Promise<null | { creatorProfileId: string | null }>} deps.authenticate
 *   resolves the session. null means no valid session. a null creatorProfileId means a signed-in non-creator.
 * @param {(creatorProfileId: string) => Promise<string | null>} deps.resolveMarket
 *   the creator's rail market from the verified payout record, or null when there is none yet.
 *   a throw is an outage and holds. null is a normal state.
 * @param {(creatorProfileId: string) => Promise<null | { residenceMarket: string | null,
 *   ageAttestation: null | { status: 'adult' | 'minor', majorityDate?: string } }>} deps.resolveCreatorFacts
 *   the age attestation and residence the server holds for this creator. null means neither is on file.
 * @param {{ evaluate: (facts: object) => Promise<{ status: 'proceed' } | { status: 'not_yet', cause: string }> }} deps.eligibility
 *   see payout-eligibility.mjs. required: a gate without it would skip the age and parked-market park silently.
 * @param {(request: object) => string | null} deps.clientIp
 * @param {(event: object) => void} [deps.telemetry]
 */
export function createPayoutSignalGate({
  service, authenticate, resolveMarket, resolveCreatorFacts, eligibility: eligibilityEvaluator, clientIp, telemetry = null,
}) {
  for (const [name, value] of Object.entries({
    service, authenticate, resolveMarket, resolveCreatorFacts, eligibilityEvaluator, clientIp,
  })) {
    if (typeof value !== 'object' && typeof value !== 'function') throw new TypeError(`${name} is required`);
  }
  const emit = (event) => {
    if (!telemetry) return;
    try { telemetry(event); } catch { /* telemetry never changes a result */ }
  };

  return {
    /**
     * @param {{ method?: string, path?: string, headers?: object, rawBody?: string | Buffer, socketAddress?: string }} request
     * @returns {Promise<{ status: number, body: object, decision: null | object }>}
     *   `body` is for the browser. `decision` is for the server-side payout workflow.
     */
    async handle(request) {
      // 1. route: only the two money-moment paths reach anything.
      const moment = Object.hasOwn(ROUTES, request?.path) ? ROUTES[request.path] : null;
      if (moment === null) return reply(404, { status: 'not_found' });
      if (request.method !== 'POST') return reply(405, { status: 'method_not_allowed' });

      // 2. who is calling, from the session.
      let session = null;
      try { session = await authenticate(request); } catch { session = null; }
      if (!session) return reply(401, { status: 'unauthenticated' });
      if (typeof session.creatorProfileId !== 'string' || session.creatorProfileId.length === 0) {
        return reply(403, { status: 'forbidden' });
      }

      // 3. the body may carry a submission id and the device payload, and nothing else.
      const body = readJsonObject(request.rawBody);
      if (body === null) return reply(400, { status: 'invalid_request' });
      if (Object.keys(body).some((key) => !BODY_KEYS.includes(key))) return reply(400, { status: 'invalid_request' });
      if (typeof body.submissionId !== 'string') return reply(400, { status: 'invalid_request' });
      const device = Object.hasOwn(body, 'device') ? body.device : null;

      // 4. everything that selects or weighs a check comes from the server.
      //    the rail market is the market of the verified payout record. null means the
      //    creator has no verified rail yet, which is a normal state and not an error.
      //    only a lookup that throws is our outage.
      let market;
      try { market = await resolveMarket(session.creatorProfileId); } catch {
        emit({ event: 'payout_signal_gate', result: 'hold', cause: 'market_lookup_failed', moment });
        return reply(503, { status: 'hold' });
      }
      const railMarket = typeof market === 'string' ? market : null;

      // 4b. "not yet", before any signal check. a minor creator and a creator resident in
      //     a parked market have no payout path yet. that is roadmap and age state, not
      //     fraud: no signal check runs, nothing is recorded, no needs_review, no trust
      //     input. the browser hears "not_yet", never a cause.
      let eligibility;
      try {
        const facts = await resolveCreatorFacts(session.creatorProfileId);
        eligibility = await eligibilityEvaluator.evaluate({
          residenceMarket: facts?.residenceMarket ?? null,
          railMarket,
          ageAttestation: facts?.ageAttestation ?? null,
        });
      } catch (error) {
        // the facts or the matrix could not be read. this is our outage, so hold and retry.
        // it is never turned into "not_yet" (which would tell a creator something untrue)
        // and never into a pass.
        emit({ event: 'payout_signal_gate', result: 'hold', cause: error?.code ?? 'eligibility_unavailable', moment });
        return reply(503, { status: 'hold' });
      }
      if (eligibility.status === 'not_yet') {
        emit({ event: 'payout_signal_gate', result: 'not_yet', cause: eligibility.cause, moment });
        return reply(200, { status: 'not_yet' }, { eligibility: 'not_yet', cause: eligibility.cause });
      }

      if (railMarket === null) {
        // without a market the mandatory checks are unknown. holding is the only
        // answer that is neither a silent pass nor a guess.
        emit({ event: 'payout_signal_gate', result: 'hold', cause: 'market_unknown', moment });
        return reply(503, { status: 'hold' });
      }
      const observedIp = clientIp(request);

      // 5. decide.
      try {
        const decision = await service.check({
          creatorProfileId: session.creatorProfileId,
          moment,
          submissionId: body.submissionId,
          observedIp,
          rawDevicePayload: device,
          market,
        });
        emit({ event: 'payout_signal_gate', result: 'decided', moment, submissionId: decision.submissionId, outcome: decision.outcome });
        return reply(200, { status: toClientStatus(decision.outcome), submissionId: decision.submissionId }, decision);
      } catch (error) {
        return mapError(error, moment, emit);
      }
    },
  };
}

function mapError(error, moment, emit) {
  if (error instanceof ServiceInputError) {
    emit({ event: 'payout_signal_gate', result: 'rejected', cause: 'invalid_input', moment });
    return reply(400, { status: 'invalid_request' });
  }
  if (error instanceof ReplayMismatchError) {
    emit({ event: 'payout_signal_gate', result: 'rejected', cause: 'replay_mismatch', moment });
    return reply(409, { status: 'conflict' });
  }
  if (error instanceof InvalidIpError) {
    // the client address could not be determined. nothing was decided, so hold.
    emit({ event: 'payout_signal_gate', result: 'hold', cause: 'client_ip_unavailable', moment });
    return reply(503, { status: 'hold' });
  }
  if (error instanceof PolicyUnavailableError || error instanceof CheckNotRecordedError) {
    emit({ event: 'payout_signal_gate', result: 'hold', cause: error.code, moment });
    return reply(503, { status: 'hold' });
  }
  if (error instanceof MoneyMomentNotAllowedError) {
    emit({ event: 'payout_signal_gate', result: 'rejected', cause: 'not_a_money_moment', moment });
    return reply(404, { status: 'not_found' });
  }
  // anything unexpected: hold, and record only the class.
  emit({ event: 'payout_signal_gate', result: 'hold', cause: 'unexpected', errorClass: error?.name ?? 'Error', moment });
  return reply(503, { status: 'hold' });
}
