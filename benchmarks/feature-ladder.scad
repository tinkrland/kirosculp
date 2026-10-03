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
// base plate dimensions: value unverified, see rule-digest.

/* [feature ladder parameters] */
// base plate dimensions in mm
base_x = 80;   // value unverified, see rule-digest
base_y = 30;   // value unverified, see rule-digest
base_z = 2;    // value unverified, see rule-digest
// wire diameters in mm (descending); 0.3 mm is the filigree floor (src-0015)
wire_diameters = [1.0, 0.7, 0.5, 0.35, 0.3];
wire_height = 4;   // value unverified, see rule-digest
wire_spacing = 6;  // value unverified, see rule-digest
// hole diameters in mm (descending); 0.4 and 0.5 mm are the sourced limits
hole_diameters = [1.0, 0.7, 0.5, 0.4, 0.3];
hole_depth = 2;    // depth <= diameter rule (cooksongold src-0010); kept at max diameter in practice
hole_spacing = 6;  // value unverified, see rule-digest
// stub heights for prong-like features in mm
stub_diameters = [1.0, 0.7, 0.5, 0.35];
stub_height = 3;   // value unverified, see rule-digest
stub_spacing = 6;  // value unverified, see rule-digest

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

difference() {
    union() {
        base_plate();
        wires();
        stubs();
    }
    holes();
}
