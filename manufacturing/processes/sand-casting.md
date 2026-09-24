# sand casting

documented for completeness and partner evaluation, not as a routing candidate. no numeric rules are harvested here: this page is qualitative process knowledge, and any partner capability claim involving sand casting gets evaluated by the [manufacturer layer](../manufacturer-layer/README.md) before it matters.

## how the family works

a reusable pattern (traditionally made of wood, metal, or resin) is pressed into compacted molding sand to form a cavity impression. the mold is made in two halves (cope and drag) so the pattern can be withdrawn, internal channels are cut for metal entry and venting, the halves are closed, and molten metal is poured. once solidified, the sand mold is broken to release the casting. variants include green sand (clay-bonded, damp), chemically bonded sands (furan, phenolic), and lost-foam casting where a disposable foam pattern evaporates in place.

## why it is not the fine jewelry route

- **fidelity:** sand grain impressions limit surface finish and dimensional detail. jewelry-scale filigree, engraving, and prong work sit well below what a sand mold reproduces cleanly, where investment casting holds grades [ct4 to ct6](https://www.bessercast.com/investment-casting-tolerances/) (roughly plus or minus 0.10 to 0.20 mm).
- **geometry:** patterns must be withdrawn from the mold, so draft angles are built into every face, undercuts are impossible without complex cores, and section thickness is driven by metal flow through coarse grain, not by fine detail.
- **materials:** precious metal jewelry casting depends on fine, repeatable reproduction and clean surfaces; sand casting's economics favor larger, coarser pieces in base metals.

## where sculptura may still encounter it

- larger decorative or sculptural metalwork at the edge of the catalog
- regional partners whose general casting marketing includes sand processes alongside jewelry investment casting
- historical or educational comparisons when evaluating what a partner actually offers

## recovered intent: the same printed pattern can go to sand

the sculptura.dev source repo planned a sand-cast fallback from the same 3d printed castable pattern used for investment casting. two statements were recovered:

- from the about page: for larger sculptural pieces, sand casting from the same 3d printed pattern. lower cost on big pours, slightly less detail.
- from the admin production plan: for pieces over roughly 250 g of metal, where investment casting becomes expensive, the pattern is pressed into bonded sand, removed, and metal is poured in. the pattern is invested in plaster or sand depending on piece size.

the economics behind that fallback: investment casting flasks and burnout cycles scale poorly with metal mass, so big sculptural pours get much cheaper in bonded sand, at an accepted detail loss that matters little for sculptural work. the pattern side does not change: castable resin printed by the same studio pipeline feeds either mold family.

routing still treats sand casting as out of scope for v1 fine jewelry. what changes is that it is a recorded fallback candidate for large-piece routing later, not merely a family to recognize. any partner claiming it still faces the same [manufacturer evidence rules](../README.md): sand casting capability does not prove the printed-pattern-to-precious-metal jewelry process.
