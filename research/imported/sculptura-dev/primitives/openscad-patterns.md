# openscad jewelry design patterns catalog

research: 2026-09-11 · source: https://blog.usedbytes.com/2019/06/making-jewellery/, https://codeandmake.com/post/gem-generator, https://gist.github.com/robbintt/aaa7ea33c195d14d051ac15894c0fed6 (+14 more) · status: cited

## thesis

openscad jewelry modeling in the open-source ecosystem is characterized by two distinct procedural paradigms:

1. **constructive solid geometry (csg) primitives (`difference()`, `union()`, `rotate_extrude()`)**: standard for basic ring shanks, signet tops, and boolean stone seat cutters (e.g., robbintt, yannickbattail, bbo). while accessible, pure csg relying on nested `hull()` operations (such as initial sphere-chain helix sweeps) suffers severe performance degradation (render times >1 hour at production `$fn`) and non-manifold geometric artifacts.
2. **functional Vertex/Matrix polyhedron extrusion (`polyhedron()`, `sweep()`, `skin()`, `scad-utils`)**: championed by oskar linde, kit wallace, and brian starkey. by treating openscad as a functional math engine to evaluate 3d space curves and generating 4x4 transformation matrices for 2d profiles, this approach constructs watertight `polyhedron()` meshes directly. this is the canonical technique for parametric wave, twist, mobius, and comfort-fit shanks.

from a license discipline standpoint:
- **directly liftable (permissive)**: only code licensed under `MIT` or `BSD` (e.g., oskar linde's `scad-utils` math library and code and make's `Gem Generator`) may be integrated directly with attribution.
- **pattern-only reference (copyleft / sharealike)**: `GPL-3.0` (`yannickbattail/openscad-models`), `CC BY-SA 3.0/4.0` (kit wallace's gem cuts and savagerodent's signet ring), and `CC BY-NC-SA 4.0` (bbo's diva ring series) are strictly pattern-only reference. zero code lines may be copied into the `paracraft-jewelry` engine.
- **unlicensed (study-don't-copy)**: proprietary or unlicensed scripts (brian starkey's double-helix ring, robbintt's wedding band gist) are study-only. any dimensions or constant values extracted from unlicensed code must be flagged as `viz-grade, calibrate before production` prior to engine validation.

---

## the patterns: per project

### 1. `scad-utils` & `list-comprehension-demos`: 3d path extrusion & matrix engine
* **author**: oskar linde
* **url**: [https://github.com/openscad/scad-utils](https://github.com/openscad/scad-utils) and [https://github.com/openscad/list-comprehension-demos](https://github.com/openscad/list-comprehension-demos)
* **license**: `MIT` (spdx: `MIT`): permissive, liftable with attribution.
* **scad technique**: mathematical transformation modules (`transformations.scad`, `linalg.scad`, `shapes.scad`), vector algebra, list comprehensions, 4x4 homogeneous transformation matrices (`[x,y,z,1]`), and 3d path extrusion modules (`sweep()`, `skin()`) that output native `polyhedron()` geometries.
* **vocabulary mapping**:
  * **ring profiles**: `comfort`, `wave`, `twist`, `tapered`, `split`, `bypass`.
* **cited dimensions & data**:
  * cross-section transformations evaluated across 3d space curve vectors ([https://github.com/openscad/scad-utils](https://github.com/openscad/scad-utils)).
  * homogeneous transformation matrix math and slice interpolation for smooth curve rendering without cgal boolean bottlenecks ([https://github.com/openscad/list-comprehension-demos](https://github.com/openscad/list-comprehension-demos)).

### 2. making jewellery: 14k gold double helix ring & stone setting series
* **author**: brian starkey
* **url**: [https://blog.usedbytes.com/2019/06/making-jewellery/](https://blog.usedbytes.com/2019/06/making-jewellery/)
* **license**: `unlicensed — study-don't-copy` (author explicitly noted: "unusually for me, i’m not going to be sharing full source code or models, because i want this design to stay unique.")
* **scad technique**: transitioned from naive `hull()` sphere chains along space curves (render time >1 hour at moderate `$fn`) to functional matrix evaluation with `scad-utils` (`sweep()`, `skin()`). uses recursive list comprehensions (`sum_list`) and trigonometric translation/rotation vectors to output watertight `polyhedron()` meshes.
* **vocabulary mapping**:
  * **ring profiles**: `twist`, `wave`.
  * **stone settings**: `bezel`, `prong`.
* **cited dimensions & data**:
  * ring wall thickness: `2.1mm` (flagged `viz-grade, calibrate before production`: [https://blog.usedbytes.com/2019/06/making-jewellery/](https://blog.usedbytes.com/2019/06/making-jewellery/)).
  * helix space curve parameters: `helix_radius = 5.0mm`, `z_step = 0.5mm`, `rot_step = 15.0°`, low-poly preview `$fn = 16` ([https://blog.usedbytes.com/2019/06/making-jewellery/](https://blog.usedbytes.com/2019/06/making-jewellery/)).
  * material target: 14k gold cast via lost-wax 3d printing (shapeways process) ([https://blog.usedbytes.com/2019/06/making-jewellery/](https://blog.usedbytes.com/2019/06/making-jewellery/)).

### 3. gem generator: parametric gemstone model
* **author**: code and make (codeandmake.com)
* **url**: [https://codeandmake.com/post/gem-generator](https://codeandmake.com/post/gem-generator) (also hosted at [https://thangs.com/designer/Code%20and%20Make/3d-model/Gem%20Generator-204676](https://thangs.com/designer/Code%20and%20Make/3d-model/Gem%20Generator-204676) and [https://www.printables.com/model/245802-gem-generator](https://www.printables.com/model/245802-gem-generator))
* **license**: `MIT` (spdx: `MIT` for `.scad` code; cc by for generated `.stl`): permissive, liftable with attribution.
* **scad technique**: truncated cone/pyramid csg primitives (`cylinder()` with variable facet resolution `$fn`), `scale()`, `difference()`, and `union()` to parameterize gemstone crown, girdle, pavilion, table, and culet.
* **vocabulary mapping**:
  * **stone settings**: stone geometry (brilliant cut, pavilion, crown, table, culet).
* **cited dimensions & data**:
  * facet symmetry `$fn` steps from `$fn = 6` (hexagonal cut) up to `$fn = 16` ([https://codeandmake.com/post/gem-generator](https://codeandmake.com/post/gem-generator)).
  * proportional scaling between crown height, pavilion depth, and girdle diameter ([https://thangs.com/designer/Code%20and%20Make/3d-model/Gem%20Generator-204676](https://thangs.com/designer/Code%20and%20Make/3d-model/Gem%20Generator-204676)).

### 4. gem cuts & möbius strip modules
* **author**: kit wallace
* **url**: [https://github.com/KitWallace/openscad](https://github.com/KitWallace/openscad) (specifically `gem.scad` at [https://raw.githubusercontent.com/KitWallace/openscad/master/gem.scad](https://raw.githubusercontent.com/KitWallace/openscad/master/gem.scad) and `mobius-hull-trefoil.scad`)
* **license**: `CC BY-SA 3.0` (spdx: `CC-BY-SA-3.0` / `CC-BY-SA-4.0`): patterns only, zero code copying.
* **scad technique**:
  * `gem.scad`: recursive csg boolean subtraction (`difference()`, `gem(facets, n)`) removing 66 planar cutter cubes (`cube()`, `rotate()`, `translate()`) at exact index and axial angles from an initial bounding cube.
  * `mobius-hull-trefoil.scad`: parameterized 3d space curve point evaluation combined with `polyhedron()` / `hull()` sweeps along a half-twist or full-twist mobius topology.
* **vocabulary mapping**:
  * **stone settings**: stone geometry (brilliant-cut gemstone model with 66 facets).
  * **ring profiles**: `twist`, `wave`, möbius band.
* **cited dimensions & data**:
  * 66-facet brilliant cut angular & height parameters ([https://raw.githubusercontent.com/KitWallace/openscad/master/gem.scad](https://raw.githubusercontent.com/KitWallace/openscad/master/gem.scad)):
    * 1 table facet: axial angle `0°`, height `2.28mm`.
    * 1 culet facet: axial angle `180°`, height `7.8mm`.
    * 16 b-facets: axial angle `35°`, height `5.0mm` (index steps 1..32).
    * 8 m-facets: axial angle `30°`, height `4.46mm` (index steps 4..32).
    * 8 s-facets: axial angle `16°`, height `3.46mm` (index steps 2..32).
    * 16 girdle facets: axial angle `90°`, height `8.5mm` (index steps 2..32).
    * 16 c-facets: axial angle `222°` (`42° + 180°`), height `6.0mm` (index steps 1..32).
    * bounding cube scale factor: `3x` ([https://raw.githubusercontent.com/KitWallace/openscad/master/gem.scad](https://raw.githubusercontent.com/KitWallace/openscad/master/gem.scad)).

### 5. diva ring & openscad for jewelers series
* **author**: bowman (`bbo`)
* **url**: [https://www.thingiverse.com/thing:6172699](https://www.thingiverse.com/thing:6172699) (diva ring), [https://www.thingiverse.com/thing:6143836](https://www.thingiverse.com/thing:6143836) (ring demonstrations), and [https://www.thingiverse.com/thing:6031961](https://www.thingiverse.com/thing:6031961) (prong setting)
* **license**: `CC BY-NC-SA 4.0` (spdx: `CC-BY-NC-SA-4.0`): patterns only, zero code copying.
* **scad technique**: parametric openscad modules (`module`) utilizing csg primitives (`cylinder()`, `sphere()`, `rotate_extrude()`, `difference()`), concentric negative offset cuts for gem seats, and radial array positioning for prong posts.
* **vocabulary mapping**:
  * **ring profiles**: `flat`, `channel`, `eccentric`.
  * **stone settings**: `prong`, `bezel`, `channel`, `flush`.
* **cited dimensions & data**:
  * recommended print settings for direct investment casting: 2 shell perimeter walls, 8% or 100% infill for filing rework ([https://www.thingiverse.com/thing:6143836](https://www.thingiverse.com/thing:6143836)).
  * concentric offset depths for flush gem seats and 4-prong setting geometry ([https://www.thingiverse.com/thing:6172699](https://www.thingiverse.com/thing:6172699)).

### 6. customizable signet ring (savagerodent)
* **author**: savagerodent
* **url**: [https://www.thingiverse.com/thing:6167904](https://www.thingiverse.com/thing:6167904) (also hosted at [https://www.printables.com/model/190791-customizable-signet-ring](https://www.printables.com/model/190791-customizable-signet-ring))
* **license**: `CC BY-SA 4.0` (spdx: `CC-BY-SA-4.0`): patterns only, zero code copying.
* **scad technique**: debossing custom user bitmap images onto a signet top platform using `surface()`, combined with scaled ellipsoid csg subtraction for ring shanks (`scale()`, `sphere()`, `cylinder()`, `cube()`).
* **vocabulary mapping**:
  * **ring profiles**: `signet`.
* **cited dimensions & data**:
  * standard finger hole diameter: `d = 20.0mm` (approx. us ring size 10) ([https://www.thingiverse.com/thing:6167904](https://www.thingiverse.com/thing:6167904)).
  * adjustable deboss depth and border offset parameters for casting relief ([https://www.printables.com/model/190791-customizable-signet-ring](https://www.printables.com/model/190791-customizable-signet-ring)).

### 7. openscad signet ring module (yannickbattail)
* **author**: yannick battail
* **url**: [https://github.com/yannickbattail/openscad-models/tree/main/signetRing](https://github.com/yannickbattail/openscad-models/tree/main/signetRing) (source file: [https://raw.githubusercontent.com/yannickbattail/openscad-models/main/signetRing/signetRing.scad](https://raw.githubusercontent.com/yannickbattail/openscad-models/main/signetRing/signetRing.scad))
* **license**: `GPL-3.0-only` (spdx: `GPL-3.0-only`): patterns only, zero code copying.
* **scad technique**: csg ellipsoid generated by scaling a sphere `scale([1, 0.8, 1.2]) sphere(d=25)`, subtracted by finger bore `cylinder(d=20, h=50)`, flat top plane `cube(24, center=true)`, and side finger relief cutouts `translate([0, ±44.3, -20]) rotate([90,0,90]) cylinder(d=80, h=50)`. text embossed with `linear_extrude(text_height)` and `text()`.
* **vocabulary mapping**:
  * **ring profiles**: `signet`.
* **cited dimensions & data** (all from [https://raw.githubusercontent.com/yannickbattail/openscad-models/main/signetRing/signetRing.scad](https://raw.githubusercontent.com/yannickbattail/openscad-models/main/signetRing/signetRing.scad)):
  * finger hole inner diameter: `d = 20.0mm`.
  * base outer sphere diameter: `d = 25.0mm` with scaling matrix `[1.0, 0.8, 1.2]`.
  * side relief cylinders: `d = 80.0mm`, length `h = 50.0mm`, positioned at `y = ±44.3mm`, `z = -20.0mm`.
  * top crest flat cut bounding cube: `24.0mm`.
  * base platform height: `base_height = 1.0mm`.

### 8. openscad wedding band draft (robbintt)
* **author**: robbintt
* **url**: [https://gist.github.com/robbintt/aaa7ea33c195d14d051ac15894c0fed6](https://gist.github.com/robbintt/aaa7ea33c195d14d051ac15894c0fed6)
* **license**: `unlicensed — study-don't-copy`
* **scad technique**: `rotate_extrude()` of 2d difference profiles (`difference() { square(); circle(); }`) rotated and positioned at upper and lower inner/outer boundaries to carve smooth quarter-circle comfort-fit bezels onto a cylindrical ring band.
* **vocabulary mapping**:
  * **ring profiles**: `flat`, `comfort`, `knife-edge` (edge bevels).
* **cited dimensions & data** (flagged `viz-grade, calibrate before production`: [https://gist.github.com/robbintt/aaa7ea33c195d14d051ac15894c0fed6](https://gist.github.com/robbintt/aaa7ea33c195d14d051ac15894c0fed6)):
  * ring wall thickness: `thickness = 2.1mm`.
  * ring height (band width): `height = 5.0mm`.
  * inner diameter: `diam_inner = 19.35mm` (us ring size 9.5).
  * outer diameter: `diam_outer = 23.55mm` (`diam_inner + 2 * thickness`).
  * plaster casting tolerance: `plaster_tolerance = 0.05mm` (precision casting book reference).
  * safe plaster tolerance multiplier: `300%` (`safe_plaster_tolerance = 0.15mm`).
  * bezel cutout circle diameter: `bezel_circle_diameter = 0.30mm` (`2 * safe_plaster_tolerance`).

### 9. tiffany etoile style ring script (m_g)
* **author**: m_g
* **url**: [https://www.thingiverse.com/thing:12448](https://www.thingiverse.com/thing:12448)
* **license**: `CC BY-SA 3.0` (spdx: `CC-BY-SA-3.0`): patterns only, zero code copying.
* **scad technique**: combination of `rotate_extrude()` band profile with conical/cylindrical boolean subtractions (`cylinder()`, `cone()`) to form tension-set and partial-bezel gem seats for round brilliant cut gems.
* **vocabulary mapping**:
  * **ring profiles**: `flat`, `comfort`.
  * **stone settings**: `tension`, `bezel`, `flush`.
* **cited dimensions & data**:
  * crown bevel angle offsets and seat relief cutouts for round brilliant gems ([https://www.thingiverse.com/thing:12448](https://www.thingiverse.com/thing:12448)).

---

## conditions and caveats

1. **performance & render bottlenecks**:
   - primitive csg using `hull()` chains (e.g., brian starkey's initial double-helix attempt) takes over 1 hour to render at production `$fn` settings in openscad.
   - **recommendation**: `paracraft-jewelry` must avoid `hull()` for space-curve sweeps and instead use path-transformation matrix evaluation (`scad-utils` / `sweep()`) generating direct `polyhedron()` output.

2. **casting & manufacturing tolerances**:
   - lost-wax investment casting requires explicit shrinkage and plaster detail compensations. as noted in `robbintt`'s wedding band draft, plaster detail resolution limit is `0.05mm`, requiring a `300%` safety factor (`0.15mm`) for inner comfort bezels ([https://gist.github.com/robbintt/aaa7ea33c195d14d051ac15894c0fed6](https://gist.github.com/robbintt/aaa7ea33c195d14d051ac15894c0fed6)).
   - wall thicknesses under `1.2mm` risk cast failure or porosity in 14k gold/silver casting.

3. **strict license hygiene & code cleanliness**:
   - **permissive (`MIT`)**: `scad-utils` (oskar linde) and `Gem Generator` (code and make) are mit licensed. code modules can be refactored into the engine with proper attribution notices.
   - **copyleft / restrictive (`GPL-3.0`, `CC BY-SA`, `CC BY-NC-SA`)**: `yannickbattail/openscad-models`, kit wallace's gem/mobius scripts, savagerodent's signet ring, and bbo's diva ring series carry gpl or sharealike licenses. their code is strictly **pattern-only reference**; zero lines of code may be copied into `paracraft-jewelry`.
   - **unlicensed / proprietary**: unlicensed blog posts and gists (brian starkey, robbintt) must be treated as study-only. all numerical constants extracted are flagged `viz-grade, calibrate before production` and must be validated against real jewelry casting benchmarks.

---

## sources

1. **scad-utils (oskar linde)**: [https://github.com/openscad/scad-utils](https://github.com/openscad/scad-utils) · retrieved 2026-09-11
2. **list-comprehension-demos (oskar linde)**: [https://github.com/openscad/list-comprehension-demos](https://github.com/openscad/list-comprehension-demos) · retrieved 2026-09-11
3. **making jewellery (brian starkey)**: [https://blog.usedbytes.com/2019/06/making-jewellery/](https://blog.usedbytes.com/2019/06/making-jewellery/) · retrieved 2026-09-11
4. **gem generator (code and make)**: [https://codeandmake.com/post/gem-generator](https://codeandmake.com/post/gem-generator) · retrieved 2026-09-11
5. **kit wallace openscad scripts (gem.scad & mobius)**: [https://github.com/KitWallace/openscad](https://github.com/KitWallace/openscad) (raw: [https://raw.githubusercontent.com/KitWallace/openscad/master/gem.scad](https://raw.githubusercontent.com/KitWallace/openscad/master/gem.scad)) · retrieved 2026-09-11
6. **diva ring: openscad for jewelers (bbo / bowman)**: [https://www.thingiverse.com/thing:6172699](https://www.thingiverse.com/thing:6172699) · retrieved 2026-09-11
7. **ring demonstrations: openscad for jewelers (bbo / bowman)**: [https://www.thingiverse.com/thing:6143836](https://www.thingiverse.com/thing:6143836) · retrieved 2026-09-11
8. **prong setting (bbo / bowman)**: [https://www.thingiverse.com/thing:6031961](https://www.thingiverse.com/thing:6031961) · retrieved 2026-09-11
9. **customizable signet ring (savagerodent)**: [https://www.thingiverse.com/thing:6167904](https://www.thingiverse.com/thing:6167904) · retrieved 2026-09-11
10. **signetring.scad (yannickbattail)**: [https://github.com/yannickbattail/openscad-models/tree/main/signetRing](https://github.com/yannickbattail/openscad-models/tree/main/signetRing) (raw: [https://raw.githubusercontent.com/yannickbattail/openscad-models/main/signetRing/signetRing.scad](https://raw.githubusercontent.com/yannickbattail/openscad-models/main/signetRing/signetRing.scad)) · retrieved 2026-09-11
11. **draft wedding band (robbintt)**: [https://gist.github.com/robbintt/aaa7ea33c195d14d051ac15894c0fed6](https://gist.github.com/robbintt/aaa7ea33c195d14d051ac15894c0fed6) · retrieved 2026-09-11
12. **ring creation script - tiffany etoile (m_g)**: [https://www.thingiverse.com/thing:12448](https://www.thingiverse.com/thing:12448) · retrieved 2026-09-11
