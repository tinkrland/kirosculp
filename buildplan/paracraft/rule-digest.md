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

| rule | value | condition |
|---|---|---|
| SLA layer resolution | 25–50 µm | Modern SLA machines. |
| XY accuracy | ~100 µm | Modern SLA machines. |
| Practical minimum feature size | 0.5–1 mm | Walls, text, and small bosses; for consistent printing and post-processing. |
| Minimum feature spacing | At least 1 mm | Between small features; avoid fusing during polymerization or post-cure. |
| Minimum wall thickness | ≥ 0.8 mm | Non-load-bearing geometries. |
| Minimum functional wall thickness | ≥ 1.5 mm | Parts subject to handling or light loads. |
| Wall-thickness transitions | Avoid abrupt changes; use fillets | Between thick and thin sections; reduce internal stresses. |
| Sliding-fit clearance | 0.2–0.3 mm | Per mating surface for sliding parts. |
| Snap-fit interference | 0.1 mm | Stiff resins. |
| Snap-fit interference | 0.2 mm | Flexible resins. |
| Post-cure shrinkage | ~1–2% linear | During post-cure; calibrate with test prints when tight tolerances are critical. |
| Shrinkage compensation | Scale model by +1–2% or calibrate per resin | When shrinkage causes dimensional inaccuracy. |
| Cosmetic-surface orientation | Face upward and away from support attachment locations | Minimize supports on critical surfaces. |
| Steeper feature angle | 45–60° | Reduces cross-section per layer and speeds builds; may require more supports. |
| Flatter feature angle | 10–30° | Improves surface finish with fewer but larger supports. |
| Unsupported overhang threshold | >45° | Add supports or re-orient to avoid sagging or delamination. |
| Support-tip size and shape | Small, conical tips; ~0.3 mm diameter | Use for fine features. |
| Support density | Denser | Under heavy overhangs; prevent sagging. |
| Support placement | Recessed or non-visible areas | Avoid attaching supports to thin fins and fine text. |
| Support-post clearance | ≥ 1 mm | Between support posts and thin walls; allow removal without gouging. |
| Drainage-hole count | At least two holes per cavity | One for resin evacuation and one for air entry. |
| Drainage-hole placement | High and low points | Relative to the print orientation. |
| Drainage-hole diameter | ≥ 3 mm | Standard resins. |
| Drainage-hole diameter | Up to 5 mm | High-viscosity or filled resins. |
| Hollow-cavity wall thickness | ≥ 1.5 mm; nearly uniform | Around the cavity; prevent deformation during curing and maintain structural integrity. |
| Batch orientation | 45° | Batch multiple parts alternatively at 45° to balance fine detail vs. build height. |
| XY-plane rotation | 5–10° | Slight rotation to randomize layer artifacts. |
| Thin-fin or spike thickness | ≥ 1 mm, or remove altogether | Avoid breakage during build or cleanup. |
| Engraved-text height | 1 mm tall | Standard resins. |
| Engraved-text stroke width | 0.2 mm | Standard resins; use a test coupon if finer typography is needed. |
| Living-hinge flex-area thickness | 0.4–0.6 mm | Tough or flexible resin. |
| Living-hinge orientation | Hinge axis perpendicular to the build plane | Living hinges. |

### gaps

- No recommended layer height or layer-count limit for a particular pattern.
- No drainage-hole depth, edge-distance, or detailed placement constraints.
- No jewelry-specific orientation rules for planar faces, hole axes, or undercuts.
- No absolute dimensional tolerance bands or resin-specific shrinkage and accuracy values.


### sculpteo sterling silver casting page

| rule | value | condition |
|---|---|---|
| Account requirement | Required | Before uploading a file to start 3D printing. |
| Maximum 3D file size | 50Mb | Uploaded 3D file. |
| Multiple objects in one file | No | A file containing several objects cannot be printed in silver. |
| Uploaded file quality | Highest quality possible | Recommended to avoid triangulation in the final print. |
| Standard layer thickness | 25 µm | Sterling Silver service. |
| Accuracy | Unpolished Max: 0.8mm; Polished Max: 0.8mm | Unpolished or polished finish, respectively. |
| Shrinkage consideration | Raw: up to 2% (On Average); Polished: up to 3% (On Average) | Shrinkage may occur during printing. |
| Minimum object size | 2.4 x 2.4 x 0.8 mm | Overall object dimensions. |
| Maximum object size | 125 x 125 x 100 mm | Overall object dimensions. |
| Minimum general wall thickness | 0.8 mm | Walls must meet this minimum to remain supported without breaking under their own weight. |
| Minimum thickness for unsupported, stemmed, or constrained geometry | 1 mm | Unsupported or stemmed elements, or parts with a particular design constraint. A stemmed element is at least twice as long as it is thick. |
| Wall thickness advised for greater rigidity | 2mm | Use when more rigidity is desired; walls at the general minimum are described as slightly flexible. |
| Stress-dependent thickening | Thicken the most-stressed and fragile areas | Malleable silver can distort when too much weight is applied. |
| Minimum general detail size | 0.4 mm | Recommended as a lower bound for visibility and avoiding breakage; casting fill is a determining factor. |
| Minimum embossed detail height and width | 0.5 mm | Embossed details. |
| Minimum engraved detail height and width | 0.4 mm | Engraved details. |
| Minimum readable-text dimensions | Width: 0.5 mm; Height: 1.5 mm | Text that must remain readable. |
| Enlargement ratio | 1/1 | No feature or finish condition specified. |
| Detail width-to-depth relationship | Width ≥ depth | For better visibility; detail width must be at least as large as its depth. |
| Polishing smoothing risk | Too-thin elements and too-sharp edges will be smoothed | When minimum-detail restrictions are not respected. |
| Mirror Polish effect on details | Finer details may be less visible; the interior is not polished | Mirror Polish; hand polishing uses subtractive polishing, and the interior cannot be reached by hand. |
| Online solidity-check workflow | Upload the 3D file, select the material, and click the “Verification” tab | The tool highlights parts that may be too thin. |
| Solidity-check limitations | Floating parts, unstable position, and parts supporting too much weight relative to their thickness are not detected | Geometry and the most-stressed parts still require particular attention. |
| Enclosed parts | No | The wax stage requires supports for otherwise free-floating objects. |
| Interlocking parts | No | Silver models. |
| Minimum spacing between fixed walls | 0.3 mm | Required for excess liquid wax to drain; a smaller gap will result in a fault in the final design. |
| Minimum clearance between parts | 0.3 mm | Required between parts for excess liquid wax to drain. |
| Assembly | No | Assembled pieces are currently not possible with the silver printing option. |
| Hollowing | No | The object is printed in wax before silver casting and cannot be hollowed in the manner described for other materials. |

**Gaps**

- Accepted file formats, mesh-density requirements, input watertightness criteria, model units/scale, and orientation constraints are not specified.
- Numeric minimums for hole or bore diameters, edge/corner radii, draft, undercuts, feature depth, and surface roughness are not given.
- The source does not define the measurement basis for the reported maximum accuracy or explain how to apply the shrinkage percentages as dimensional compensation.


### sculpteo bronze casting page

| rule | value | condition |
|---|---|---|
| Upload access | An account is required to upload files and obtain live quotes. | Before starting 3D printing or Laser Cutting. |
| Manufacturing process | Lost-wax Casting | Sculpteo’s Bronze material. |

## gaps

- **Wall thickness:** No minimum wall thickness is provided.
- **Feature sizing:** No minimum feature sizes are given for holes, engraving, embossing, or other details.
- **Tolerances:** No dimensional or casting tolerances are specified.
- **Sizing:** No overall size, bounding-box, volume, scaling, or unit requirements are provided.
- **Geometry:** No rules are provided for enclosed, hollow, or interlocking geometry.
- **Upload validation:** No accepted file formats, mesh requirements, or automatic rejection criteria are stated.


### raise3d wall thickness reference

| rule | value | condition |
| --- | --- | --- |
| Process-specific minimum and maximum wall thickness | Not provided in the supplied text | FFF, SLA, MJF/SLS, and SLM appear only in the table of contents. |

**gaps**
- No minimum or maximum wall thickness for FFF or any other listed process.
- No material-specific wall-thickness guidance, including for flexible materials or photosensitive resins.
- No jewelry-specific or geometry-dependent wall-thickness rules.

## pass two: castability (metal side)


### formlabs casting whitepaper

| rule | value | condition |
|---|---|---|
| Direct investment casting sequence | Immerse the master pattern in refractory investment; let it dry and harden; burn out the pattern to leave a negative cavity; pour metal into the cavity. | Direct investment casting, also called lost wax casting. |
| Third-party casting equipment | Certus Prestige Optima investment; vacuum investment machine; casting system such as Neutec J2R. | Equipment listed in “Essentials” for the described jewelry-casting workflow. |
| Ventilation for indoor burnout | Use active ventilation, such as Vent-A-Kiln. | For indoor burnout. |
| Listed furnace specification | 732 °C or 1400 °F | Third-party furnace listed in “Essentials.” The source does not identify this value as a burnout operating temperature. |
| True Cast Resin thickness capability | up to 5 mm thick | For precision casting intricate jewelry through complex engineering components, including thick jewelry such as heavy class rings. |
| Castable Wax 40 Resin cross-section capability | up to 4 mm | In most places in the model. |
| Clear Cast Resin thickness | Large-part geometries: thicker than 3 mm. Demanding engineering applications: over 3 mm thick. | Clear Cast Resin is also identified as an option for investment casting large parts. |
| Sharp-corner avoidance | Avoid sharp corners and edges where possible. | Sharp edges increase metal turbulence and concentrate expansion stresses in the mold. |
| Negative-feature proportions | Keep engraved channels and holes wider than they are deep. | This is a rule of thumb, particularly important for small negative features where the surrounding investment is fragile. |
| Investment-breakage symptoms | Filled-in negative features such as engraves and stone holes; usually accompanied by rough cast surfaces or pitting. | Potential signs of investment breakage; surface roughness or pitting results from investment debris. |
| Feed-sprue geometry | Design feed sprues either straight or tapered down towards the piece. | Applies to feed sprues. |
| Use of 3D-printed feed sprues | Use only where placing wax sprues would be difficult. | Example given: connecting one inaccessible area of the resin pattern to another. |
| Sprue-material preference | Real wax sprues promote better cast-part quality. | They give the pattern early access to oxygen when it melts out. |
| PreForm supports as sprues | Do not use PreForm supports as sprues. | When planning to 3D print sprues. |
| Printed sprue design | Incorporate 3D printed sprues into the CAD design. | Formlabs recommends this when intending to 3D print sprues. |
| Sprue attachment-point design | Add a CAD sprue attachment point, such as a hole in the bottom of a ring band or a small hollow post to fill or surround with wax when attaching to a sprue rod. | Helps attach and retain heavy resin patterns on wax sprues, avoiding a pattern floating in the poured flask. |
| Thin-shell strategy | Hollow the design to a thin-walled shell. | For large, monolithic Castable Wax Resin designs; the shell minimizes expansion forces on the investment during burnout. |
| Castable Wax Resin shelling trigger | Parts thicker than 3 mm should be shelled. | Castable Wax Resin. |
| Castable Wax Resin drain-hole requirement | Drain holes must be added to allow resin to flush out of the hollow interior. | When a Castable Wax Resin part is shelled. |
| Recommended hollow-shell wall | 0.7 mm thick walls | Formlabs recommendation for hollow shells printed in Castable Wax Resin; described as the minimum wall thickness. |
| Shell-operation inspection | Check for areas close to, or less than, double the minimum 0.7 mm wall thickness. | For hollow, thin-shelled Castable Wax Resin patterns; shell CAD may not touch these areas, leaving regions too thick for casting. |
| Interior lattice | A lattice can be added. | To improve handling strength of large shelled parts printed in Castable Wax Resin. |
| Excessively thick-part risk | Excessively thick parts are likely to cause expansion cracks. | During burnout. |

### gaps

- No post-cure protocol, wash sequence, or wash/cure times and temperatures.
- No drain-hole diameter, count, or placement rules; no complete shell-CAD procedure.
- No sprue-tree counts, diameters, lengths, or minimum wax-attachment dimensions.
- No burnout process temperature, heating rate, or hold times. The listed furnace value is not identified as an operating setpoint.
- No investment thickness, permeability limits, investment recipe, or metal-pouring temperature and pressure requirements.


### morris and watson cad design guidelines

| rule | value | condition |
| --- | --- | --- |
| Edge/point/corner radius | ≥ 0.125 mm | All edges, points and corners, including split shanks and lettering |
| Void depth | Depth ≤ opening width | Lettering, stone holes, fine gaps and spaces |
| Maximum recommended hole depth | ≤ 0.30 mm | Holes |
| Gap between non-touching components | ≥ 0.20 mm | Claws, setting posts, walls and similar components |
| Gap too small to maintain | Fill the gap and drill it out later | If a gap of ≥ 0.20 mm is not possible |
| Hole diameter | > 0.20 mm | Any hole |
| Hole depth relative to opening | Depth ≤ diameter or opening width | Any hole |
| Pilot-hole design | Use a small pilot divot; drill the full hole later | If the design requires holes |
| CAD model integrity | No naked edges; watertight model | Model geometry; both are listed as common casting issues |
| Support and metal flow | Avoid thin or unsupported components and designs that restrict metal flow | Model design; no numeric definition of “thin” is supplied |

- No numeric minimum section/wall thickness, shrinkage allowance, sprue requirements or alloy-specific casting rules are provided.
- Hole-depth guidance is not reconciled: the source states both ≤ 0.30 mm maximum depth and depth ≤ opening width/diameter.


### cooksongold casting design tips

| rule | value | condition |
|---|---|---|
| Model watertightness | Must be watertight, with no naked or non-manifold edges | Before upload; these issues often arise from shared edges or points |
| Maximum design dimensions | 30mm x 50mm x 70mm | Designs must fit within these dimensions; larger files are not processed |
| External wall thickness | Minimum 0.8mm | External walls |
| Small-element thickness | Minimum 0.5mm | Smaller elements, such as claws or setting bezels |
| Earring posts | Omit from the printed model; solder after casting | Earring posts are not recommended for printing because of their delicate nature |
| Raised text thickness | At least 0.3mm | Raised text |
| Raised text height | No more than 0.6mm | Raised text |
| Raised letter spacing | Minimum 0.3mm | Between raised letters |
| Recessed text thickness | At least 0.3mm | Recessed text |
| Recessed text depth | No more than 0.5mm | Recessed text |
| Recessed letter spacing | Minimum 0.3mm | Between recessed letters |
| Small holes | Avoid holes smaller than 0.5mm; fill them during CAD | Small holes that can cause casting issues |
| Pilot-hole geometry | Use conical or spherical shapes; pilot divot width must be larger than its depth | If pilot holes are necessary for settings |
| Detail geometry recommendation | Apply a negative draft angle (taper); round or fillet sharp edges | When incorporating text or intricate details |
| Hollow construction | Not processed; cast two halves separately, then solder or weld together | If the design would otherwise be hollow |
| Interlocking or multiple-piece construction | Cast individual components and assemble afterward | Interlocking or multiple-piece designs |
| Sprue placement | Leave placement to Cooksongold; communicate specific preferences directly to the team | Customer-added sprues can increase STL volume and cost |
| Shrinkage compensation | Cooksongold applies a scaling increase | To compensate for shrinkage and match intended final dimensions |
| Material removed by polishing | Approximately 0.1mm | During polishing; the amount depends on the processes used |
| High-shine finishing allowance | Add extra material to help preserve intended dimensions | Areas intended for a high-shine finish |

### gaps

- No numerical shrinkage factor or general dimensional tolerance.
- No draft-angle magnitude, fillet radius, or minimum mesh-repair overlap/local thickening.
- No general minimum feature size beyond the specified walls, text, and holes.
- No STL resolution requirement or sprue dimensions and placement coordinates.


### formlabs castable wax resin support

| rule | value | condition |
|---|---|---|
| Material formulation | A 20% wax-filled material; an acrylate photopolymer formulated with liquid wax. | Castable Wax Resin. |
| Equipment compatibility | Use a compatible Formlabs SLA printer and compatible resin tank; check the resin tank compatibility table before use. | Tank compatibility is required to avoid equipment damage. |
| Print prerequisites | Compatible printer with up-to-date firmware, most recent version of PreForm software, and build platform. | Castable Wax printing. |
| PreForm preparation | Install or update PreForm, open the model, and set up the print job. | Castable Wax print preparation. |
| Listed equipment | Form Wash or Finish Kit; Form Cure. | Required-resource list; the casting workflow separately specifies washing followed by casting without post-curing. |
| Post-processing before casting | Wash, then cast; no post-cure is required. | Direct investment casting with Castable Wax. |
| CAD resource | Jewelry-specific CAD software, such as JewelCAD or RhinoGold. | Required third-party resources. |
| Investment for Standard Burnout Schedule | Certus Prestige Optima. | Recommended investment. |
| Investment for Short Burnout Schedule | Nobilium Microfire. | Recommended investment. |
| Burnout oven capability | Oven capable of 750 °C. | Required resource; this is oven capability, not a stated burnout-stage setpoint. |
| Casting equipment | Vacuum chamber and casting system, such as Indutherm MC-series or the Neutec J2R; compressed air. | Required third-party resources. |
| Abrasive | Sandpaper, 400 grit or above. | Listed required resource; the supplied text does not assign a specific surface-preparation operation. |
| Recommended pattern types | Direct investment casting of jewelry models, including delicate features such as filigree, pavé geometries, thin walls, and fine surface details. | Castable Wax Resin. |
| Prototype use | Prints are strong enough for prototyping and fitting. | Before production. |
| Not recommended | Final or functional parts; large, bulky patterns. | Castable Wax Resin. |
| Castable-resin selection | Smaller parts or wire filigree: Castable Wax Resin. Medium to heavy jewelry or small engineering components: True Cast Resin. Larger investment casting: Clear Cast Resin. | When selecting among the listed Formlabs castable resins. |
| Burnout ventilation | Design airflow vents in thick or large geometries to allow sufficient ventilation during burnout. | Casting pattern design. |

### gaps

- The supplied text gives no layer heights, print resolution, exposure settings, orientation rules, support rules, or printer-specific material/tank pairings.
- No numeric geometry limits are given for walls, holes, channels, prongs, or other delicate features, nor numeric size thresholds for the “smaller,” “medium to heavy,” or “larger” categories.
- Complete Standard and Short Burnout Schedules are absent: no stage temperatures, heating rates, hold times, cooling requirements, or maximum ramp rates. The only thermal number is the **750 °C** oven capability.
- Investment compatibility is limited to two recommendations; the source excerpt supplies no powder/liquid ratios, mixing sequence, working time, vacuum/degas parameters, or investment-to-pattern ratio.


### formlabs true cast resin support

| rule | value | condition |
| --- | --- | --- |
| Precision-casting thickness limit | Up to 5 mm thick | For intricate jewelry and complex engineering components. |
| Wire-filigree restriction | Not recommended; use Castable Wax Resin | For wire filigree. |
| Oversize-part restriction | Not recommended; use Clear Cast Resin | For parts larger than 5 mm thick. |
| Printing layer height | 25 microns and 50 microns | For True Cast Resin printing with a compatible printer. |
| Ash content | 0.03% | Stated for True Cast Resin in connection with clean burnout. |
| Workflow step 1—pattern design | Design the part in CAD software | Before the casting workflow proceeds to resin conditioning. |
| Workflow step 2—pre-heat and mix | Heat, then mix the resin before printing | Ensure the wax component is completely liquid and evenly dispersed. |
| Resin-heating equipment | Resin heater | Required third-party resource for pre-heating. |
| Workflow step 3—pattern printing | 3D print with True Cast Resin, following Formlabs instructions | After pre-heating and mixing. |
| Workflow step 4—initial wash | Thoroughly clean the printed patterns with IPA | Remove residual uncured resin. |
| Workflow step 4—second wash | Rinse for a second time in clean IPA | Ensure the patterns are completely clean. |
| Uncured-resin defect risk | Uncured resin on parts | May result in casting defects. |
| Workflow step 5—drying | Dry With Compressed Air | Only the step title is present in the provided excerpt. |
| Formlabs printing resources | Compatible Formlabs SLA printer, build platform, compatible resin tank, True Cast Resin, and PreForm software | Use up-to-date printer firmware and the most recent PreForm version. |
| Third-party printing resource | Compatible resin printer | Listed among required third-party resources. |
| Washing and post-curing resources | Form Wash (2nd Generation) or another washing system; Form Cure (2nd Generation) or another post-curing system | Required for washing and post-curing. |
| Burnout and casting equipment | Burnout oven; vacuum chamber and casting system, such as the Neutec J2R | Listed third-party required resources. |
| Ancillary equipment | End nippers, flasks, investment, vacuum, wax, waxing tools, etc. | Listed third-party required resources; investment details are not specified. |
| Cleaning alcohol | IPA or ethyl alcohol, concentration of 91% or higher | Required cleaning resource. |
| Abrasive | Sandpaper (1000 grit) | Listed ancillary resource; no sanding procedure is provided. |

### gaps

- Investment material, composition, mixing ratio, vacuum-investment procedure, and investment-setting requirements.
- Preheat temperature or time, printer exposure and orientation, wash and post-curing schedules, and burnout and casting schedules.
- Minimum feature size, minimum wall thickness, undercuts, draft angles, dimensional tolerances, or how the 5 mm limit maps to CAD geometry.
- Compressed-air drying pressure, duration, or method beyond the workflow step title.

## openscad compiler notes


### openscad manual: stl import and export

| rule | value | condition |
| --- | --- | --- |
| STL geometry importer | `import()` | Importing external geometry. |
| Supported 3D geometry formats | STL (both ASCII and Binary), OFF, OBJ, AMF (deprecated), 3MF | Importing geometry with `import()`. |
| GUI command insertion | `File >> Open` may insert `import()`; enter a wildcard such as `*.stl` when the file-type filter shows only OpenSCAD files | Requires version `2015.03-2`. |
| Legacy STL importer | `import_stl()` is deprecated; use `import()` | Removal is deferred to a future release; no removal version is given. |
| Relative `file` path | Resolved relative to the importing script | The given path is not absolute. |
| Relative path through inclusion | Resolved relative to the script doing the `include<>` | A script loaded with `include<>` uses `import()`. |
| Object placement | `center` is Boolean; `true` places the object’s center at the origin | `center=true` on the `import()` module. |
| Preview convexity | Optional integer `convexity`: maximum number of front sides, or back sides, a ray intersecting the object might penetrate | Needed for correct display in OpenCSG preview mode; has no effect on polyhedron rendering. |
| Suggested convexity | `10` | Should work fine for most cases; not stated as a default. |
| Polygon segment count | `$fn`: Double specifying the number of polygon segments | Converting circles, arcs, and curves to polygons; requires version `Development snapshot`. |
| Minimum angle step | `$fa`: Double | Converting circles and arcs to polygons; requires version `Development snapshot`. |
| Minimum segment length | `$fs`: Double | Converting circles and arcs to polygons; requires version `Development snapshot`. |
| STL cleanliness | The mesh has to be manifold and should contain neither holes nor self-intersections | An imported STL must be rendered later. |
| Failure modes for unclean STL | Possible outcomes include manifold warnings, disappearance from output, or CGAL assertion violations | Computational geometry is performed, such as rendering the STL combined with another object. |
| Repair-tool capabilities | Semi-Automatic Repair Options repairs holes but not self-intersections; netfabb basic does neither; MeshLab can fix all listed issues | Repairing an imported STL. |
| MeshLab non-manifold check | The screen should show `0 non manifold edges` and `0 non manifold vertices` | After the documented selection, closure, and vertex-deletion cleanup step. |
| MeshLab STL export | `File → Export Mesh`; save as STL | After repairing the mesh in MeshLab. |
| Experimental data-import flag | Enable `import-function`; only JSON files are supported | Using the `import()` function for data rather than geometry; requires version `Development snapshot`. |

### gaps

- The source provides no STL export command or syntax, export CLI flags, or export-side ASCII/Binary selection rules.
- It gives no byte-reproducibility guarantees, including guarantees for triangle order, vertex order, or coordinate formatting.
- It gives no numeric mesh-validation tolerances, hole-size limits, vertex-merge distances, repair-pass counts, or default `convexity`.
- It provides no pinned command-line workflow; features labeled `Development snapshot` have no fixed release number here.
- It does not specify CAD units, physical-size mapping, coordinate orientation, or whether the polygon-conversion parameters affect imported STL meshes.


### openscad manual: customizer

| fact | detail |
|---|---|
| Version requirement | The Customizer feature requires OpenSCAD version 2019.05. |
| Purpose | Customizer exposes model parameters for GUI editing, avoiding code edits. Saved parameter sets can represent model variants. |
| Main-file scope | Only variables assigned in the main file are displayed. Variables assigned in files loaded through `include` or `use` are not displayed. |
| Supported value types | Supported values are strings, numbers, booleans, or lists containing at most four numeric literals. |
| Unsupported expressions | Expressions are unsupported even when trivial, including `str("String"," ","concat")` and `12 + 0.5`. |
| Assignment position | A supported assignment must appear before the first `{` syntax element. |
| Hidden section | A line containing only `/* [Hidden] */` prevents subsequent assignments in that section from being displayed. This is described as the best-practice cutoff. |
| Non-stopping declaration | A module or function declaration containing no `{` does not stop Customizer; subsequent supported assignments remain displayed. |
| Legacy cutoff | An empty module such as `module __Customizer_Limit__ () {}` places a `{` in the file and hides following assignments from Customizer. |
| Description syntax | A description uses a `//` comment on the line above an assignment. The description comment must align with the source file’s left column without spaces. |
| Drop-down annotation | A trailing `// [...]` annotation lists number or string choices, e.g. `Numbers=2; // [0, 1, 2, 3]` or `Strings="foo"; // [foo, bar, baz]`. |
| Labeled drop-down annotation | Choices may use `value:label`, e.g. `Labeled_values=10; // [10:S, 20:M, 30:L]` or `Labeled_value="S"; // [S:Small, M:Medium, L:Large]`. |
| Slider annotation | Sliders accept numbers only. `// [50]` specifies a maximum; `// [10:100]` specifies minimum and maximum. |
| Step-slider annotation | `// [0:5:100]` specifies minimum, step, and maximum; the example uses minimum `-10`, step `0.1`, and maximum `10`. |
| Slider compatibility | Maximum-only slider syntax, `// [50]`, is mainly provided for Thingiverse compatibility. |
| Checkbox annotation | A boolean assignment such as `Variable = true;` uses a checkbox. Checkboxes are not supported by Thingiverse. |
| Spinbox annotation | `Spinbox = 5;` uses step size 1; `Spinbox = 5.5; // .5` specifies step size 0.5. |
| Textbox compatibility | The supplied note states that the textbox example works in release 2021.01 and may not work in future versions. |

Gaps:
- Ordered and named module/function parameters are not covered in the supplied source.
- General Customizer section syntax is absent beyond the `[Hidden]` section.
- The textbox section is truncated; its example and complete compatibility statement are missing.


### openscad downloads and versions

| rule | value | condition |
| --- | --- | --- |
| Stable release version listed | `2021.01` | macOS, Windows, Other Linux, and source-code downloads |
| Stable macOS artifact | `OpenSCAD-2021.01.dmg`; 64 bit Intel; `27 MB` | macOS |
| Stable Windows artifacts | `OpenSCAD-2021.01-x86-32-Installer.exe`; `OpenSCAD-2021.01-x86-32.zip`; `OpenSCAD-2021.01-x86-64-Installer.exe`; `OpenSCAD-2021.01-x86-64.zip`; `21 MB` per package | Windows; x86 (32-bit) and x86 (64-bit) |
| Stable Other Linux artifacts | `OpenSCAD-2021.01-x86_64.AppImage`; x86 (64-bit); `39 MB`; `OpenSCAD-2021.01-aarch64.AppImage`; ARM (64-bit); `43 MB` | Other Linux |
| Stable source artifact | `openscad-2021.01.src.tar.gz`; `16 MB` | Source Code |
| Checksum file types linked | `sha256`; `sha512` | Stable-artifact and Release Candidate download entries |
| Signature file type linked | `asc` | Stable Windows, Other Linux, and source-code downloads; Release Candidate entries |
| Listed GnuPG key ID | `0x8AF822A975097442` | Release Candidates; binaries signed with GnuPG |
| Listed GnuPG fingerprint | `B3C9 4B42 50DC 097E 9FFF 8177 8AF8 22A9 7509 7442` | Release Candidates; binaries signed with GnuPG |
| Release Candidate content | All features that will be included in the next release | Intended for testing before the final release |
| Docker image release and base | `2021.01`; based on Debian Buster | `openscad/openscad` image; `linux/amd64` |
| Docker image release and base | `2019.05`; based on Debian Buster | `openscad/openscad` image; `linux/amd64` |
| Docker image release and base | `2015.03`; based on Debian Stretch | `openscad/openscad` image; `linux/amd64` |
| Docker development channel and base | Development snapshot; based on Debian Bookworm | `openscad/openscad` image; `linux/amd64` |

**gaps**

- No complete release history, release dates, or changelog.
- No exact version/date is shown for Nightly Builds, Development snapshot images, or Release Candidate downloads.
- No literal `sha256` or `sha512` values are included; only checksum-file links.
- Package-manager entries do not provide the versions they currently resolve to.
- No output-compatibility guarantees or explicit version-scheme rules are stated.


## next extraction targets

- the openscad 2d/3d primitives manual page failed to scrape (the retrieval returned a missing-page notice); the language reference for primitives and resolution variables still needs a clean pull.
- gildform's model requirements page rate-limited twice; it moves to the ask list.
- per the gaps lists above: every partner's shrinkage factor, dimensional tolerance, sprue dimensions, and burnout setpoints remain unpublished and move to [acquire.md](acquire.md).
