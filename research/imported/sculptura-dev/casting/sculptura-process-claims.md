# sculptura's own process claims: the primary source

research: 2026-09-11 · source: kqrla/sculptura.dev origin/main: src/pages/About.jsx, src/pages/PublishArtifact.jsx, src/pages/admin/AdminIdea.jsx, src/pages/SizeGuide.jsx, src/components/home/HeroSection.jsx · status: cited (repo-internal, verbatim)

## thesis

sculptura's customer-facing process story (in the lovable app source, origin/main) is: cad upload → 3d-printed pattern in **castable wax or castable resin** → plaster investment → kiln burnout → metal pour (silver, brass, bronze, gold) → breakout → finish → ship. the same repo explicitly defers its published tolerances (`"wall thickness tolerances, sprue placement, castable geometry limits"`) to a **coming-soon sizing guide**: which is exactly the gap `casting-tolerances.json` must fill with cited numbers before any order flows. every downstream process note cites against this baseline: what sculptura *promises* is fixed; what it can *deliver* is a matter of cited process research.

## the promised pipeline (verbatim, About.jsx `"lost wax casting, modernised"`)

1. `"creator uploads a cad file (stl, step, obj)."`
2. `"we 3d print a pattern in castable wax or castable resin."`
3. `"the pattern is invested in plaster, then burned out in a kiln."`
4. `"molten metal is poured into the resulting cavity."`
5. `"the cast is broken out, sprues cut, surface filed and polished."`
6. `"quality check, packaging, ships worldwide."`

plus: `"every artifact is cast in solid silver, brass, bronze, or gold using lost wax casting from a 3d printed wax pattern. the same technique used by goldsmiths for thousands of years."` (About.jsx body)

and the large-piece fallback: `"for larger sculptural pieces we use sand casting from the same 3d printed pattern. lower cost on big pours, slightly less detail."` (About.jsx)

## internal production plan (verbatim, AdminIdea.jsx: admin seeding doc)

pattern material ranking: `"castable wax resin (best surface, best detail)"` vs `"castable photopolymer resin (cheaper, slightly more cleanup)"`. plan text:

> 3d print the pattern in one of: castable wax resin (best surface, best detail); castable photopolymer resin (cheaper, slightly more cleanup)
> invest the pattern in plaster or sand depending on piece size
> burn out the wax/resin in a kiln, leaving a hollow cavity
> pour molten metal (silver, brass, bronze, gold) into the cavity
> break out, cut sprues, file, polish, finish
> qc, package, ship

lost wax over direct metal printing (AdminIdea.jsx): surface `"excellent after polish"` vs `"grainy, needs heavy post-processing"`; metal options `"almost any alloy"` vs limited; unit cost at low volume low vs very high; precious metals "trivial" vs `"rare and expensive"`.

## flow language elsewhere

- `"after a purchase, the design is sent to the platform's affiliated manufacturer, resin printed, and then cast in metal using the lost wax casting method."` (PublishArtifact.jsx)
- store positioning: `"cad to metal"` / `"from cad to metal"` (HeroSection.jsx), `"we handle production: when a buyer orders, sculptura routes to a manufacturing partner and ships directly to them"` (lovable app marketing sections, 2026-09-11 browse)

## the explicit gap (verbatim, SizeGuide.jsx)

> a full sizing and creation guide is coming soon. it will cover everything our pilot-affiliated manufacturers currently support - from ring sizing and wall thickness tolerances to surface detailing, sprue placement, and castable geometry limits - as well as the capabilities we plan to add in future program phases.

this is the project's own statement that the numbers do not exist publicly yet. the validation chain must therefore come from independent cited process research (see lost-wax-process.md, pattern-printing.md, tolerances-and-finishing.md): never from marketing copy, never from inference.
