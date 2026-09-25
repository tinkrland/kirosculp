# partner brief: a one-pager for casting partners

the acquisition questions in [acquire.md](acquire.md) are written for us. this page is written for them: paste-ready prose that explains what sculptura is, why the questions are worth answering, and what happens with the answers. the tone target is a serious buyer who did their homework, not a startup asking a foundry to design its product for free.

## how to use it

send one email per partner, using the intro below plus only the question groups that partner can actually answer (casting partner, pattern material manufacturer, or alloy supplier; the question lists are in [acquire.md](acquire.md)). never send the internal contradiction table. where a specific open value motivated a question, the follow-up note for us is in [square brackets] below and must be stripped before sending.

## paste-ready intro

we run sculptura, a jewelry platform where independent creators design metal-only pieces in a browser studio and buyers order them cast in precious metal. we are not a foundry and we are not trying to become one. our job is the design side: geometry, validation, orders, and routing cast-ready work to partners like you.

every design that reaches your intake will have already passed a deterministic validation pass on our side: watertight meshes, wall thickness, clearances, engraving limits, and bounding dimensions checked against the process rules we hold for your shop before the order is ever placed. we bring the pattern (castable resin or wax, printed to your spec) or an stl, whichever your intake prefers, and every repeat order rebinds to the exact validated design revision, so there are no surprises between the quote and the pour.

published design guidelines from casting houses and material suppliers cover most of what we need, and we follow them. a handful of numbers genuinely differ between reputable published sources: silver casting shrinkage alone is published anywhere from under one percent to over two, and minimum hole diameters and finishing erosion vary by a similar spread. rather than average those into a guess, we would rather hold your shop's actual numbers, because when a piece fails, it fails at your bench, not in a spec sheet.

that is what we are asking for: your per-alloy numbers for the items below, in whatever form you have them. if the honest answer is "we do not support that", that is a full and useful answer, and we will design around it.

## what happens with their answers

each answer becomes a rule in a versioned, per-partner validation profile that gates orders before they reach the partner: dated, attributed, and scoped to their shop and process. nothing a partner tells us is shared with another partner. answers are re-confirmed on a yearly cadence before their values stay active, and any rule without a dated source stays `drafted` and never gates a real release. [this is the acquire.md evidence-handling contract, stated to them plainly so it reads as rigor rather than extraction.]

## the asks, phrased for the email

casting partners:

- which pattern materials do you accept, and do you take externally printed castable resin or wax, or only your own printing?
- per alloy you cast: your minimum wall, wire or prong, hole diameter, and engraved detail limits. [pulls the single-source clearance and hole values, and contradiction-005, into a shop's number]
- the shrinkage compensation you apply or expect the model to apply, and your tolerance on final dimensions. [contradictions 002 and 010: published vs empirical shrinkage]
- who places sprues and your sprue rules relative to section thickness.
- your hollow piece policy: drain hole count and diameter, shelling thickness. [resolved in principle by contradiction-004, but per-shop numbers unpublished]
- your burnout and investment schedule per pattern material, and any incompatibilities.
- finishes you offer per alloy and how each finish affects minimum detail survival. [contradiction-006 erosion spread]
- your defect and remake policy when a piece fails casting through a geometry problem.
- whether you support self-serve api ordering or manual submission.

pattern material manufacturers and alloy suppliers get their groups from [acquire.md](acquire.md) unchanged; the intro above works for both with one sentence swapped (see below).

## intro swap for material and alloy partners

for resin and wax manufacturers, replace the second paragraph of the intro with: "our studio validates each design against the pattern material's limits before it is ever printed, so your material's real feature-survival numbers, dimensional behavior, and burnout requirements become the rules we enforce upstream."

for alloy suppliers: "each design is validated against the alloy's real casting behavior before an order exists, so your certified density, composition, casting temperature range, and solidification shrinkage per grade become the rules we enforce upstream."

## pilot framing, if they ask about volume

be honest and unglamorous: initial volumes are small and deliberate, concentrated in sterling silver rings through lost-wax casting, growing as the validation set proves out. we route by geography, capability, and cost, and shops that give us real numbers get orders engineered to pass the first time, which is worth more to a bench than volume that reworks. never promise volumes, exclusivity, or timelines.
