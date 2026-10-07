---
title: dpms status of the three payout provider candidates
summary: firecrawl research (2026-10-07) into how stripe, payoneer and paypal classify dealers in jewels, precious metals and stones, what each requires from sculptura as a dpms marketplace, and the demo-mode testing story per provider.
---

# dpms provider research: stripe, payoneer, paypal

research pass of 2026-10-07, via firecrawl (web search plus scrape, alexandria's
developer index consulted). the question: sculptura is a dpms (dealer in
precious metals and stones) marketplace, which providers treat that category as
prohibited, restricted or pre-approval, and what does each require before real
money. urls cited inline; sources recorded in `research/sources/sources.jsonl`.

the one-line answer: **none of the three prohibits dpms outright, but all
three make it an approval conversation rather than a self-serve signup, and
payoneer's checkout product prohibits the category entirely while its mass
payout service remains an open application question.**

## stripe: restricted, not prohibited

stripe's restricted businesses list places "high-value goods, precious metals
and stones" under the "nonfiat currency and stored value" heading of
**restricted** businesses (not prohibited). stripe's own support faq states
businesses on the prohibited and restricted list may be supported "with
explicit prior approval", so the path exists: apply, disclose the dpms nature,
get written approval before relying on it.

one jurisdiction landmine: **india's prohibited list includes "cross-border
jewelry sales" outright.** this is a buyer-payment/acceptance constraint on
indian accounts, not a payout constraint on foreign platforms, but it matters
for any plan to route indian buyer payments through a stripe account domiciled
in in, and it reinforces that in stays a strict-market payout case with its own
rail (razorpay remains the regional candidate).

payout geography, from docs.stripe.com:

- **cross-border payouts**: platforms based in the us, uk, eea, ca or ch can
  pay connected accounts anywhere in those regions. outside that region set
  there is no self-serve option; stripe points you at sales or global payouts.
- **global payouts**: currently us/uk platforms only, with most of the eea in
  private preview. sends to recipients in a wide supported-country list using
  just an email address, with the platform managing its own compliance (vs
  cross-border payouts shifting it to stripe's money-transmitter license).
  this distinction matters for which entity holds the dpms compliance duty.

demo mode: fully covered. stripe test mode is self-serve, and localstripe (the
self-hosted emulator already in our stack) covers offline development. no
action needed.

## paypal: pre-approval required

paypal's acceptable use policy puts "operating as a dealer in jewels,
precious metals and stones" in the **pre-approval table** (the same table as
charities, money-service businesses and investment sellers). like stripe, the
category is serviced only after paypal's sales/risk team approves.

the payouts api is well documented: batch payout creation, item status
tracking, webhooks, and a per-country feature matrix (last updated 2026-09-10)
distinguishing send-capable countries from receive-only countries, with venmo
payouts limited to us recipients. send capability is limited to a subset of
markets, so the matrix must be consulted per corridor when paypal is the
candidate rail.

demo mode: fully covered. paypal's sandbox at developer.paypal.com is
self-serve with no application gating. no action needed.

## payoneer: the category is prohibited in checkout, open in mass payouts

the most important finding of the pass, with a crucial product distinction:

- **payoneer checkout (their buyer-payments product) prohibits the category
  outright.** the prohibited list bans "precious metals and loose stones
  (e.g., gold, silver, gems, diamonds)" and "high priced products where chain
  of custody cannot be verified", under high value goods.
- **the mass payout service is a different product with its own risk review**,
  and sculptura would only ever use mass payouts: buyer payments run on
  sculptura's own rails, and payoneer's role is the gap-filling creator payout
  rail per the rails matrix. so the checkout prohibition does not block the
  mass payout application, but it establishes payoneer's risk posture on the
  category: they watch dpms closely, and the mass payout application should
  disclose the marketplace's dpms nature up front rather than let their review
  discover it.

the **chain-of-custody clause is the strategic connection**: payoneer's stated
concern is high-priced goods whose custody cannot be verified. sculptura's
release chain and tune-log hash chains, plus foundry provenance records,
directly answer that concern with tamper-evidence. the dispute-evidence work
already ruled for hash chains doubles as dpms onboarding evidence for any
provider review, payoneer included. this should be a deliberate point in the
application, not an accident.

mass payout v4 mechanics, from developer.payoneer.com: oauth application
token from client id/secret, payee registration, batch payout submission (up
to 500 payees per call), and webhooks for payee/payout status. this matches
the async prefunded batch model already discussed for the payout leg.

**demo mode: not covered, and there is no localstripe equivalent.** confirmed:
no public self-serve sandbox, no self-hostable emulator, no offline mock exists
anywhere findable. the mass payout v4 sandbox exists but credentials (client
id, client secret, program id) are issued by payoneer only to approved clients.
consequence: a mock payoneer service must be built for demo-mode development,
delegated to a separate agent. outline below.

## demo-mode strategy per provider

| provider | demo story | action |
|---|---|---|
| stripe | test mode + localstripe emulator | none, covered |
| paypal | self-serve sandbox | none, covered |
| payoneer | sandbox gated behind client approval | build a local mock |

## mock payoneer service: spec outline for the implementation agent

goal: a self-hostable localstripe-equivalent for payoneer's mass payout v4
api, so payout-flows and payout-gate integration can be developed and tested
in demo mode without payoneer credentials or approval. sources for the exact
shapes: developer.payoneer.com docs (mass-payouts-v4 getting started,
integration guide) and the public postman collection "payoneer mass payout
api", all scrapeable with firecrawl.

surface to implement, minimum viable:

1. **application token endpoint**: issue/validate the oauth token from client
   id and secret; reject bad credentials like the real service.
2. **payee registration**: register a payee (the creator), return payee id,
   track kyc state transitions (pending, approved, declined) so the kyc
   inheritance path can be tested.
3. **batch payout submission**: accept a payout batch (array of payee id +
   amount + currency, up to 500), debit a configured prefunded balance, reject
   over-balance batches the way a prefunded model would.
4. **payout status**: async state machine (submitted, processing, paid,
   failed) with configurable delay so async settlement behavior is testable.
5. **webhooks**: emit payee-status and payout-status events to a registered
   endpoint, with replay support.

constraints: the mock must never be pointed at payoneer production or sandbox
urls; it emulates only, and clearly labels its responses as mock. it must be
config-driven (delays, failure rates, kyc outcomes) so the payout leg can test
both happy and failure paths. portability rule applies: reproducible setup
scripts in the consolidated repo, never sandbox-only.

## open application questions, per provider

- **payoneer**: does the mass payout risk review accept a dpms marketplace
  paying creator earnings (payload is earnings, not goods)? disclose dpms up
  front; present hash-chain provenance as custody evidence.
- **paypal**: what does dpms pre-approval require from the platform, and does
  the approval extend to payouts or only to buyer acceptance?
- **stripe**: what does explicit prior approval for the restricted dpms
  category require, and does it affect cross-border payouts vs global payouts
  (who holds the compliance duty)?

none of these block demo-mode work; all three block live money and should be
resolved in the order the rails matrix assigns each provider a real corridor.
