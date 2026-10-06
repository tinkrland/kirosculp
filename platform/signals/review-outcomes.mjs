// review-outcomes.mjs
//
// the vocabulary for how a human review of a needs_review hold may end (batch 8,
// owner addendum item 3): release, or a stranded-funds hold. never an account
// action. the payout workflow that owns the review surface imports this so the
// two outcomes are spelled one way, and so an account action cannot be smuggled
// in as a review result.
//
// this module stores nothing and performs nothing. no review surface exists yet;
// that belongs to the leg that builds the review queue. it only defines what a
// review outcome is allowed to be.
//
// two constraints the queue inherits from the owner addendum, recorded here so
// they are found by whoever builds it:
//   - a one-off hit never permanently flags a creator. pattern is read at review
//     time (admin_get_embargo_pattern); it is behavior, territory is context.
//   - the queue must not become auto-fail by backlog. a needs_review that waits
//     long enough and is then treated as a rejection is a fail nobody decided.
//     an unreviewed hold stays a hold.

/** the only two ways a review of this kind ends. */
export const REVIEW_OUTCOMES = Object.freeze(['release', 'stranded_funds_hold']);

/** things a review of a signal hold must never produce. */
const ACCOUNT_ACTIONS = Object.freeze([
  'ban', 'suspend', 'terminate', 'close', 'freeze', 'flag', 'blacklist', 'reject', 'deny', 'fail',
  'trust_downgrade', 'permanent_flag', 'auto_reject', 'expire_to_fail',
]);

export class InvalidReviewOutcomeError extends Error {
  constructor(reason) {
    super(`not a valid review outcome: ${reason}`);
    this.name = 'InvalidReviewOutcomeError';
    this.code = 'invalid_review_outcome';
  }
}

/**
 * @param {unknown} outcome
 * @returns {'release' | 'stranded_funds_hold'}
 */
export function assertReviewOutcome(outcome) {
  if (typeof outcome !== 'string') throw new InvalidReviewOutcomeError('must be a string');
  if (REVIEW_OUTCOMES.includes(outcome)) return /** @type {any} */ (outcome);
  const normalized = outcome.toLowerCase().replace(/[^a-z_]+/g, '_');
  if (ACCOUNT_ACTIONS.some((a) => normalized === a || normalized.includes(a))) {
    throw new InvalidReviewOutcomeError('an account action is not a review outcome');
  }
  throw new InvalidReviewOutcomeError('unknown outcome');
}

/** true only for a value that names an account action, not for any invalid value. */
export const isAccountAction = (outcome) => {
  if (typeof outcome !== 'string') return false;
  const normalized = outcome.toLowerCase().replace(/[^a-z_]+/g, '_');
  return ACCOUNT_ACTIONS.some((a) => normalized === a || normalized.includes(a));
};
