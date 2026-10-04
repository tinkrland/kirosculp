# on the horizon

this file parks ideas we keep coming back to but have deliberately not scheduled. nothing here is a commitment, a roadmap item, or part of any build order. an entry leaves this file when it earns its own buildplan document with a real decision behind it. until then these are conversations, not plans.

two standing rules for entries here:

- state the economic argument and the honest cost in the same breath. an idea that cannot survive its own cost column does not get a flattering rewrite.
- nothing in this file changes routing, pricing, or the constraint store until it graduates out of it.

## commodity sand casting: delft clay and petrobond foundries

the idea: route some casting volume away from jewelry investment casting bureaus and toward small foundries working in oil-bonded molding media. delft clay and petrobond are the cheap end of the casting world: reusable molding medium, no investment powder, no burnout cycle, no flask infrastructure. small foundries sell silver and gold sand casting at a fraction of bureau pricing, and they compete on casting labor rather than on a jewelry-brand premium.

the economics, in the user's own framing: the bureaus bundle pattern printing, investment casting, and finishing, and price the bundle with a healthy specialist margin. if sculptura routes the casting leg to a small sand casting foundry, that foundry's margin is thin and our margin per piece can rise at the same or lower retail. reduces their margin, increases ours.

honest costs:

- surface finish and fidelity. sand grain limits detail and leaves visible texture; draft angles are needed on every face; filigree, engraving, and prong work are below what the medium reproduces. see the [sand casting process page](manufacturing/processes/sand-casting.md) for the fidelity comparison, roughly plus or minus 0.3 mm against investment casting's plus or minus 0.10 to 0.20 mm.
- post-cast finishing grows. tumbling and polishing labor eats part of the margin gain, and hand finishing a sand-textured surface is worse than finishing an investment cast.
- jewelry scale is awkward. delft clay work favors chunky designs: signets, heavy bands, pendants, sculptural pieces. the delicate end of the offering ladder stays with investment casting.
- the store has no numeric sand casting rules. the process page deliberately harvests none, so a sand casting constraint profile would need its own rule digest section built from actual foundry guidelines and quotes before any route could ever carry it.

what would have to be true before this graduates:

- a constraint profile for sand casting, separate per the process chain model, same as the resin pattern split
- real quotes showing per-piece economics beat the bureau bundle after finishing costs
- a foundry willing to accept printed patterns and ship to our spec
- an honest map of which offering families tolerate the finish

synergy with the entry below: a cheap pattern and a cheap caster together form a fully commodity chain for chunky offerings.

## hybrid route: commodity resin printing shipped straight to the caster

the idea: split the pattern leg from the casting leg. print the burnout resin pattern at a commodity print broker (xometry and similar volume shops, where castable resin and castable wax printing is priced at generic 3d print rates, far below jewelry-specialist rates) and set the delivery address to the casting foundry. sculptura never warehouses the pattern; the foundry receives it, casts, finishes, and ships onward.

the economics: pattern printing is a commodity with brutal price competition, while jewelry bureaus charge specialist prices for the same resin print bundled into casting. splitting the legs means each leg prices at its own market rate instead of one bundled jewelry premium, and our platform margin stays on top of a compressed commodity chain.

honest costs:

- many jewelry casters refuse patterns they did not print, because they warranty the cast. a foundry that accepts third-party patterns is the load-bearing requirement, not the printing price.
- pattern quality risk becomes a cross-vendor contract. the foundry must inspect incoming patterns and reject bad ones, which needs a receiving protocol and a reprint loop (reprint, not buyer return).
- burnout resin specs must match. a broker's castable resin is only castable if the foundry trusts its burnout behavior; the resin pattern constraint profile becomes a contract between two vendors, not one.
- shipping fragility. resin patterns are brittle and a damaged pattern is a lost production day plus a reprint.
- route model implications. a route row is currently one manufacturer profile; this split makes pattern vendor and caster two legs of one route, so the [route matrix](manufacturing/routing/regional-routing.md) and the [route evidence contract](manufacturing/research/topics/order-routing/route-evidence-contract.md) would need multi-leg routes with per-leg accountability.

what would have to be true before this graduates:

- a foundry that accepts third-party patterns at a known acceptance rate
- a broker with real castable resin options and published material specs
- quotes proving the split beats the bundled bureau price after both shipping legs
- release chain records identifying which vendor printed which pattern (provenance per leg)

## what neither idea touches

both entries are manufacturing cost-side plays. they do not touch the two-way pricing model, the studio to platform boundary, or the release chain: the studio still validates geometry, the platform still owns the sale. the [manufacturer layer](manufacturing/manufacturer-layer/README.md) evaluation rules apply to sand casting foundries and pattern brokers exactly as they apply to bureaus: capability claims need evidence before any route trusts them.
