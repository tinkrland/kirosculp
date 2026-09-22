# country rollout

creator signup geography and physical delivery geography are separate.

## creator signup

intended scope: creators may sign up wherever the selected connected-payout provider supports the required account type, subject to legal and provider restrictions. full kyc is not intentionally required at signup. it is required before payout release at the configured threshold, or earlier when a provider or legal requirement says so.

see:

- [`creator-onboarding.md`](creator-onboarding.md)
- [`creator-payout-policy.json`](creator-payout-policy.json)

## shipping

shipping is deny-by-default. a destination does not become live because a carrier advertises worldwide delivery or a manufacturer says it ships internationally.

### first intended cohort

- united states
- canada (high-ppp priority)
- united kingdom
- australia (high-ppp priority)
- germany
- france
- italy
- netherlands
- spain
- belgium
- austria
- switzerland (high-ppp priority)
- sweden (high-ppp priority)
- denmark (high-ppp priority)
- ireland
- new zealand


### regional casting research hold

- japan
- south korea
- singapore
- united arab emirates
- norway (high-ppp priority and outside the eu)

### possible v3 candidate

- israel (Middle East cluster; Convention contracting state, but still requires a separately approved route)

these markets become more practical when sculptura has suitable distributed casting zones near them. until then, they remain research-only and require route, hallmarking, carrier, customs, tax, insurance, returns, and consumer review.

all listed countries are product targets, not live promises. entries begin as `planned` or `research` with delivery capabilities disabled. moving a country to `pilot` or `live` requires cited evidence, an approved production route, and a named approval.

see:

- [`shipping-markets.json`](shipping-markets.json)
- [`shipping-markets.schema.json`](shipping-markets.schema.json)

## shipping activation sequence

1. confirm at least one eligible regional manufacturing route
2. verify material and hallmarking requirements for the article and destination
3. verify landed-cost, vat/duty, customs-document, and importer handling
4. verify tracked and insured carrier service plus value limits
5. establish returns, loss, damage, remake, and refund handling
6. review destination consumer requirements and buyer terms
7. approve the route and evidence
8. enable only the capabilities actually supported
9. monitor delivery, defect, claim, and landed-cost accuracy

country support can be paused without deleting its historical approval record.

## audited implementation reference

**status: foundation data only**

### existing source evidence

- No source application consumes `shipping-markets.json` or enforces its route gates.

### what exists now

- The foundation contains market planning data and schemas. Application checkout does not use them.

### required changes

- Expose approved availability through a trusted server service.
- Deny unsupported destinations before payment and re-check before manufacturing submission.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
