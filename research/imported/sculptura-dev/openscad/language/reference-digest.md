# openscad language reference digest for paracraft-jewelry

research: 2026-09-11 · source: https://openscad.org/docs/, https://openscad.org/cheatsheet/, https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/ · status: cited

## thesis

openscad source text is the canonical artifact for paracraft-jewelry, requiring strict adherence to vanilla, dependency-free language primitives to ensure dual compilation across browser (`openscad-wasm`) and cli worker environments, as well as community customizer compatibility. parametric jewelry generation relies heavily on 2d profile operations (`offset`, `polygon`), rotational/linear extrusions (`rotate_extrude`, `linear_extrude`), and boolean csg (`difference`, `union`, `intersection`). facet density must be managed via explicit `$fn` preview/export splitting (`$preview ? 32 : 192`), leveraging `$fn` values divisible by 4 for exact axis alignment. canonical `.scad` outputs must enforce zero-thickness prevention, mandatory face overlap epsilons (`0.01`mm), and strict customizer header structure to guarantee deterministic, manifold manufacturing geometry across all downstream pipelines.

## the reference

### 1. extrusion primitives: `rotate_extrude` & `linear_extrude`

| primitive | parameter | type / range | default | official documentation rules & behavior |
|---|---|---|---|---|
| `rotate_extrude()` | `angle` | number (deg) | `360` | sweeps 2d profile counter-clockwise (right-hand rule) around z-axis (source: [2]). positive sweeps ccw; negative sweeps clockwise (source: [2]). requires openscad 2019.05+ (source: [2]). |
| | `convexity` | integer | `2` | opencsg render preview hint (source: [2]). set to `10` for complex concave cross-sections (source: [2]). |
| | `$fn`, `$fa`, `$fs` | special vars | inherited | controls rotational segment density around the sweep axis (source: [2]). |
| | *2d profile rule* | geometry | `x >= 0` | profile must lie in x-y plane strictly on `x >= 0` (or strictly `x <= 0`) (source: [2]). spanning `x = 0` triggers console warning and ignores extrusion (source: [2]). touching `x = 0` must occur along a 2d line segment, not a 0d point (point touch causes 0-thickness cgal error, source: [2]). |
| `linear_extrude()` | `height` | number (> 0) | `5` | extrusion height along vector `v` (source: [2]). height must be strictly positive (source: [2]). |
| | `center` | boolean | `false` | when `true`, centers solid along z from `-height/2` to `+height/2`; when `false`, extrudes `0` to `height` (source: [2]). |
| | `twist` | number (deg) | `0` | rotates 2d profile around extrusion vector as it extrudes upward (left-hand rule) (source: [2]). |
| | `scale` | scalar or `[x,y]` | `1.0` | scales 2d profile factor over height (source: [2]). |
| | `slices` | integer | `1` / `20` | intermediate z-height slices for twist/scale (default `1` when `twist = 0`, usage templates show `20`, source: [2]). |
| | `v` | vector `[x,y,z]` | `[0,0,1]` | extrusion direction vector pointing into positive z direction (source: [2]). |
| | *implicit projection* | rule | hardcoded | 2d inputs transformed in 3d prior to extrusion undergo implicit `projection()` onto x-y plane, ignoring z coordinates (source: [2]). |

### 2. transformations & morphing: `offset`, `hull`, `minkowski`

| operator | mode / argument | default | official documentation rules & behavior |
|---|---|---|---|
| `offset()` | `r = amount` | `r = 1` | radial offset using rolling circle of radius `r` (positive `r` expands exterior, negative `r` shrinks interior) (source: [3]). requires openscad 2015.03+ (source: [3]). |
| | `delta = amount` | unset | straight delta offset by fixed perpendicular distance outward/inward (source: [3]). |
| | `chamfer = bool` | `false` | when `true` in delta mode, chamfers sharp exterior corners instead of joining edges (source: [3]). |
| | *fillet / round idioms* | pattern | N/A | fillet (round concave corners): `offset(r = -3) offset(delta = +3)` (holes `< 2*r` vanish, source: [3]). round (round convex corners): `offset(r = +3) offset(delta = -3)` (walls `< 2*r` vanish, source: [3]). |
| `hull()` | children | N/A | computes 2d or 3d convex hull enclosing all child nodes (source: [3]). |
| | *2d performance rule* | guideline | N/A | performing 2d `hull()` on 2d circles followed by `linear_extrude()` is computationally far faster than 3d `hull()` on cylinders (source: [3]). |
| `minkowski()` | children | N/A | computes minkowski sum of child nodes (source: [3]). |
| | *dimension sum rule* | behavior | summed | outer dimensions and height are explicitly summed: `cube([10,10,1])` + `cylinder(r=2, h=1)` yields outer size `14`x`14`x`2`mm, expanding width by `2*r = 4`mm and height by `1`mm (source: [3]). |
| | *origin dependency* | alignment | origin | child object origins determine expansion symmetry (centered cylinder expands z symmetrically `±0.5`, uncentered expands `+1` in z, source: [3]). |

### 3. boolean csg operations: `union`, `difference`, `intersection`

| operation | logical function | official documentation rules & requirements |
|---|---|---|
| `union()` | logical or | merges child solids into a single volume (source: [4]). implicit when multiple statements are grouped (source: [4]). |
| `difference()` | logical and not | subtracts 2nd through nth child solids from the 1st child solid (source: [4]). |
| `intersection()` | logical and | retains only volume shared/common to all child solids (source: [4]). |
| *coincident surfaces* | boundary violation | coincident faces on merged or subtracted boundaries produce undefined behavior, non-manifold geometry, or dropped volumes in cgal (source: [4]). |
| *epsilon overlap rule* | manifold requirement | subtraction cuts and overlapping joins must extend beyond boundaries using a small epsilon (e.g. `eps = 0.01`mm) to guarantee clean manifold mesh generation (source: [4]). |
| `render()` | preview csg engine | forces full cgal polyhedral csg computation in f5 preview mode (source: [4]). default `convexity = 1`; `10` recommended for complex shapes (source: [4]). |

### 4. facet resolution: `$fn`, `$fa`, `$fs` semantics

| variable | description | default | minimum value | official behavioral rules |
|---|---|---|---|---|
| `$fa` | minimum angle per segment (deg) | `12` (30 segs/360°) | `0.01` | sets max segment angle for arcs/circles (source: [5]). setting `< 0.01` triggers a console warning (source: [5]). |
| `$fs` | minimum segment length (units) | `2` | `0.01` | sets min segment length so small circles get fewer facets (source: [5]). setting `< 0.01` triggers a warning (source: [5]). |
| `$fn` | fixed facet count for 360° | `0` (disabled) | `0` | when `$fn > 0`, `$fa` and `$fs` are completely ignored (source: [5]). |

- official c-code resolution logic (source: [5]):
```c
int get_line_segments_from_r(double r, double fn, double fs, double fa) {
    if (r < GRID_FINE) return 3;
    if (fn > 0.0) return (int)(fn >= 3 ? fn : 3);
    return (int)ceil(fmax(fmin(360.0 / fa, r * 2 * M_PI / fs), 5));
}
```
- core facet rules:
  1. when `$fn == 0`, segment count is `ceil(max(min(360/$fa, 2*PI*r/$fs), 5))`, enforcing a hard minimum floor of `5` segments for any arc/circle (source: [5]).
  2. values of `$fn > 128` are discouraged for general performance; values `< 50` are recommended during active design (source: [5]).
  3. Preview/Export split: the built-in boolean `$preview` is `true` in f5 preview and `false` in f6 export (source: [1], [5]). idiom: `$fn = $preview ? 32 : 192;` (source: [5]).
  4. axis alignment rule: setting `$fn` to a multiple of `4` (e.g. 16, 32, 64, 192) places vertices exactly on coordinate axes (0°, 90°, 180°, 270°), ensuring integer bounding boxes (source: [5]).

### 5. customizer syntax & parameter annotations

- system requirements: requires openscad version `2019.05` or higher (source: [6]).
- placement & literal assignment rules:
  - customizer variables must be assigned in the root of the main file before any `{` syntax block or before `/* [Hidden] */` (source: [6]).
  - variable values must be simple literals (string, number, boolean, or 1d vector of up to `4` numbers, source: [6]).
  - variable expressions (e.g. `w = 10 + 2;` or `s = str("a","b");`) are not supported as customizer parameters and will be ignored by the gui parser (source: [6]).
- annotation comment syntax & widgets:
  - tab grouping: `/* [Tab Name] */` creates tab groups (source: [6]). `/* [Global] */` parameters appear in all tabs; `/* [Hidden] */` hides all subsequent variables from the gui (source: [6]).
  - range sliders: `var = 34; // [10:100]` or step slider `var = 2; // [0:5:100]` or max bounded `var = 34; // [50]` (source: [6]).
  - dropdown combobox: `var = 2; // [0, 1, 2, 3]` or labeled `var = "S"; // [S:Small, M:Medium, L:Large]` (source: [6]).
  - spinbox / textbox / checkbox: `var = true;` / `str = "hello"; // 8` (source: [6]).
  - vectors: `vec = [12, 34, 45]; // [1:2:50]` (up to `4` elements, source: [6]).
- json parameter sets & cli:
  - parameter files use json structure with `"fileFormatVersion": "1"` and `"parameterSets"` keys (source: [6]).
  - cli usage: `openscad -o output.stl -p parameters.json -P SetName input.scad` (source: [6]).
  - proxy variable `-D` override pattern: parameters in json customizer sets cannot be overridden directly with `-D param=val`; source code must assign a proxy variable (`part = cpart;`) where `cpart` is exposed in customizer and `part` is overridden via cli `-D` (source: [6]).

### 6. text, vector imports & heightmap surfaces

| module | key parameters | defaults | official documentation rules & behavior |
|---|---|---|---|
| `text()` | `text` | required | creates 2d text geometry (requires openscad 2015.03+, source: [7]). |
| | `size` | `10` | capital letter height in mm; sets font em-size to `100/72` times value (source: [7]). |
| | `font` | `"Liberation Sans"` | fontconfig logical font string name (e.g. `"Liberation Sans:style=Bold"`, source: [7]). |
| | `direction` | `"ltr"` | text flow: `"ltr"`, `"rtl"`, `"ttb"`, `"btt"` (source: [7]). |
| | `halign` / `valign` | `"left"` / `"baseline"` | horizontal: `"left"`, `"center"`, `"right"`. vertical: `"top"`, `"center"`, `"baseline"`, `"bottom"` (source: [7]). |
| | `spacing` | `1` | character spacing multiplier factor (source: [7]). |
| `import()` | `file` | required | imports 2d vector (svg, dxf) or 3d mesh (stl, off, obj, 3mf) files (source: [8]). |
| | `id` / `layer` | unset | `id` selects svg element/group id; `layer` selects dxf layer (source: [8]). |
| | *svg units* | `96` dpi | ununitized svg coordinates resolve to css pixels (`96` dpi, `1px = 0.2645833`mm). |
| `surface()` | `file` | required | imports 3d heightmap surface from dat text matrix or png image (requires version 2015.03+ for png, source: [8]). |
| | `center` / `invert` | `false` / `false` | `center = true` centers xy at origin; `invert = true` inverts height mapping (source: [8]). |
| | *srgb height formula* | scaled `0..100` | png color converted to grayscale height via linear luminance formula: `Y = 0.2126*R + 0.7152*G + 0.0722*B` (source: [8]). alpha channel is ignored (source: [8]). grayscale values scale from `0` to `100` units in z (source: [8]). |

## conditions and caveats

1. **implicit projection contradiction**: we previously assumed 3d-transformed 2d profiles would extrude along their transformed orientation. official docs state that openscad applies an implicit `projection()` onto the x-y plane prior to `linear_extrude` or `rotate_extrude`, ignoring all prior z coordinates (source: [2]).
2. **`rotate_extrude` boundary hazards**: crossing `x = 0` (having both `x > 0` and `x < 0`) causes openscad to issue a console warning and completely ignore the extrusion (source: [2]). touching `x = 0` at a single point creates 0-thickness non-manifold geometry, triggering cgal assertion failures during rendering (source: [2]). profile touches along `x = 0` must be 1d line segments.
3. **minkowski dimension sum inflation**: 3d `minkowski()` sums heights and bounding box dimensions (`width_1 + 2*r`, `h1 + h2`, source: [3]). using 3d `minkowski()` for rounded ring edges causes heavy $o(n \cdot m)$ polyhedral mesh convolutions; 2d `offset()` combined with `linear_extrude()` or `rotate_extrude()` is required to maintain compile budgets.
4. **customizer expression parser limitation**: variables initialized with arithmetic or string expressions (e.g. `ring_radius = inner_diameter / 2;`, source: [6]) are not evaluated or displayed by the customizer panel. only pure literal assignments (`ring_radius = 9.1;`) generate gui widgets.
5. **json customizer set `-D` proxy gotcha**: passing `-p params.json -P SetName` to the cli prevents `-D param=val` from directly overriding parameters defined in the json set (source: [6]). code must expose a proxy parameter (`part = cpart;`) to enable cli parameter overrides during batch manufacturing runs (source: [6]).
6. **font non-determinism across platforms**: `text()` geometry depends on system-installed font files via `fontconfig` (default `"Liberation Sans"`, source: [7]). if `openscad-wasm` (browser) and native cli workers lack identical font files or fallback definitions, generated text glyph meshes and stl byte hashes will diverge.
7. **csg coincident surface artifacts**: coplanar faces in `union()` or `difference()` operations produce floating-point comparison failures, preview z-fighting, non-manifold renders, or missing geometry (source: [4]). an overlap epsilon (e.g., `eps = 0.01`mm) must be applied to all cut boundaries and join interfaces (source: [4]).

## sources

1. openscad cheatsheet: https://openscad.org/cheatsheet/ (retrieved 2026-09-11)
2. openscad user manual: 2d to 3d extrusion: https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/2D_to_3D_Extrusion (retrieved 2026-09-11)
3. openscad user manual: transformations: https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations (retrieved 2026-09-11)
4. openscad user manual: csg modelling: https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/CSG_Modelling (retrieved 2026-09-11)
5. openscad user manual: other language features: https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features (retrieved 2026-09-11)
6. openscad user manual: customizer: https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Customizer (retrieved 2026-09-11)
7. openscad user manual: text: https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Text (retrieved 2026-09-11)
8. openscad user manual: importing geometry: https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Importing_Geometry (retrieved 2026-09-11)
9. openscad user manual: 2d primitives: https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/2D_Primitives (retrieved 2026-09-11)
10. openscad user manual: primitive solids: https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Primitive_Solids (retrieved 2026-09-11)
