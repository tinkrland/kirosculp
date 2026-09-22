# country rollout

country support is an operational capability, not a marketing setting.

## default

**deny by default.** no live checkout or delivery is available for a destination unless it has an explicit entry in `markets.json` and every required capability is enabled.

an entry is still not enough by itself. checkout also needs an eligible manufacturing route, a current quote, serviceable shipping, required insurance, and the applicable compliance checks.

## phases

### phase 0: sandbox

no live money and no production delivery. validate releases, quotes, routing, webhooks, and failure handling.

### phase 1: one launch market

one deliberately approved country with one or more confirmed manufacturers, carriers, return handling, insurance rules, payout support, and reviewed buyer terms. do not call this global beta.

### phase 2: a small compatible region

add a small set of countries sharing practical carrier, customs, currency, tax, and consumer-protection handling. every country is still approved individually.

### phase 3: selected country pairs

expand route by route. a country can be supported as a buyer destination without being supported for creator onboarding or manufacturing origin.

### phase 4: broader availability

only after delivery success, claim rates, returns, landed-cost accuracy, payout operations, and partner reliability are evidenced in earlier phases.

## capabilities are separate

"country supported" is too vague to be useful. each market records these independently:

- buyer checkout
- creator onboarding and payout
- manufacturing origin
- delivery
- returns
- insured shipping

this prevents enabling checkout somewhere merely because one carrier happens to deliver there.

## moving a market forward

1. collect route, tax, customs, consumer, shipping, insurance, return, and payout evidence
2. assign the market to a rollout phase
3. obtain named approval and date it
4. enable only the capabilities that were actually approved
5. monitor operational evidence
6. pause individual capabilities without deleting historical approval data when conditions change

`markets.json` intentionally starts with no countries enabled. choosing the launch country is a business and legal decision, not something this repository should guess.
