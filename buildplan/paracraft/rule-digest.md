# paracraft rule digest

consolidated manufacturing rules for the paracraft compiler, extracted from scraped sources on 2026-09-23. every value below is machine-extracted from a published source and kept in the source's own words and units; nothing here is invented, and nothing here is active rule data yet.

status legend: every value is **drafted**. a value becomes an active rule only after cross-checking against a second source or a direct partner answer (see [acquire.md](acquire.md)), and after reproducing in the [benchmark harness](benchmarks.md).

the research converges from two passes, in order:

1. **printability:** can the pattern (castable resin or wax) even be printed and handled? this is the first gate.
2. **castability:** will the printed pattern survive burnout and cast cleanly into metal? this is the second gate.

## conflicts worth noting up front

- **wall minimums cluster around 0.7 to 0.8 mm, but not identically:** formlabs recommends 0.7 mm walls for hollow shells in castable wax resin; cooksongold and sculpteo silver both set 0.8 mm minimum external walls; morris & watson publishes no numeric wall minimum at all. hi3dp (generic sla, not casting) uses 0.8 mm minimum and 1.5 mm for functional walls.
- **service envelopes differ wildly:** cooksongold processes designs up to 30 x 50 x 70 mm; sculpteo silver accepts up to 125 x 125 x 100 mm. envelope is per-partner data, never a global constant.
- **shrinkage numbers disagree in kind:** sculpteo silver says up to 2% raw and up to 3% polished (print/cast/finish combined); hi3dp says ~1-2% linear post-cure shrinkage for sla resins; cooksongold applies an unspecified scaling increase themselves. sculptura's models must not double-apply compensation a partner already applies.
- **text rules disagree:** cooksongold wants raised text at least 0.3 mm thick and no more than 0.6 mm high with 0.3 mm letter spacing; sculpteo silver wants readable text 0.5 mm wide and 1.5 mm tall; hi3dp's generic sla guidance says 0.2 mm stroke width at 1 mm height. text rules must be per-partner.
- **holes:** morris & watson requires holes wider than 0.20 mm with depth no more than the opening; cooksongold says avoid holes under 0.5 mm and fill them in cad. both agree on the deeper-than-wide prohibition (as do formlabs and sculpteo for all negative features).


## pass one: printability (pattern side)


### hi3dp sla design guidelines (generic sla, not casting-specific)

source: hi3dp.com sla design guidelines page; accessed: 2026-09-23; confidence: medium (generic sla, not casting-specific; apply only as printability floor before casting rules override)

| rule | value | condition | source | accessed | confidence |
|---|---|---|---|---|---|
| sla layer resolution | 25-50 um | modern sla machines. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| xy accuracy | ~100 um | modern sla machines. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| practical minimum feature size | 0.5-1 mm | walls, text, and small bosses; for consistent printing and post-processing. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| minimum feature spacing | at least 1 mm | between small features; avoid fusing during polymerization or post-cure. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| minimum wall thickness | >= 0.8 mm | non-load-bearing geometries. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| minimum functional wall thickness | >= 1.5 mm | parts subject to handling or light loads. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| wall-thickness transitions | avoid abrupt changes; use fillets | between thick and thin sections; reduce internal stresses. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| sliding-fit clearance | 0.2-0.3 mm | per mating surface for sliding parts. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| snap-fit interference | 0.1 mm | stiff resins. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| snap-fit interference | 0.2 mm | flexible resins. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| post-cure shrinkage | ~1-2% linear | during post-cure; calibrate with test prints when tight tolerances are critical. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| shrinkage compensation | scale model by +1-2% or calibrate per resin | when shrinkage causes dimensional inaccuracy. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| cosmetic-surface orientation | face upward and away from support attachment locations | minimize supports on critical surfaces. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| steeper feature angle | 45-60 degrees | reduces cross-section per layer and speeds builds; may require more supports. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| flatter feature angle | 10-30 degrees | improves surface finish with fewer but larger supports. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| unsupported overhang threshold | >45 degrees | add supports or re-orient to avoid sagging or delamination. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| support-tip size and shape | small, conical tips; ~0.3 mm diameter | use for fine features. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| support density | denser | under heavy overhangs; prevent sagging. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| support placement | recessed or non-visible areas | avoid attaching supports to thin fins and fine text. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| support-post clearance | >= 1 mm | between support posts and thin walls; allow removal without gouging. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| drainage-hole count | at least two holes per cavity | one for resin evacuation and one for air entry. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| drainage-hole placement | high and low points | relative to the print orientation. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| drainage-hole diameter | >= 3 mm | standard resins. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| drainage-hole diameter | up to 5 mm | high-viscosity or filled resins. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| hollow-cavity wall thickness | >= 1.5 mm; nearly uniform | around the cavity; prevent deformation during curing and maintain structural integrity. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| batch orientation | 45 degrees | batch multiple parts alternatively at 45 degrees to balance fine detail vs. build height. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| xy-plane rotation | 5-10 degrees | slight rotation to randomize layer artifacts. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| thin-fin or spike thickness | >= 1 mm, or remove altogether | avoid breakage during build or cleanup. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| engraved-text height | 1 mm tall | standard resins. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| engraved-text stroke width | 0.2 mm | standard resins; use a test coupon if finer typography is needed. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| living-hinge flex-area thickness | 0.4-0.6 mm | tough or flexible resin. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |
| living-hinge orientation | hinge axis perpendicular to the build plane | living hinges. | hi3dp sla design guidelines | 2026-09-23 | medium (generic sla, not casting-specific) |

### gaps

- no recommended layer height or layer-count limit for a particular pattern.
- no drainage-hole depth, edge-distance, or detailed placement constraints.
- no jewelry-specific orientation rules for planar faces, hole axes, or undercuts.
- no absolute dimensional tolerance bands or resin-specific shrinkage and accuracy values.


### sculpteo sterling silver casting page

source: sculpteo.com sterling silver casting page; accessed: 2026-09-23; confidence: high (tier-1 manufacturer; accessed directly)

| rule | value | condition | source | accessed | confidence |
|---|---|---|---|---|---|
| account requirement | required | before uploading a file to start 3d printing. | sculpteo sterling silver | 2026-09-23 | high |
| maximum 3d file size | 50mb | uploaded 3d file. | sculpteo sterling silver | 2026-09-23 | high |
| multiple objects in one file | no | a file containing several objects cannot be printed in silver. | sculpteo sterling silver | 2026-09-23 | high |
| uploaded file quality | highest quality possible | recommended to avoid triangulation in the final print. | sculpteo sterling silver | 2026-09-23 | high |
| standard layer thickness | 25 um | sterling silver service. | sculpteo sterling silver | 2026-09-23 | high |
| accuracy | unpolished max: 0.8mm; polished max: 0.8mm | unpolished or polished finish, respectively. | sculpteo sterling silver | 2026-09-23 | high |
| shrinkage consideration | raw: up to 2% (on average); polished: up to 3% (on average) | shrinkage may occur during printing. | sculpteo sterling silver | 2026-09-23 | high |
| minimum object size | 2.4 x 2.4 x 0.8 mm | overall object dimensions. | sculpteo sterling silver | 2026-09-23 | high |
| maximum object size | 125 x 125 x 100 mm | overall object dimensions. | sculpteo sterling silver | 2026-09-23 | high |
| minimum general wall thickness | 0.8 mm | walls must meet this minimum to remain supported without breaking under their own weight. | sculpteo sterling silver | 2026-09-23 | high |
| minimum thickness for unsupported, stemmed, or constrained geometry | 1 mm | unsupported or stemmed elements, or parts with a particular design constraint. a stemmed element is at least twice as long as it is thick. | sculpteo sterling silver | 2026-09-23 | high |
| wall thickness advised for greater rigidity | 2mm | use when more rigidity is desired; walls at the general minimum are described as slightly flexible. | sculpteo sterling silver | 2026-09-23 | high |
| stress-dependent thickening | thicken the most-stressed and fragile areas | malleable silver can distort when too much weight is applied. | sculpteo sterling silver | 2026-09-23 | high |
| minimum general detail size | 0.4 mm | recommended as a lower bound for visibility and avoiding breakage; casting fill is a determining factor. | sculpteo sterling silver | 2026-09-23 | high |
| minimum embossed detail height and width | 0.5 mm | embossed details. | sculpteo sterling silver | 2026-09-23 | high |
| minimum engraved detail height and width | 0.4 mm | engraved details. | sculpteo sterling silver | 2026-09-23 | high |
| minimum readable-text dimensions | width: 0.5 mm; height: 1.5 mm | text that must remain readable. | sculpteo sterling silver | 2026-09-23 | high |
| enlargement ratio | 1/1 | no feature or finish condition specified. | sculpteo sterling silver | 2026-09-23 | high |
| detail width-to-depth relationship | width >= depth | for better visibility; detail width must be at least as large as its depth. | sculpteo sterling silver | 2026-09-23 | high |
| polishing smoothing risk | too-thin elements and too-sharp edges will be smoothed | when minimum-detail restrictions are not respected. | sculpteo sterling silver | 2026-09-23 | high |
| mirror polish effect on details | finer details may be less visible; the interior is not polished | mirror polish; hand polishing uses subtractive polishing, and the interior cannot be reached by hand. | sculpteo sterling silver | 2026-09-23 | high |
| online solidity-check workflow | upload the 3d file, select the material, and click the "verification" tab | the tool highlights parts that may be too thin. | sculpteo sterling silver | 2026-09-23 | high |
| solidity-check limitations | floating parts, unstable position, and parts supporting too much weight relative to their thickness are not detected | geometry and the most-stressed parts still require particular attention. | sculpteo sterling silver | 2026-09-23 | high |
| enclosed parts | no | the wax stage requires supports for otherwise free-floating objects. | sculpteo sterling silver | 2026-09-23 | high |
| interlocking parts | no | silver models. | sculpteo sterling silver | 2026-09-23 | high |
| minimum spacing between fixed walls | 0.3 mm | required for excess liquid wax to drain; a smaller gap will result in a fault in the final design. | sculpteo sterling silver | 2026-09-23 | high |
| minimum clearance between parts | 0.3 mm | required between parts for excess liquid wax to drain. | sculpteo sterling silver | 2026-09-23 | high |
| assembly | no | assembled pieces are currently not possible with the silver printing option. | sculpteo sterling silver | 2026-09-23 | high |
| hollowing | no | the object is printed in wax before silver casting and cannot be hollowed in the manner described for other materials. | sculpteo sterling silver | 2026-09-23 | high |

**gaps**

- accepted file formats, mesh-density requirements, input watertightness criteria, model units/scale, and orientation constraints are not specified.
- numeric minimums for hole or bore diameters, edge/corner radii, draft, undercuts, feature depth, and surface roughness are not given.
- the source does not define the measurement basis for the reported maximum accuracy or explain how to apply the shrinkage percentages as dimensional compensation.


### sculpteo bronze casting page

source: sculpteo.com bronze casting page; accessed: 2026-09-23; confidence: low (minimal data extracted; page may have been rate-limited or incomplete; only two facts recovered)

| rule | value | condition | source | accessed | confidence |
|---|---|---|---|---|---|
| upload access | an account is required to upload files and obtain live quotes. | before starting 3d printing or laser cutting. | sculpteo bronze | 2026-09-23 | low (minimal data extracted; page may have been rate-limited or incomplete) |
| manufacturing process | lost-wax casting | sculpteo's bronze material. | sculpteo bronze | 2026-09-23 | low (minimal data extracted; page may have been rate-limited or incomplete) |

### gaps

- **wall thickness:** no minimum wall thickness is provided.
- **feature sizing:** no minimum feature sizes are given for holes, engraving, embossing, or other details.
- **tolerances:** no dimensional or casting tolerances are specified.
- **sizing:** no overall size, bounding-box, volume, scaling, or unit requirements are provided.
- **geometry:** no rules are provided for enclosed, hollow, or interlocking geometry.
- **upload validation:** no accepted file formats, mesh requirements, or automatic rejection criteria are stated.


### raise3d wall thickness reference

source: raise3d wall thickness reference page; accessed: 2026-09-23; confidence: low (no numeric data extracted; table of contents only; single source with no usable constraint values)

| rule | value | condition | source | accessed | confidence |
| --- | --- | --- | --- | --- | --- |
| process-specific minimum and maximum wall thickness | not provided in the supplied text | fff, sla, MJF/SLS, and slm appear only in the table of contents. | raise3d reference | 2026-09-23 | low (no numeric data extracted; table of contents only) |

**gaps**
- no minimum or maximum wall thickness for fff or any other listed process.
- no material-specific wall-thickness guidance, including for flexible materials or photosensitive resins.
- no jewelry-specific or geometry-dependent wall-thickness rules.

## pass two: castability (metal side)


### formlabs casting whitepaper

source: formlabs investment casting guide pdf; accessed: 2026-09-23; confidence: high (tier-1 pattern material manufacturer; primary source for wax resin casting workflow)

| rule | value | condition | source | accessed | confidence |
|---|---|---|---|---|---|
| direct investment casting sequence | immerse the master pattern in refractory investment; let it dry and harden; burn out the pattern to leave a negative cavity; pour metal into the cavity. | direct investment casting, also called lost wax casting. | formlabs casting whitepaper | 2026-09-23 | high |
| third-party casting equipment | certus prestige optima investment; vacuum investment machine; casting system such as neutec j2r. | equipment listed in "essentials" for the described jewelry-casting workflow. | formlabs casting whitepaper | 2026-09-23 | high |
| ventilation for indoor burnout | use active ventilation, such as vent-a-kiln. | for indoor burnout. | formlabs casting whitepaper | 2026-09-23 | high |
| listed furnace specification | 732 degrees c or 1400 degrees f | third-party furnace listed in "essentials." the source does not identify this value as a burnout operating temperature. | formlabs casting whitepaper | 2026-09-23 | high |
| true cast resin thickness capability | up to 5 mm thick | for precision casting intricate jewelry through complex engineering components, including thick jewelry such as heavy class rings. | formlabs casting whitepaper | 2026-09-23 | high |
| castable wax 40 resin cross-section capability | up to 4 mm | in most places in the model. | formlabs casting whitepaper | 2026-09-23 | high |
| clear cast resin thickness | large-part geometries: thicker than 3 mm. demanding engineering applications: over 3 mm thick. | clear cast resin is also identified as an option for investment casting large parts. | formlabs casting whitepaper | 2026-09-23 | high |
| sharp-corner avoidance | avoid sharp corners and edges where possible. | sharp edges increase metal turbulence and concentrate expansion stresses in the mold. | formlabs casting whitepaper | 2026-09-23 | high |
| negative-feature proportions | keep engraved channels and holes wider than they are deep. | this is a rule of thumb, particularly important for small negative features where the surrounding investment is fragile. | formlabs casting whitepaper | 2026-09-23 | high |
| investment-breakage symptoms | filled-in negative features such as engraves and stone holes; usually accompanied by rough cast surfaces or pitting. | potential signs of investment breakage; surface roughness or pitting results from investment debris. | formlabs casting whitepaper | 2026-09-23 | high |
| feed-sprue geometry | design feed sprues either straight or tapered down towards the piece. | applies to feed sprues. | formlabs casting whitepaper | 2026-09-23 | high |
| use of 3d-printed feed sprues | use only where placing wax sprues would be difficult. | example given: connecting one inaccessible area of the resin pattern to another. | formlabs casting whitepaper | 2026-09-23 | high |
| sprue-material preference | real wax sprues promote better cast-part quality. | they give the pattern early access to oxygen when it melts out. | formlabs casting whitepaper | 2026-09-23 | high |
| preform supports as sprues | do not use preform supports as sprues. | when planning to 3d print sprues. | formlabs casting whitepaper | 2026-09-23 | high |
| printed sprue design | incorporate 3d printed sprues into the cad design. | formlabs recommends this when intending to 3d print sprues. | formlabs casting whitepaper | 2026-09-23 | high |
| sprue attachment-point design | add a cad sprue attachment point, such as a hole in the bottom of a ring band or a small hollow post to fill or surround with wax when attaching to a sprue rod. | helps attach and retain heavy resin patterns on wax sprues, avoiding a pattern floating in the poured flask. | formlabs casting whitepaper | 2026-09-23 | high |
| thin-shell strategy | hollow the design to a thin-walled shell. | for large, monolithic castable wax resin designs; the shell minimizes expansion forces on the investment during burnout. | formlabs casting whitepaper | 2026-09-23 | high |
| castable wax resin shelling trigger | parts thicker than 3 mm should be shelled. | castable wax resin. | formlabs casting whitepaper | 2026-09-23 | high |
| castable wax resin drain-hole requirement | drain holes must be added to allow resin to flush out of the hollow interior. | when a castable wax resin part is shelled. | formlabs casting whitepaper | 2026-09-23 | high |
| recommended hollow-shell wall | 0.7 mm thick walls | formlabs recommendation for hollow shells printed in castable wax resin; described as the minimum wall thickness. | formlabs casting whitepaper | 2026-09-23 | high |
| shell-operation inspection | check for areas close to, or less than, double the minimum 0.7 mm wall thickness. | for hollow, thin-shelled castable wax resin patterns; shell cad may not touch these areas, leaving regions too thick for casting. | formlabs casting whitepaper | 2026-09-23 | high |
| interior lattice | a lattice can be added. | to improve handling strength of large shelled parts printed in castable wax resin. | formlabs casting whitepaper | 2026-09-23 | high |
| excessively thick-part risk | excessively thick parts are likely to cause expansion cracks. | during burnout. | formlabs casting whitepaper | 2026-09-23 | high |

### gaps

- no post-cure protocol, wash sequence, or wash/cure times and temperatures.
- no drain-hole diameter, count, or placement rules; no complete shell-cad procedure.
- no sprue-tree counts, diameters, lengths, or minimum wax-attachment dimensions.
- no burnout process temperature, heating rate, or hold times. the listed furnace value is not identified as an operating setpoint.
- no investment thickness, permeability limits, investment recipe, or metal-pouring temperature and pressure requirements.


### morris and watson cad design guidelines

source: morris and watson cad design guidelines page; accessed: 2026-09-23; confidence: high (tier-1 casting bureau; direct manufacturer documentation)

| rule | value | condition | source | accessed | confidence |
| --- | --- | --- | --- | --- | --- |
| edge/point/corner radius | >= 0.125 mm | all edges, points and corners, including split shanks and lettering | morris and watson | 2026-09-23 | high |
| void depth | depth <= opening width | lettering, stone holes, fine gaps and spaces | morris and watson | 2026-09-23 | high |
| maximum recommended hole depth | <= 0.30 mm | holes | morris and watson | 2026-09-23 | high |
| gap between non-touching components | >= 0.20 mm | claws, setting posts, walls and similar components | morris and watson | 2026-09-23 | high |
| gap too small to maintain | fill the gap and drill it out later | if a gap of >= 0.20 mm is not possible | morris and watson | 2026-09-23 | high |
| hole diameter | > 0.20 mm | any hole | morris and watson | 2026-09-23 | high |
| hole depth relative to opening | depth <= diameter or opening width | any hole | morris and watson | 2026-09-23 | high |
| pilot-hole design | use a small pilot divot; drill the full hole later | if the design requires holes | morris and watson | 2026-09-23 | high |
| cad model integrity | no naked edges; watertight model | model geometry; both are listed as common casting issues | morris and watson | 2026-09-23 | high |
| support and metal flow | avoid thin or unsupported components and designs that restrict metal flow | model design; no numeric definition of "thin" is supplied | morris and watson | 2026-09-23 | high |

**gaps**

- no numeric minimum section/wall thickness, shrinkage allowance, sprue requirements or alloy-specific casting rules are provided.
- hole-depth guidance is not reconciled: the source states both <= 0.30 mm maximum depth and depth <= opening width/diameter.


### cooksongold casting design tips

source: cooksongold.com precious metal casting design guidelines page; accessed: 2026-09-23; confidence: high (tier-1 uk casting bureau; direct manufacturer documentation)

| rule | value | condition | source | accessed | confidence |
|---|---|---|---|---|---|
| model watertightness | must be watertight, with no naked or non-manifold edges | before upload; these issues often arise from shared edges or points | cooksongold | 2026-09-23 | high |
| maximum design dimensions | 30mm x 50mm x 70mm | designs must fit within these dimensions; larger files are not processed | cooksongold | 2026-09-23 | high |
| external wall thickness | minimum 0.8mm | external walls | cooksongold | 2026-09-23 | high |
| small-element thickness | minimum 0.5mm | smaller elements, such as claws or setting bezels | cooksongold | 2026-09-23 | high |
| earring posts | omit from the printed model; solder after casting | earring posts are not recommended for printing because of their delicate nature | cooksongold | 2026-09-23 | high |
| raised text thickness | at least 0.3mm | raised text | cooksongold | 2026-09-23 | high |
| raised text height | no more than 0.6mm | raised text | cooksongold | 2026-09-23 | high |
| raised letter spacing | minimum 0.3mm | between raised letters | cooksongold | 2026-09-23 | high |
| recessed text thickness | at least 0.3mm | recessed text | cooksongold | 2026-09-23 | high |
| recessed text depth | no more than 0.5mm | recessed text | cooksongold | 2026-09-23 | high |
| recessed letter spacing | minimum 0.3mm | between recessed letters | cooksongold | 2026-09-23 | high |
| small holes | avoid holes smaller than 0.5mm; fill them during cad | small holes that can cause casting issues | cooksongold | 2026-09-23 | high |
| pilot-hole geometry | use conical or spherical shapes; pilot divot width must be larger than its depth | if pilot holes are necessary for settings | cooksongold | 2026-09-23 | high |
| detail geometry recommendation | apply a negative draft angle (taper); round or fillet sharp edges | when incorporating text or intricate details | cooksongold | 2026-09-23 | high |
| hollow construction | not processed; cast two halves separately, then solder or weld together | if the design would otherwise be hollow | cooksongold | 2026-09-23 | high |
| interlocking or multiple-piece construction | cast individual components and assemble afterward | interlocking or multiple-piece designs | cooksongold | 2026-09-23 | high |
| sprue placement | leave placement to cooksongold; communicate specific preferences directly to the team | customer-added sprues can increase stl volume and cost | cooksongold | 2026-09-23 | high |
| shrinkage compensation | cooksongold applies a scaling increase | to compensate for shrinkage and match intended final dimensions | cooksongold | 2026-09-23 | high |
| material removed by polishing | approximately 0.1mm | during polishing; the amount depends on the processes used | cooksongold | 2026-09-23 | high |
| high-shine finishing allowance | add extra material to help preserve intended dimensions | areas intended for a high-shine finish | cooksongold | 2026-09-23 | high |

### gaps

- no numerical shrinkage factor or general dimensional tolerance.
- no draft-angle magnitude, fillet radius, or minimum mesh-repair overlap/local thickening.
- no general minimum feature size beyond the specified walls, text, and holes.
- no stl resolution requirement or sprue dimensions and placement coordinates.


### formlabs castable wax resin support

source: formlabs castable wax resin support page; accessed: 2026-09-23; confidence: high (tier-1 pattern material manufacturer; official support documentation)

| rule | value | condition | source | accessed | confidence |
|---|---|---|---|---|---|
| material formulation | a 20% wax-filled material; an acrylate photopolymer formulated with liquid wax. | castable wax resin. | formlabs castable wax | 2026-09-23 | high |
| equipment compatibility | use a compatible formlabs sla printer and compatible resin tank; check the resin tank compatibility table before use. | tank compatibility is required to avoid equipment damage. | formlabs castable wax | 2026-09-23 | high |
| print prerequisites | compatible printer with up-to-date firmware, most recent version of preform software, and build platform. | castable wax printing. | formlabs castable wax | 2026-09-23 | high |
| preform preparation | install or update preform, open the model, and set up the print job. | castable wax print preparation. | formlabs castable wax | 2026-09-23 | high |
| listed equipment | form wash or finish kit; form cure. | required-resource list; the casting workflow separately specifies washing followed by casting without post-curing. | formlabs castable wax | 2026-09-23 | high |
| post-processing before casting | wash, then cast; no post-cure is required. | direct investment casting with castable wax. | formlabs castable wax | 2026-09-23 | high |
| cad resource | jewelry-specific cad software, such as jewelcad or rhinogold. | required third-party resources. | formlabs castable wax | 2026-09-23 | high |
| investment for standard burnout schedule | certus prestige optima. | recommended investment. | formlabs castable wax | 2026-09-23 | high |
| investment for short burnout schedule | nobilium microfire. | recommended investment. | formlabs castable wax | 2026-09-23 | high |
| burnout oven capability | oven capable of 750 degrees c. | required resource; this is oven capability, not a stated burnout-stage setpoint. | formlabs castable wax | 2026-09-23 | high |
| casting equipment | vacuum chamber and casting system, such as indutherm mc-series or the neutec j2r; compressed air. | required third-party resources. | formlabs castable wax | 2026-09-23 | high |
| abrasive | sandpaper, 400 grit or above. | listed required resource; the supplied text does not assign a specific surface-preparation operation. | formlabs castable wax | 2026-09-23 | high |
| recommended pattern types | direct investment casting of jewelry models, including delicate features such as filigree, pave geometries, thin walls, and fine surface details. | castable wax resin. | formlabs castable wax | 2026-09-23 | high |
| prototype use | prints are strong enough for prototyping and fitting. | before production. | formlabs castable wax | 2026-09-23 | high |
| not recommended | final or functional parts; large, bulky patterns. | castable wax resin. | formlabs castable wax | 2026-09-23 | high |
| castable-resin selection | smaller parts or wire filigree: castable wax resin. medium to heavy jewelry or small engineering components: true cast resin. larger investment casting: clear cast resin. | when selecting among the listed formlabs castable resins. | formlabs castable wax | 2026-09-23 | high |
| burnout ventilation | design airflow vents in thick or large geometries to allow sufficient ventilation during burnout. | casting pattern design. | formlabs castable wax | 2026-09-23 | high |

### gaps

- the supplied text gives no layer heights, print resolution, exposure settings, orientation rules, support rules, or printer-specific material/tank pairings.
- no numeric geometry limits are given for walls, holes, channels, prongs, or other delicate features, nor numeric size thresholds for the "smaller," "medium to heavy," or "larger" categories.
- complete standard and short burnout schedules are absent: no stage temperatures, heating rates, hold times, cooling requirements, or maximum ramp rates. the only thermal number is the **750 degrees c** oven capability.
- investment compatibility is limited to two recommendations; the source excerpt supplies no powder/liquid ratios, mixing sequence, working time, vacuum/degas parameters, or investment-to-pattern ratio.


### formlabs true cast resin support

source: formlabs true cast resin support page; accessed: 2026-09-23; confidence: high (tier-1 pattern material manufacturer; official support documentation)

| rule | value | condition | source | accessed | confidence |
| --- | --- | --- | --- | --- | --- |
| precision-casting thickness limit | up to 5 mm thick | for intricate jewelry and complex engineering components. | formlabs true cast | 2026-09-23 | high |
| wire-filigree restriction | not recommended; use castable wax resin | for wire filigree. | formlabs true cast | 2026-09-23 | high |
| oversize-part restriction | not recommended; use clear cast resin | for parts larger than 5 mm thick. | formlabs true cast | 2026-09-23 | high |
| printing layer height | 25 microns and 50 microns | for true cast resin printing with a compatible printer. | formlabs true cast | 2026-09-23 | high |
| ash content | 0.03% | stated for true cast resin in connection with clean burnout. | formlabs true cast | 2026-09-23 | high |
| workflow step 1, pattern design | design the part in cad software | before the casting workflow proceeds to resin conditioning. | formlabs true cast | 2026-09-23 | high |
| workflow step 2, pre-heat and mix | heat, then mix the resin before printing | ensure the wax component is completely liquid and evenly dispersed. | formlabs true cast | 2026-09-23 | high |
| resin-heating equipment | resin heater | required third-party resource for pre-heating. | formlabs true cast | 2026-09-23 | high |
| workflow step 3, pattern printing | 3d print with true cast resin, following formlabs instructions | after pre-heating and mixing. | formlabs true cast | 2026-09-23 | high |
| workflow step 4, initial wash | thoroughly clean the printed patterns with ipa | remove residual uncured resin. | formlabs true cast | 2026-09-23 | high |
| workflow step 4, second wash | rinse for a second time in clean ipa | ensure the patterns are completely clean. | formlabs true cast | 2026-09-23 | high |
| uncured-resin defect risk | uncured resin on parts | may result in casting defects. | formlabs true cast | 2026-09-23 | high |
| workflow step 5, drying | dry with compressed air | only the step title is present in the provided excerpt. | formlabs true cast | 2026-09-23 | high |
| formlabs printing resources | compatible formlabs sla printer, build platform, compatible resin tank, true cast resin, and preform software | use up-to-date printer firmware and the most recent preform version. | formlabs true cast | 2026-09-23 | high |
| third-party printing resource | compatible resin printer | listed among required third-party resources. | formlabs true cast | 2026-09-23 | high |
| washing and post-curing resources | form wash (2nd generation) or another washing system; form cure (2nd generation) or another post-curing system | required for washing and post-curing. | formlabs true cast | 2026-09-23 | high |
| burnout and casting equipment | burnout oven; vacuum chamber and casting system, such as the neutec j2r | listed third-party required resources. | formlabs true cast | 2026-09-23 | high |
| ancillary equipment | end nippers, flasks, investment, vacuum, wax, waxing tools, etc. | listed third-party required resources; investment details are not specified. | formlabs true cast | 2026-09-23 | high |
| cleaning alcohol | ipa or ethyl alcohol, concentration of 91% or higher | required cleaning resource. | formlabs true cast | 2026-09-23 | high |
| abrasive | sandpaper (1000 grit) | listed ancillary resource; no sanding procedure is provided. | formlabs true cast | 2026-09-23 | high |

### gaps

- investment material, composition, mixing ratio, vacuum-investment procedure, and investment-setting requirements.
- preheat temperature or time, printer exposure and orientation, wash and post-curing schedules, and burnout and casting schedules.
- minimum feature size, minimum wall thickness, undercuts, draft angles, dimensional tolerances, or how the 5 mm limit maps to cad geometry.
- compressed-air drying pressure, duration, or method beyond the workflow step title.

## openscad compiler notes


### openscad manual: stl import and export

source: openscad.org manual, stl import and export section; accessed: 2026-09-23; confidence: high (official openscad documentation)

| rule | value | condition | source | accessed | confidence |
| --- | --- | --- | --- | --- | --- |
| stl geometry importer | `import()` | importing external geometry. | openscad manual | 2026-09-23 | high |
| supported 3d geometry formats | stl (both ascii and binary), off, obj, amf (deprecated), 3mf | importing geometry with `import()`. | openscad manual | 2026-09-23 | high |
| gui command insertion | `File >> Open` may insert `import()`; enter a wildcard such as `*.stl` when the file-type filter shows only openscad files | requires version `2015.03-2`. | openscad manual | 2026-09-23 | high |
| legacy stl importer | `import_stl()` is deprecated; use `import()` | removal is deferred to a future release; no removal version is given. | openscad manual | 2026-09-23 | high |
| relative `file` path | resolved relative to the importing script | the given path is not absolute. | openscad manual | 2026-09-23 | high |
| relative path through inclusion | resolved relative to the script doing the `include<>` | a script loaded with `include<>` uses `import()`. | openscad manual | 2026-09-23 | high |
| object placement | `center` is boolean; `true` places the object's center at the origin | `center=true` on the `import()` module. | openscad manual | 2026-09-23 | high |
| preview convexity | optional integer `convexity`: maximum number of front sides, or back sides, a ray intersecting the object might penetrate | needed for correct display in opencsg preview mode; has no effect on polyhedron rendering. | openscad manual | 2026-09-23 | high |
| suggested convexity | `10` | should work fine for most cases; not stated as a default. | openscad manual | 2026-09-23 | high |
| polygon segment count | `$fn`: double specifying the number of polygon segments | converting circles, arcs, and curves to polygons; requires version `Development snapshot`. | openscad manual | 2026-09-23 | high |
| minimum angle step | `$fa`: double | converting circles and arcs to polygons; requires version `Development snapshot`. | openscad manual | 2026-09-23 | high |
| minimum segment length | `$fs`: double | converting circles and arcs to polygons; requires version `Development snapshot`. | openscad manual | 2026-09-23 | high |
| stl cleanliness | the mesh has to be manifold and should contain neither holes nor self-intersections | an imported stl must be rendered later. | openscad manual | 2026-09-23 | high |
| failure modes for unclean stl | possible outcomes include manifold warnings, disappearance from output, or cgal assertion violations | computational geometry is performed, such as rendering the stl combined with another object. | openscad manual | 2026-09-23 | high |
| repair-tool capabilities | semi-automatic repair options repairs holes but not self-intersections; netfabb basic does neither; meshlab can fix all listed issues | repairing an imported stl. | openscad manual | 2026-09-23 | high |
| meshlab non-manifold check | the screen should show `0 non manifold edges` and `0 non manifold vertices` | after the documented selection, closure, and vertex-deletion cleanup step. | openscad manual | 2026-09-23 | high |
| meshlab stl export | `File -> Export Mesh`; save as stl | after repairing the mesh in meshlab. | openscad manual | 2026-09-23 | high |
| experimental data-import flag | enable `import-function`; only json files are supported | using the `import()` function for data rather than geometry; requires version `Development snapshot`. | openscad manual | 2026-09-23 | high |

### gaps

- the source provides no stl export command or syntax, export cli flags, or export-side ASCII/Binary selection rules.
- it gives no byte-reproducibility guarantees, including guarantees for triangle order, vertex order, or coordinate formatting.
- it gives no numeric mesh-validation tolerances, hole-size limits, vertex-merge distances, repair-pass counts, or default `convexity`.
- it provides no pinned command-line workflow; features labeled `Development snapshot` have no fixed release number here.
- it does not specify cad units, physical-size mapping, coordinate orientation, or whether the polygon-conversion parameters affect imported stl meshes.


### openscad manual: customizer

source: openscad.org manual, customizer section; accessed: 2026-09-23; confidence: high (official openscad documentation)

| fact | detail | source | accessed | confidence |
|---|---|---|---|---|
| version requirement | the customizer feature requires openscad version 2019.05. | openscad manual | 2026-09-23 | high |
| purpose | customizer exposes model parameters for gui editing, avoiding code edits. saved parameter sets can represent model variants. | openscad manual | 2026-09-23 | high |
| main-file scope | only variables assigned in the main file are displayed. variables assigned in files loaded through `include` or `use` are not displayed. | openscad manual | 2026-09-23 | high |
| supported value types | supported values are strings, numbers, booleans, or lists containing at most four numeric literals. | openscad manual | 2026-09-23 | high |
| unsupported expressions | expressions are unsupported even when trivial, including `str("String"," ","concat")` and `12 + 0.5`. | openscad manual | 2026-09-23 | high |
| assignment position | a supported assignment must appear before the first `{` syntax element. | openscad manual | 2026-09-23 | high |
| hidden section | a line containing only `/* [Hidden] */` prevents subsequent assignments in that section from being displayed. this is described as the best-practice cutoff. | openscad manual | 2026-09-23 | high |
| non-stopping declaration | a module or function declaration containing no `{` does not stop customizer; subsequent supported assignments remain displayed. | openscad manual | 2026-09-23 | high |
| legacy cutoff | an empty module such as `module __Customizer_Limit__ () {}` places a `{` in the file and hides following assignments from customizer. | openscad manual | 2026-09-23 | high |
| description syntax | a description uses a `//` comment on the line above an assignment. the description comment must align with the source file's left column without spaces. | openscad manual | 2026-09-23 | high |
| drop-down annotation | a trailing `// [...]` annotation lists number or string choices, e.g. `Numbers=2; // [0, 1, 2, 3]` or `Strings="foo"; // [foo, bar, baz]`. | openscad manual | 2026-09-23 | high |
| labeled drop-down annotation | choices may use `value:label`, e.g. `Labeled_values=10; // [10:S, 20:M, 30:L]` or `Labeled_value="S"; // [S:Small, M:Medium, L:Large]`. | openscad manual | 2026-09-23 | high |
| slider annotation | sliders accept numbers only. `// [50]` specifies a maximum; `// [10:100]` specifies minimum and maximum. | openscad manual | 2026-09-23 | high |
| step-slider annotation | `// [0:5:100]` specifies minimum, step, and maximum; the example uses minimum `-10`, step `0.1`, and maximum `10`. | openscad manual | 2026-09-23 | high |
| slider compatibility | maximum-only slider syntax, `// [50]`, is mainly provided for thingiverse compatibility. | openscad manual | 2026-09-23 | high |
| checkbox annotation | a boolean assignment such as `Variable = true;` uses a checkbox. checkboxes are not supported by thingiverse. | openscad manual | 2026-09-23 | high |
| spinbox annotation | `Spinbox = 5;` uses step size 1; `Spinbox = 5.5; // .5` specifies step size 0.5. | openscad manual | 2026-09-23 | high |
| textbox compatibility | the supplied note states that the textbox example works in release 2021.01 and may not work in future versions. | openscad manual | 2026-09-23 | high |

gaps:
- ordered and named module/function parameters are not covered in the supplied source.
- general customizer section syntax is absent beyond the `[Hidden]` section.
- the textbox section is truncated; its example and complete compatibility statement are missing.


### openscad downloads and versions

source: openscad.org downloads page; accessed: 2026-09-23; confidence: high (official openscad download page; version numbers are definitive)

| rule | value | condition | source | accessed | confidence |
| --- | --- | --- | --- | --- | --- |
| stable release version listed | `2021.01` | macos, windows, other linux, and source-code downloads | openscad downloads | 2026-09-23 | high |
| stable macos artifact | `OpenSCAD-2021.01.dmg`; 64 bit intel; `27 MB` | macos | openscad downloads | 2026-09-23 | high |
| stable windows artifacts | `OpenSCAD-2021.01-x86-32-Installer.exe`; `OpenSCAD-2021.01-x86-32.zip`; `OpenSCAD-2021.01-x86-64-Installer.exe`; `OpenSCAD-2021.01-x86-64.zip`; `21 MB` per package | windows; x86 (32-bit) and x86 (64-bit) | openscad downloads | 2026-09-23 | high |
| stable other linux artifacts | `OpenSCAD-2021.01-x86_64.AppImage`; x86 (64-bit); `39 MB`; `OpenSCAD-2021.01-aarch64.AppImage`; arm (64-bit); `43 MB` | other linux | openscad downloads | 2026-09-23 | high |
| stable source artifact | `openscad-2021.01.src.tar.gz`; `16 MB` | source code | openscad downloads | 2026-09-23 | high |
| checksum file types linked | `sha256`; `sha512` | stable-artifact and release candidate download entries | openscad downloads | 2026-09-23 | high |
| signature file type linked | `asc` | stable windows, other linux, and source-code downloads; release candidate entries | openscad downloads | 2026-09-23 | high |
| listed gnupg key id | `0x8AF822A975097442` | release candidates; binaries signed with gnupg | openscad downloads | 2026-09-23 | high |
| listed gnupg fingerprint | `B3C9 4B42 50DC 097E 9FFF 8177 8AF8 22A9 7509 7442` | release candidates; binaries signed with gnupg | openscad downloads | 2026-09-23 | high |
| release candidate content | all features that will be included in the next release | intended for testing before the final release | openscad downloads | 2026-09-23 | high |
| docker image release and base | `2021.01`; based on debian buster | `openscad/openscad` image; `linux/amd64` | openscad downloads | 2026-09-23 | high |
| docker image release and base | `2019.05`; based on debian buster | `openscad/openscad` image; `linux/amd64` | openscad downloads | 2026-09-23 | high |
| docker image release and base | `2015.03`; based on debian stretch | `openscad/openscad` image; `linux/amd64` | openscad downloads | 2026-09-23 | high |
| docker development channel and base | development snapshot; based on debian bookworm | `openscad/openscad` image; `linux/amd64` | openscad downloads | 2026-09-23 | high |

**gaps**

- no complete release history, release dates, or changelog.
- no exact version/date is shown for nightly builds, development snapshot images, or release candidate downloads.
- no literal `sha256` or `sha512` values are included; only checksum-file links.
- package-manager entries do not provide the versions they currently resolve to.
- no output-compatibility guarantees or explicit version-scheme rules are stated.


### gildform 3d model design requirements and guidelines

source: support.gildform.com 3d model design requirements page; accessed: 2026-09-24; confidence: high (tier-1 casting bureau; empirical test data for wall thickness; lost-wax from castable wax resin)

| rule | value | condition | source | accessed | confidence |
|---|---|---|---|---|---|
| recommended layer height | 25 microns | fine jewelry models | gildform | 2026-09-24 | high |
| wall thickness 0.3 mm result | fail: concave walls, incomplete casting fill | empirical ring test; result cannot be overcome by recasting | gildform | 2026-09-24 | high |
| wall thickness 0.5 mm result | marginal: complete fill but concave distortion | empirical ring test; distortion not structurally safe after filing | gildform | 2026-09-24 | high |
| wall thickness 0.75 mm result | pass: minor surface depressions, structurally sound | empirical ring test; production-safe minimum | gildform | 2026-09-24 | high |
| minimum through-hole diameter | 0.5 mm | through holes in castable pieces; smaller possible but inconsistent | gildform | 2026-09-24 | high |
| draft angle recommendation | 5 degrees minimum on walls and prongs | taper from thicker base to thinner top; larger draft always improves castability | gildform | 2026-09-24 | high |
| engraving in 3d model | not recommended; causes casting and finishing quality issues | use laser engraving or stamping for fine engraving instead | gildform | 2026-09-24 | high |
| minimum letter height for engraving survival | 1.5 mm | ornate script tends to fail below this height at both 0.3 mm and 0.5 mm depth | gildform | 2026-09-24 | high |
| hollow large pieces | design as hollow forms with wall thickness maintaining structural integrity | large pieces must be hollow; watertight manifold model required | gildform | 2026-09-24 | high |
| hollow bangle: single 3.5 mm hole | insufficient for casting | investment cannot fill hollow interior through one small hole | gildform | 2026-09-24 | high |
| hollow bangle: multiple larger holes | pass | multiple larger access holes allow successful investment and casting | gildform | 2026-09-24 | high |
| internal sharp corners | fillet internal edges wherever possible | sharp investment edges break off into the casting during metal pour | gildform | 2026-09-24 | high |
| watertight model | required; all surfaces booleaned into a single unified solid | grouped (non-boolean) components with open edges cause print artifacts | gildform | 2026-09-24 | high |
| maximum piece size | 3 in x 4 in (76 mm x 102 mm) | larger pieces are out of scope | gildform | 2026-09-24 | high |

### gaps

- no minimum wall thickness for large hollow pieces (bangle example uses 0.9 mm but this is not stated as a rule).
- no numeric minimum for internal fillet radius.
- no hollow piece drain hole count or minimum hole diameter beyond the empirical 3.5 mm insufficient result.
- no alloy-specific rules; page covers all precious metals without per-alloy distinctions.
- no sprue placement or sprue dimension guidance.


### openscad cheat sheet (primitives and resolution variables)

source: openscad.org/cheatsheet; accessed: 2026-09-24; confidence: high (official openscad documentation; resolves the failed scrape of the primitives manual page)

| rule | value | condition | source | accessed | confidence |
|---|---|---|---|---|---|
| 3d primitives | `sphere`, `cube`, `cylinder`, `polyhedron`, `import`, `linear_extrude`, `rotate_extrude`, `surface` | openscad 3d geometry creation | openscad cheatsheet | 2026-09-24 | high |
| two-radius cylinder | `cylinder(h, r1\|d1, r2\|d2, center)` | truncated cone; r1 and r2 are bottom and top radii | openscad cheatsheet | 2026-09-24 | high |
| boolean operations | `union()`, `difference()`, `intersection()` | combine, subtract, and intersect child solids | openscad cheatsheet | 2026-09-24 | high |
| resolution: segment count | `$fn` | number of polygon segments for circles and curves; overrides $fa and $fs when set | openscad cheatsheet | 2026-09-24 | high |
| resolution: minimum angle | `$fa` | minimum angle per segment; controls curve smoothness | openscad cheatsheet | 2026-09-24 | high |
| resolution: minimum segment length | `$fs` | minimum segment length; controls curve smoothness | openscad cheatsheet | 2026-09-24 | high |
| transformations | `translate`, `rotate`, `scale`, `resize`, `mirror`, `multmatrix`, `color`, `offset`, `hull`, `minkowski` | geometry transformations and operations | openscad cheatsheet | 2026-09-24 | high |
| 2d primitives | `circle`, `square`, `polygon`, `text`, `import` (DXF/SVG), `projection` | 2d shapes for extrusion | openscad cheatsheet | 2026-09-24 | high |
| special variables | `$t` (animation step), `$vpr`, `$vpt`, `$vpd`, `$vpf` (viewport), `$children`, `$preview` | animation and rendering context variables | openscad cheatsheet | 2026-09-24 | high |
| customizer version requirement | openscad 2019.05 or later | customizer feature for parameter gui editing | openscad cheatsheet | 2026-09-24 | high |

### gaps

- no numeric defaults for `$fa`, `$fs`, or `$fn`; the cheatsheet lists the variables but not their default values.
- no cli export flags, output format options, or batch rendering syntax.
- no version-specific feature availability table beyond the customizer note.


## next extraction targets

- per the gaps lists above: every partner's shrinkage factor, dimensional tolerance, sprue dimensions, and burnout setpoints remain unpublished and move to [acquire.md](acquire.md).
- gildform hollow drain hole minimum diameter and count: the empirical evidence shows 3.5 mm is insufficient but no minimum is stated; this is a direct partner ask.
