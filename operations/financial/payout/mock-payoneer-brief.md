---
title: implementation brief: mock payoneer mass-payout v4 service
summary: standalone handoff brief for building a localstripe-style self-hosted emulator of payoneer's mass payout v4 api, so sculptura's payout leg can be developed in demo mode without payoneer credentials or approval.
---

# brief: mock payoneer mass-payout v4 service

this is a complete, standalone brief. an implementing agent that has read only
this document (plus the cited payoneer docs) can build the service without
further context. it is handed off deliberately: the mock is built by a separate
agent, not by the payout leg itself.

## 1. goal and background

sculptura's payout leg needs a demo-mode stand-in for payoneer's mass payout
service. the real service has no public sandbox: credentials (client id,
client secret, program id) are issued only to approved payoneer clients, and no
self-hostable emulator exists anywhere. research record:
`operations/financial/payout/dpms-provider-research.md` (commit adf510a).

the mock is **demo-mode infrastructure only**. it exists so that payee
registration, kyc-state inheritance, batch payout submission, async
settlement, and webhook handling can be built and tested before any payoneer
application or approval exists. it must never be pointed at payoneer
production or sandbox urls, and it must never be presented as provider
behavior. every response it emits is labeled mock.

## 2. the localstripe precedent

model the design on [localstripe](https://github.com/adrienverge/localstripe)
(adrienverge/localstripe, mit-licensed python server, already the precedent in
this repo's mock-finance-flow decision). what localstripe is, per its readme:

- "a fake but stateful stripe server that you can run locally, for testing
  purposes."
- not a library: a **real server** listening on a local port (localstripe
  uses 8420), accepting regular stripe api requests, so any language can call
  it with the provider's own sdk or plain http.
- **stateful**: created objects persist and affect later requests (create a
  customer, get the customer back).
- **customizable webhooks** via a special api route, so tests can trigger and
  inspect events.
- packaged for one-command runs (pip install, or a docker image), with no
  configuration required for a first run.

copy that architecture: a standalone stateful http server implementing the
provider's own api surface, runnable with one command, with a control route
for driving scenarios. two localstripe limitations do not carry over, and
one is the reason this build exists: localstripe supports no stripe connect,
so the payout/connected-account semantics this repo needs have no emulator.
the mock payoneer service covers exactly the product surface its consumers
need, not the whole provider.

also inherit the boundary already ruled in
`operations/financial/mock-finance-flow.md`: the mock sits behind a server-side
adapter; sculptura's own ledger remains the authoritative record; a mock api
object is not a regulated balance, a provider-backed account, or a bank
position. the mock never computes sculptura fees, eligibility, or thresholds;
it only plays the provider.

## 3. the payoneer v4 surface to emulate

source of truth for shapes: developer.payoneer.com docs, "mass payouts v4"
getting-started and integration guide, plus the public postman collection
("payoneer mass payout api"). scrape them with firecrawl before coding and pin
the exact request/response shapes to what the docs show, not to assumptions.
the structure to implement:

### authorization
- application token request from client id and client secret; token revocation.
- reject bad credentials the way the real service would (401, error body in
  the documented error format).
- a program id identifies the client. configuration supplies the demo values;
  the mock accepts any configured set and rejects others.

### payee management (payee registration)
- register a payee (the sculptura creator), returning a payee id.
- the real flow redirects the payee through payoneer-hosted kyc. the mock
  models this as an internal kyc state machine: pending, approved, declined.
  this matters because sculptura's payout gate inherits the provider kyc
  result and records it as a legal gate, never a trust input; the mock must
  let the payout leg test that inheritance.
- a control route (the localstripe "special api route" idea) forces kyc
  outcomes per payee so tests can drive both paths deterministically.

### payouts (batch submission)
- submit a payout batch: an array of payee id, amount, currency; the real
  service takes up to 500 payees per call.
- the real model is prefunded: the client maintains a balance with payoneer,
  and payouts draw it down. the mock implements a configurable prefunded
  balance, debited at submission; over-balance batches are rejected the way a
  prefunded provider would reject them.
- per-item and per-batch status, retrievable: submitted, processing, paid,
  failed, plus the cancel state.

### webhook notifications
implement the documented notification vocabulary, which is the integration's
real test surface:

- payee status: approved, declined.
- registration status: bank, account/card, entity mismatch.
- payout status: payment request received, payment request accepted,
  account/card loaded, load money to bank, failed bank transfer, cancel
  payout.

emit them as signed http calls to a registered endpoint, with replay support
(the control route re-emits any past event). webhook security in the real
service follows its documented security protocols section; emulate a simple
signature scheme and say so in the readme, rather than inventing parity.

## 4. behavior contract

- **stateful**: payees, tokens, balances, and payout states persist for the
  server's lifetime and affect subsequent requests.
- **async**: payout state transitions happen on configurable delays (default:
  fast enough for tests), so async settlement is testable. state is pollable
  and webhook-notified.
- **failure-injectable**: config drives failure rates and specific outcomes
  (kyc decline, failed bank transfer, cancel) so the payout leg can test
  every negative path from mock-finance-flow: declined, expired, duplicated,
  out-of-order, failed, cancelled.
- **deterministic when asked**: zero-delay, fixed-outcome mode for ci.
- **currency-realistic**: accept usd and eur (the two payout currencies in
  creator-payout-policy.json); amounts are decimal strings, never floats.

## 5. constraints

- never hardcode or contact any payoneer url, production or sandbox. the mock
  binds localhost; base urls come from configuration.
- every response body carries a `mock: true` marker field alongside the
  emulated shape, and the readme states plainly what is emulated versus
  guessed. where the docs are ambiguous, note it; do not silently invent
  parity.
- portability rule: reproducible setup (one-command run, docker image or
  equivalent, pinned deps, setup script) committed in the consolidated repo.
  nothing may live only in a sandbox. the repo is the source of truth.
- no real keys, no real payoneer credentials anywhere, ever. demo values are
  obviously fake and committed.
- gate files (package.json scripts, scripts/*.mjs that gates run, the
  validate chain) change only with explicit authorization in a brief. this
  brief does not authorize gate-file changes: keep the mock self-contained
  with its own runner and tests.
- language/stack: follow the repo's existing es-module javascript + jsdoc
  convention unless the payout leg's brief says otherwise.

## 6. repo placement and workflow

- work in tinkrland/kirosculp (the drafting workspace), on a dedicated branch
  (suggested name: `mockpayoneer`). one leg per branch: do not mix payout
  policy edits, security-leg files, or unrelated docs into this branch.
  promotion into tinkrland/sculptura happens only when final, by the owner's
  process.
- commit messages: lowercase subject of about 50 chars stating the one idea;
  supporting detail and verification notes in the body.
- all prose in the repo: lowercase (code, schemas, identifiers and external
  names keep their exact case), no emojis, no em dashes. market codes are
  iso 3166-1 alpha-2; say "market" or "territory", never "country", in
  user-facing strings and data schemas.

## 7. acceptance criteria

the mock is done when the payout leg can run this full demo cycle against it,
end to end, with no payoneer credentials:

1. request an application token with configured demo credentials; bad
   credentials are rejected.
2. register a payee; force kyc approved via the control route; receive the
   approved webhook.
3. register a second payee; force kyc declined; receive the declined webhook;
   a payout to this payee is refused.
4. submit a batch payout to the approved payee; the prefunded balance is
   debited; the async state machine walks submitted to processing to paid;
   every status notification in the documented vocabulary is emitted and
   re-emittable.
5. submit an over-balance batch; it is rejected as a prefunded provider
   would.
6. force a failed bank transfer mid-settlement; the failed-bank webhook
   fires; the batch item lands in failed with the amount refundable to the
   balance.
7. run the same suite in deterministic ci mode with no timing flakiness.

invariants, inherited from mock-finance-flow: entries balance per currency;
no paid payout without a settled debit; no negative balance; duplicate
submissions are idempotent or explicitly rejected, never double-debited.

## 8. sources

- payoneer mass payouts v4 getting started and integration guide:
  https://developer.payoneer.com/docs/mass-payouts-v4-getting-started.html
- payoneer postman collection: payoneer mass payout api on postman
- payoneer checkout prohibited businesses (context, not the payout surface):
  https://checkoutdocs.payoneer.com/docs/checkout-prohibited-and-restricted-businesses
- localstripe (the architecture precedent):
  https://github.com/adrienverge/localstripe
- repo context: operations/financial/mock-finance-flow.md,
  operations/financial/payout/dpms-provider-research.md (adf510a),
  operations/country-rollout/creator-payout-policy.json (5910bcc)
