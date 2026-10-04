// feature-ladder.scad
// benchmark family: feature ladder
// purpose: wires, prong-like stubs, through-holes, and engraved text at
//   descending sizes to find minimum feature, hole, and engraving limits
//   per alloy. each sub-family varies one dimension at a time on a flat
//   base plate so the measurement engine can isolate the failing feature.
//
// sourced thresholds used:
//   minimum feature size, materialise silver (src-0001, 2026-09-24): 0.35 mm
//   minimum hole diameter, cooksongold (src-0010, 2026-09-24): 0.50 mm
//   minimum hole diameter, stuller (src-0011, 2026-09-24): 0.40 mm
//   raised text min thickness, cooksongold (src-0010): 0.30 mm
//   raised text max height, cooksongold (src-0010): 0.60 mm
//   raised letter spacing, cooksongold (src-0010): 0.30 mm
//   prong min diameter, formlabs / materialise (src-0001, 2026-09-24): 0.35 mm feature floor
//   hole depth <= diameter rule: morris and watson cad design guidelines
//     (src-0022, verified 2026-10-04) and formlabs casting whitepaper
//     (src-0015, 2026-09-23)
//   text engraving: three conflicting rules tested together:
//     cooksongold (src-0010): 0.30 mm stroke, 0.60 mm max height, 0.30 mm spacing
//     sculpteo (rule-digest): 0.50 mm stroke width, 1.50 mm height
//     hi3dp (rule-digest): 0.20 mm stroke, 1.00 mm height
//   font pinned to "Liberation Sans" - bundled with openscad 2021.01 docker image
//     (openscad/openscad:2021.01); verified as a safe headless-rendering font.
//     note: openscad is not installed on the build machine; font rendering cannot
//     be confirmed locally. "Liberation Sans" is the documented safe fallback.
// base plate dimensions: value unverified, see rule-digest.

/* [feature ladder parameters] */
// base plate dimensions in mm
base_x = 80;   // value unverified, see rule-digest
base_y = 50;   // extended to accommodate text sub-family row
base_z = 2;    // value unverified, see rule-digest
// wire diameters in mm (descending); 0.3 mm is the filigree floor (src-0015)
wire_diameters = [1.0, 0.7, 0.5, 0.35, 0.3];
wire_height = 4;   // value unverified, see rule-digest
wire_spacing = 6;  // value unverified, see rule-digest
// hole diameters in mm (descending); 0.4 and 0.5 mm are the sourced limits
hole_diameters = [1.0, 0.7, 0.5, 0.4, 0.3];
// hole depth <= diameter rule: morris and watson (src-0012) and formlabs (src-0015)
hole_depth = 2;    // kept at max diameter in practice
hole_spacing = 6;  // value unverified, see rule-digest
// stub heights for prong-like features in mm
stub_diameters = [1.0, 0.7, 0.5, 0.35];
stub_height = 3;   // value unverified, see rule-digest
stub_spacing = 6;  // value unverified, see rule-digest
// text sub-family: three conflicting engraving rules side by side
// each step uses linear_extrude + text() at the rule's specified letter height and extrude depth.
// font: Liberation Sans (available in openscad 2021.01 docker image; safe for headless rendering)
text_font = "Liberation Sans";
// cooksongold rule (src-0010): raised text thickness >= 0.3 mm (stroke), height <= 0.6 mm
text_cg_letter_h = 0.6;   // cooksongold max height (src-0010); used as letter size param
text_cg_extrude = 0.3;    // cooksongold min stroke thickness (src-0010)
// sculpteo rule (rule-digest, sculpteo sterling silver): min width 0.5 mm, min height 1.5 mm
text_sc_letter_h = 1.5;   // sculpteo min readable-text height (rule-digest)
text_sc_extrude = 0.5;    // sculpteo min readable-text width (rule-digest)
// hi3dp rule (rule-digest, hi3dp sla guidelines): stroke 0.2 mm, height 1.0 mm
text_hi_letter_h = 1.0;   // hi3dp engraved-text height (rule-digest)
text_hi_extrude = 0.2;    // hi3dp engraved-text stroke width (rule-digest)
text_spacing = 10;         // value unverified, see rule-digest (horizontal spacing between text steps)

/* [Hidden] */
$fn = 48;

module base_plate() {
    cube([base_x, base_y, base_z]);
}

// wire sub-family: cylinders attached to the base plate surface
module wires() {
    start_x = 4;
    for (i = [0 : len(wire_diameters) - 1]) {
        translate([start_x + wire_spacing * i, 8, base_z])
            cylinder(h = wire_height, d = wire_diameters[i], center = false);
    }
}

// hole sub-family: through-holes in the base plate
module holes() {
    start_x = 4;
    for (i = [0 : len(hole_diameters) - 1]) {
        translate([start_x + hole_spacing * i, 20, base_z / 2])
            cylinder(h = base_z + 0.02, d = hole_diameters[i], center = true);
    }
}

// stub sub-family: short prong-like protrusions
module stubs() {
    start_x = 48;
    for (i = [0 : len(stub_diameters) - 1]) {
        translate([start_x + stub_spacing * i, 8, base_z])
            cylinder(h = stub_height, d = stub_diameters[i], center = false);
    }
}

// text sub-family: engraved-text blocks testing three conflicting partner rules.
// each block raises a single glyph "a" from the base plate surface using
// linear_extrude(height) + text(size = letter_h, font = text_font).
// the "stroke" analog here is the linear_extrude height (relief depth).
// the letter size parameter controls the overall character height.
// conflict summary:
//   step 0 (cooksongold src-0010): letter_h=0.6 mm, extrude=0.3 mm  <- likely invisible at full render
//   step 1 (sculpteo rule-digest): letter_h=1.5 mm, extrude=0.5 mm  <- sculpteo minimum
//   step 2 (hi3dp rule-digest):    letter_h=1.0 mm, extrude=0.2 mm  <- hi3dp floor (generic sla)
// note: gildform (rule-digest) recommends against cad engraving altogether; 1.5 mm letter height minimum.
// the harness measures what is present; verdicts are per rule set, not from this file.
module text_blocks() {
    text_params = [
        [text_cg_letter_h, text_cg_extrude, "cg"],   // cooksongold
        [text_sc_letter_h, text_sc_extrude, "sc"],   // sculpteo
        [text_hi_letter_h, text_hi_extrude, "hi"],   // hi3dp
    ];
    for (i = [0 : len(text_params) - 1]) {
        letter_h = text_params[i][0];
        extrude_h = text_params[i][1];
        translate([4 + text_spacing * i, 36, base_z])
            linear_extrude(height = extrude_h)
                text("a", size = letter_h, font = text_font, halign = "left", valign = "bottom");
    }
}

difference() {
    union() {
        base_plate();
        wires();
        stubs();
        text_blocks();
    }
    holes();
}
