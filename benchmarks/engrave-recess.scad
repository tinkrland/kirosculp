// engrave-recess.scad
// benchmark family: engrave-recess
// purpose: text cut into a base plate via difference(), at the sourced
//   depth values (0.3 mm and 0.5 mm per evid-feat-003, evid-engrave-001)
//   and base thicknesses, sized so the remaining wall after the cut is
//   deliberately below and above the 0.8 mm ctr-wall-001 floor in
//   different models. this is the recessed-engrave counterpart to the
//   raised-text sub-family in feature-ladder.scad.
//
// operation exercised: op-engrave (subtractive, recessed relief).
// the mesh inspector cannot distinguish a deliberate engrave from any
// other concavity. the op declaration is the studio-side record;
// the benchmark demonstrates what the validator sees at the mesh level:
// remaining wall after cut vs ctr-wall-001 (minimum_wall_thickness >= 0.8 mm).
//
// sourced depth values and constraints:
//   recessed max depth 0.50 mm: cooksongold (src-0010, evid-feat-003):
//     "recessed text must be ... no more than 0.50mm deep"
//   recessed max depth 0.50 mm: hoover & strong (src-0007, evid-engrave-001):
//     "maximum depth of 0.5mm ... for all CAD/wax engraving"
//   depth-to-width ratio <= 1:1: materialise (src-0001, evid-engrave-002):
//     "maximum height/depth-to-width ratio of 1:1"
//   depth-to-width ratio <= 2:1: stuller (src-0011, evid-feat-004):
//     "depth of recessed letters can be no more than double the width"
//   remaining wall >= 0.35 mm: materialise (src-0001, evid-engrave-002):
//     "keep in mind the minimum wall thickness of 0.35 mm"
//   engraved depth 0.2-0.3 mm to survive finishing: ecadcam (src-0003, evid-feat-002)
//   letter height >= 1.5 mm for script survival: gildform (src-0019, evid-gildform-engrave-001)
//   minimum wall thickness >= 0.8 mm (generic floor): cooksongold (src-0010, evid-wall-006),
//     stuller (src-0011, evid-wall-007)
//
// model grid (base_mm x depth_mm -> remaining = base_mm - depth_mm):
//   engrave-recess-thin-d0.3 : base 1.0 mm, depth 0.3 mm -> remaining 0.7 mm (below 0.8 mm floor)
//   engrave-recess-thin-d0.5 : base 1.0 mm, depth 0.5 mm -> remaining 0.5 mm (below 0.8 mm floor)
//   engrave-recess-safe-d0.3 : base 2.0 mm, depth 0.3 mm -> remaining 1.7 mm (above 0.8 mm floor)
//   engrave-recess-safe-d0.5 : base 2.0 mm, depth 0.5 mm -> remaining 1.5 mm (above 0.8 mm floor)
//
// letter height: 1.5 mm (gildform evid-gildform-engrave-001; sculpteo rule-digest minimum)
// font: Liberation Sans (bundled with openscad 2021.01 docker image; confirmed headless-safe)

/* [engrave-recess parameters] */
// base plate thickness in mm before engraving
// thin base (1.0 mm): remaining wall < 0.8 mm for either depth -> ctr-wall-001 fires
// safe base (2.0 mm): remaining wall >= 1.5 mm for either depth -> ctr-wall-001 passes
base_mm = 2.0;    // default: safe base

// engraving depth in mm
// 0.3 mm: ecadcam shallow floor (evid-feat-002) and cooksongold lower end (evid-feat-003)
// 0.5 mm: cooksongold max (evid-feat-003) and hoover & strong max (evid-engrave-001)
depth_mm = 0.3;   // default: shallow depth

// plate footprint in mm
plate_x = 40;   // value unverified, sized to fit letter and margins
plate_y = 10;   // value unverified

// letter height: 1.5 mm (gildform evid-gildform-engrave-001; also sculpteo minimum)
letter_h = 1.5;

// font: Liberation Sans - bundled with openscad 2021.01 docker image
text_font = "Liberation Sans";

/* [Hidden] */
$fn = 48;

// plate with text recessed by difference()
// the engraving is a single "a" glyph centered on the plate face.
// depth_mm sets the recess depth; remaining wall = base_mm - depth_mm.
difference() {
    cube([plate_x, plate_y, base_mm]);
    // glyph cut: translate to mid-plate, push cut down from top surface
    translate([plate_x / 2 - letter_h / 2, plate_y / 4, base_mm - depth_mm])
        linear_extrude(height = depth_mm + 0.01)
            text("a", size = letter_h, font = text_font,
                 halign = "left", valign = "baseline");
}
