# Country rollout

Creator signup geography and physical delivery geography are separate.

## Creator signup

Intended scope: creators may sign up wherever the selected connected-payout provider supports the required account type, subject to legal and provider restrictions. Full KYC is not intentionally required at signup. It is required before payout release at the configured threshold, or earlier when a provider or legal requirement says so.

See:

- [`creator-onboarding.md`](creator-onboarding.md)
- [`creator-payout-policy.json`](creator-payout-policy.json)

## Shipping

Shipping is deny-by-default. A destination does not become live because a carrier advertises worldwide delivery or a manufacturer says it ships internationally.

### First intended cohort

- United states
- Canada (high-ppp priority)
- United kingdom
- Australia (high-ppp priority)
- Germany
- France
- Italy
- Netherlands
- Spain
- Belgium
- Austria
- Switzerland (high-ppp priority)
- Sweden (high-ppp priority)
- Denmark (high-ppp priority)
- Ireland
- New zealand


### Regional casting research hold

- Japan
- South korea
- Singapore
- United arab emirates
- Norway (high-ppp priority and outside the EU)

### Possible v3 candidate

- Israel (Middle East cluster; Convention contracting state, but still requires a separately approved route)

These markets become more practical when Sculptura has suitable distributed casting zones near them. Until then, they remain research-only and require route, hallmarking, carrier, customs, tax, insurance, returns, and consumer review.

All listed countries are product targets, not live promises. Entries begin as `planned` or `research` with delivery capabilities disabled. Moving a country to `pilot` or `live` requires cited evidence, an approved production route, and a named approval.

See:

- [`shipping-markets.json`](shipping-markets.json)
- [`shipping-markets.schema.json`](shipping-markets.schema.json)

## Shipping activation sequence

1. Confirm at least one eligible regional manufacturing route
2. Verify material and hallmarking requirements for the article and destination
3. Verify landed-cost, vat/duty, customs-document, and importer handling
4. Verify tracked and insured carrier service plus value limits
5. Establish returns, loss, damage, remake, and refund handling
6. Review destination consumer requirements and buyer terms
7. Approve the route and evidence
8. Enable only the capabilities actually supported
9. Monitor delivery, defect, claim, and landed-cost accuracy

Country support can be paused without deleting its historical approval record.

## Audited implementation reference

**Status: foundation data only**

### Existing source evidence

- No source application consumes `shipping-markets.json` or enforces its route gates.

### What exists now

- The foundation contains market planning data and schemas. Application checkout does not use them.

### Required changes

- Expose approved availability through a trusted server service.
- Deny unsupported destinations before payment and re-check before manufacturing submission.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
