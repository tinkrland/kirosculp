# jcco enterprises

status: drafted

## finding

jcco enterprises (us) is a contract casting supplier to the trade serving
jewelers, designers, artists and jewelry manufacturers, with published
per-metal casting service price pages: gold casting service prices, sterling
silver casting service prices, platinum casting service prices, precious
metal casting service prices.

## conditions and caveats

- published price pages are a rare cost-transparency signal; capture with
  retrieval dates before any modeling use.
- site is dated; current operations need confirmation.
- no public api evidence.

## sources

- [about us](http://www.jccojewelrycastingservices.com/about_us): contract casting to the trade, price page links. (retrieved 2026-10-12)
- [gold casting service prices](https://www.jccojewelrycastingservices.com/gold_casting_service_prices_): labor $11, additions, spot+dwt pricing, alloy colors. (retrieved 2026-10-12)
- [sterling silver casting service prices](https://www.jccojewelrycastingservices.com/sterling_silver_casting_service_prices_): labor $2.75. (retrieved 2026-10-12)
- [platinum casting service prices](https://www.jccojewelrycastingservices.com/platinum_casting_service_prices_): labor $12. (retrieved 2026-10-12)


## captured rate model (2026-10-12)

per-casting labor: gold $11.00, sterling silver $2.75, platinum $12.00
(includes wax injection or customer-supplied wax). additions: $1.00 for
pin/core mold difficulty, $1.00 for attaching sprue to customer waxes;
large pieces per quote. subtraction: small pieces arranged in one mold
as a group price as one casting labor charge. metal charged per dwt at
spot on the day of shipment plus a fabrication charge (formula:
karat factor x spot + fabrication charge = price per dwt). casting
alloys: 10k, 14k, 18k in yellow, white, rose, green gold. separate
published pages exist for rubber mold making and wax injection prices.

this is a fully deterministic published cost structure: fixed labor +
spot metal + fabrication charge, which matches the platform's
quote-driven manufacturing cost line almost exactly.

## how this enters the engine

us casting-house candidate with published per-metal rates; step 0 passes on
process evidence pending rate-page capture.
