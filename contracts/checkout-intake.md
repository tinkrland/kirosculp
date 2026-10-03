# checkout intake contract

## overview

checkout submission is the entry point for release-bound purchase requests. the checkout screen is always reachable for every visitor regardless of destination market. route approval is enforced at submit time on the purchase request, never by hiding checkout per market.

this matches the deny-by-default shipping markets policy: submit-time rejection governs order acceptance, not checkout visibility.

## submit-time validation

when a buyer submits purchase requests, the server validates:

1. **release validation**: every purchase request references a valid, castability-passed design release
2. **variant validation**: selected metal, size, and finish are offered by the release
3. **listing validation**: listing exists and references the correct release
4. **destination routing**: at least one approved manufacturing route exists for the destination

## rejection reason codes

when no approved route exists for a purchase request's destination, the server rejects with a machine-readable reason code:

### `route_not_approved`

the destination country is in the shipping markets file but has no approved routes yet. the market may be in research, planned, or pilot status.

**example**: buyer selects japan (jp), which is in phase_2/research with `approved_routes: []`

**client behavior**: show non-blocking notice on country selection, hard failure at submit

**logged data**: reason code, request_id, destination country_code, utc timestamp

### `route_pending`

the destination country is enabled for checkout but route predicates (manufacturing zone, carrier, customs, insurance) are under review. market status is typically "pilot".

**example**: buyer selects a phase_1 country where evidence is being gathered but routes not yet approved

**client behavior**: show non-blocking notice, hard failure at submit

**logged data**: reason code, request_id, destination country_code, phase_id, utc timestamp

### `market_disabled`

the destination country is not in the shipping markets file at all. this is the default deny-by-default rejection for unmapped destinations.

**example**: buyer selects a country not present in shipping-markets.json

**client behavior**: show non-blocking notice, hard failure at submit

**logged data**: reason code, request_id, destination country_code, utc timestamp

### `listing_route_constraint`

the destination has approved routes, but the specific listing's provenance or routing constraints eliminate every otherwise-eligible route.

**example**: a listing requires eu-origin manufacturing, but the buyer's destination only has non-eu approved routes

**client behavior**: hard failure at submit (no advance notice possible without listing context)

**logged data**: reason code, request_id, destination country_code, listing_id, eliminated_routes, utc timestamp

## rejection response format

```json
{
  "error": {
    "code": "route_not_approved",
    "message": "no approved manufacturing route exists for the selected destination",
    "details": {
      "destination": "JP",
      "request_ids": ["uuid1", "uuid2"],
      "market_status": "research",
      "phase_id": "phase_2"
    }
  }
}
```

## client behavior

### country selection

when a buyer selects a destination country in the checkout address form:

1. client checks shipping-markets.json for the country_code
2. if `approved_routes` is empty or market not found, show non-blocking notice:
   - "this destination isn't enabled yet. we're working on expanding availability."
3. buyer can continue filling the form and reach submit
4. server enforces hard rejection at submit time

**rationale**: no dead-ends after card details are typed. route approval data may be stale on client; server is authoritative.

### submit failure

when the server rejects with a reason code:

1. display the human-readable message from the response
2. log the failure client-side for analytics
3. do not automatically retry with the same request_id
4. if buyer modifies destination and retries, mint new request_ids per the idempotency rule

## demand signal logging

every rejected submit is logged server-side with:

- reason code
- request_id (idempotency key)
- destination country_code
- listing_id
- utc timestamp
- phase_id (if market exists in shipping-markets.json)

denied submits per destination are the demand signal for which markets get route predicate work next. operations reviews these logs to prioritize phase_2 and phase_3 rollout.

## validation rules

reason codes are part of the platform contract and covered by `npm run validate`:

1. **code enum**: reason codes must be one of the four defined codes
2. **response structure**: rejection responses must include code, message, and details
3. **logging schema**: rejection logs must include all required fields

## zero client amounts

no amount computation occurs in this validation path. destination routing is independent of pricing. pricing happens after route approval, not before.

## related contracts

- `contracts/purchase-request.schema.json`: defines request structure and destination format
- `operations/country-rollout/shipping-markets.json`: authoritative deny-by-default market data
- `operations/country-rollout/shipping-markets.schema.json`: market data validation
