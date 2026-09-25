# openscad library decision + prior-art lift policy

research: 2026-09-11 · sources: keeberia `backend/engines/cad/stack/tradeoffs.md`, keeberia journal (sept 11 deep-dive lift policy), usedbytes jewellery post · status: adopted for v1

## thesis

generated .scad stays **vanilla, dependency-free openscad: zero bosl2, zero includes** for v1. portability over power: the same file compiles in the browser (openscad-wasm), the worker cli, and pastes cleanly into any community customizer. revisit only if jewelry's curved geometry proves genuinely painful in vanilla: plausible (unlike keyboard cases, which are extruded rectangles), but not yet demonstrated.

## the lift policy (carried over verbatim from keeberia's journal)

| license class | what we may take |
|---|---|
| mit / permissive | code liftable with attribution in `THIRD_PARTY_NOTICES.md`: prefer values + architecture |
| gpl / copyleft | **zero code, ever**: patterns, module decomposition, geometry facts only |
| cc by-sa (e.g. engravedring v1.2, thing:4753880) | patterns only: share-alike clauses make code lift a licensing decision, not an engineering one |
| unknown / unlicensed | study-don't-copy until license resolved; any number taken is flagged `viz-grade, calibrate before production` |
| data formats / interop | always fine |

this applies verbatim to BOSL2/dotscad/jewelry-fork research in track b. the provenance pattern to copy is keeberia's `caps-engine/src/profiles.ts`: every geometric constant carries an inline `source` string, with an explicit calibration flag on numbers from non-primary sources: that shape goes into `stone-seats.json` / `casting-tolerances.json` entries directly.

## conditions and caveats

- openscad itself is gpl-2.0: irrelevant to generated artifacts (we emit source text, we don't link), but the wasm build we ship in the browser is a gpl tool running as a separate engine. fine; just never inline engine code into sculptura source.
- vanilla openscad covers ring/band/bezel-class geometry: `rotate_extrude`, `offset`, `linear_extrude`, `scale`, boolean csg: all demonstrated working in-browser (see performance/budget.md).
- the one known vanilla pain point: swept curved profiles (prong sweeps, twisted gallery rails) may want `sweep()`/`skin()`-style polyhedron construction: the usedbytes post does this with pure list comprehensions, no library. that's the fallback before any bosl2 revisit.

## sources

1. keeberia `backend/engines/cad/stack/tradeoffs.md`: the original portability-over-power argument for dependency-free scad
2. keeberia journal (sept 11 deep dive): the lift policy table, verbatim
3. blog.usedbytes.com/2019/06/making-jewellery/ (retrieved 2026-09-11): hull() cost bounds, sweep()/skin() as library-free polyhedron technique, low-$fn dev cycle
