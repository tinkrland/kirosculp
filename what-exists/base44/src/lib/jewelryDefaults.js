export const JEWELRY_TYPES = ["ring", "pendant", "bracelet", "earring", "piercing", "chain", "keychain"];

export const MATERIALS = {
  silver:     { label: "Sterling Silver", color: 0xd4d4d4, roughness: 0.10, metalness: 1.0 },
  gold:       { label: "18k Yellow Gold", color: 0xf5c842, roughness: 0.08, metalness: 1.0 },
  "rose-gold":{ label: "Rose Gold",       color: 0xe8a68c, roughness: 0.10, metalness: 1.0 },
  brass:      { label: "Brass",           color: 0xb5a642, roughness: 0.20, metalness: 0.9 },
  oxidized:   { label: "Oxidized Silver", color: 0x2a2622, roughness: 0.55, metalness: 0.7 },
  copper:     { label: "Copper",          color: 0xb87333, roughness: 0.18, metalness: 0.9 },
};

export const FINISHES = ["polished", "brushed", "hammered", "matte", "satin"];
export const FINISH_ROUGHNESS = { polished: 0.0, brushed: 0.35, hammered: 0.55, matte: 0.75, satin: 0.22 };

// ── Ring ─────────────────────────────────────────────────────────────────────
export const RING_PROFILES = [
  "flat", "comfort", "knife-edge", "barrel", "signet",
  "wave", "twist", "split", "open", "tapered", "bypass",
];

export const RING_PROFILE_DESC = {
  flat:        "classic flat band",
  comfort:     "rounded inner edge, easy to wear",
  "knife-edge":"sharp outer ridge",
  barrel:      "convex outer surface",
  signet:      "flat top face plate",
  wave:        "undulating wavy silhouette",
  twist:       "rope / twisted band",
  split:       "band splits into two at top",
  open:        "open / resizable — no full closure",
  tapered:     "wider at front, tapers to back",
  bypass:      "two tips that bypass each other",
};

// ── Pendant ──────────────────────────────────────────────────────────────────
export const PENDANT_SHAPES = ["circle", "teardrop", "hexagon", "shield", "square", "leaf", "star", "cross", "crescent", "arrow", "key", "heart"];
export const PENDANT_BAILS  = [
  "open-ring", "closed-ring", "hinged", "box-bail",
  "lobster-clasp", "toggle", "snap", "tube-bail",
];

// ── Bracelet ─────────────────────────────────────────────────────────────────
export const BRACELET_STYLES = ["bangle", "cuff", "chain-link", "tennis", "wire-wrapped", "bypass"];
export const BRACELET_CLASPS = [
  "lobster",      "box",        "toggle",     "magnetic",
  "slide-lock",   "spring-ring","fold-over",  "push-pull",
  "hook-eye",     "ball",       "bayonet",    "infinity",
];

// ── Earring ──────────────────────────────────────────────────────────────────

// earring category groups — drives which shapes appear and which backs are valid
export const EARRING_CATEGORIES = [
  { id: "stud",    label: "stud",         desc: "sits flat on earlobe — piercing required" },
  { id: "hoop",    label: "hoop",         desc: "circular / oval loop through the piercing" },
  { id: "drop",    label: "drop / dangle",desc: "hangs below the earlobe" },
  { id: "climber", label: "ear climber",  desc: "follows the curve of the ear upward" },
  { id: "cuff",    label: "ear cuff",     desc: "wraps around the helix — no piercing needed" },
  { id: "wrap",    label: "ear wrap",     desc: "winds around the outer ear" },
  { id: "threader",label: "threader",     desc: "thin chain threads through the piercing" },
  { id: "crawler", label: "crawler",      desc: "sits inside the ear, faces forward" },
];

export const EARRING_SHAPES_BY_CATEGORY = {
  stud:     ["circle", "square", "triangle", "heart", "star", "hexagon", "oval", "custom"],
  hoop:     ["thin-wire", "wide-band", "huggie", "twisted", "hammered", "open"],
  drop:     ["teardrop", "bar", "leaf", "chandelier", "circle", "geometric", "chain-drop"],
  climber:  ["straight", "curved", "wave", "vine"],
  cuff:     ["plain-band", "wrap-band", "spike", "chain-cuff"],
  wrap:     ["coil", "vine-wrap", "multi-band"],
  threader: ["plain", "bar-end", "gem-end"],
  crawler:  ["linear", "curved", "branching"],
};

// which back mechanisms are valid for each category
export const EARRING_VALID_MECHANISMS = {
  stud:     ["butterfly", "disc-back", "screw-back", "push-fit", "la-pousette", "clip-on"],
  hoop:     ["huggie-snap", "click-ring", "wire-hook", "latch-back", "continuous"],
  drop:     ["french-wire", "lever-back", "omega", "wire-hook", "clip-on"],
  climber:  ["butterfly", "disc-back", "push-fit"],
  cuff:     [], // no back — cuffs squeeze onto helix cartilage
  wrap:     [], // wraps are self-securing
  threader: [], // threader needs no back
  crawler:  ["butterfly", "disc-back", "push-fit"],
};

export const EARRING_MECHANISMS = [
  "butterfly", "disc-back", "la-pousette", "screw-back", "push-fit", "clip-on",
  "huggie-snap", "click-ring", "latch-back", "continuous",
  "french-wire", "lever-back", "omega", "wire-hook",
];

export const EARRING_MECHANISM_DESC = {
  butterfly:      "standard push-back (most common)",
  "disc-back":    "large disc, very secure",
  "la-pousette":  "luxury scroll back, smooth release",
  "screw-back":   "threads onto post — most secure",
  "push-fit":     "snap-on flat disc",
  "clip-on":      "no piercing — spring tension",
  "huggie-snap":  "hinged hoop snaps closed",
  "click-ring":   "hoop clicks shut at seam",
  "latch-back":   "hinged latch closure",
  continuous:     "seamless endless ring",
  "french-wire":  "thin hook, hangs freely",
  "lever-back":   "hinged lever snaps closed",
  omega:          "rigid omega-shaped back",
  "wire-hook":    "simple shepherd's hook",
};

// pair vs single
export const EARRING_QUANTITY_OPTIONS = ["pair", "single (left)", "single (right)", "set of 3", "set of 4"];

// ear placement helpers
export const EARRING_PLACEMENT_OPTIONS = [
  "lobe",
  "upper lobe",
  "helix",
  "anti-helix",
  "tragus",
  "anti-tragus",
  "conch",
  "daith",
  "rook",
  "industrial",
];

// ── Chain ─────────────────────────────────────────────────────────────────────
export const CHAIN_STYLES = ["cable","figaro","curb","rolo","box","snake","wheat","herringbone","singapore","ball"];
export const CHAIN_CLASPS = [
  "lobster","toggle","spring-ring","magnetic","box","hook-eye","s-hook","barrel",
];

// ── Keychain ──────────────────────────────────────────────────────────────────
export const KEYCHAIN_RINGS = ["split-ring","d-ring","carabiner","swivel","bolt-snap","lobster-clip"];

// ── Patterns ─────────────────────────────────────────────────────────────────
export const PATTERNS = ["none", "waves", "lattice", "dots", "chevron", "floral", "lines", "custom-svg"];

// ── Stone presets ─────────────────────────────────────────────────────────────
export const STONE_SETTINGS = ["none", "prong", "bezel", "channel", "flush", "pave", "tension", "illusion"];
export const STONE_SHAPES   = ["round", "oval", "square", "marquise", "trillion", "heart", "pear", "baguette"];
export const STONE_COLORS   = {
  diamond:  { label: "Diamond",   color: 0xddeeff, opacity: 0.75 },
  sapphire: { label: "Sapphire",  color: 0x2255cc, opacity: 0.85 },
  ruby:     { label: "Ruby",      color: 0xcc2233, opacity: 0.85 },
  emerald:  { label: "Emerald",   color: 0x22aa55, opacity: 0.85 },
  amethyst: { label: "Amethyst",  color: 0x9955cc, opacity: 0.85 },
  opal:     { label: "Opal",      color: 0xffeedd, opacity: 0.65 },
  topaz:    { label: "Topaz",     color: 0x88ccff, opacity: 0.80 },
  garnet:   { label: "Garnet",    color: 0x990022, opacity: 0.85 },
};

// ── Default state ─────────────────────────────────────────────────────────────
export const DEFAULT_JEWELRY = {
  type: "ring",

  // shared
  material: "silver",
  finish: "polished",
  pattern: "none",
  patternDepth: 0.3,
  patternScale: 1.0,
  svgUrl: null,
  engraving: "",
  segments: 64,

  // stone
  stone: {
    setting: "none",
    shape: "round",
    gem: "diamond",
    sizeMm: 4.0,
    count: 1,
    placementAngle: 0,
  },

  // ring
  ring: {
    innerRadius: 9.0,   // mm
    bandWidth: 6.0,     // mm
    thickness: 1.6,     // mm
    profile: "flat",
    openGap: 5,         // mm — gap for open/bypass profiles
    taperRatio: 0.4,    // front:back width ratio for tapered (0.2–1.0)
    twistTurns: 1,      // for twist profile
    waveCycles: 3,      // for wave profile
    waveAmplitude: 1.5, // mm
    signetWidth: 10,
    signetHeight: 12,
  },

  // pendant
  pendant: {
    shape: "teardrop",
    width: 18,
    height: 24,
    depth: 2.5,
    bail: "open-ring",
    bailWidth: 4,
    bailHeight: 6,
  },

  // bracelet
  bracelet: {
    style: "bangle",
    innerDiameter: 58,
    width: 8,
    thickness: 2.0,
    cuffOpening: 20,
    linkSize: 8,
    clasp: "lobster",
  },

  // earring
  earring: {
    category: "stud",
    shape: "circle",         // shape within the category
    size: 10,                // mm — stud diameter / drop width
    thickness: 1.5,          // mm — stud depth
    dropLength: 20,          // mm — for drop/threader
    hoopDiameter: 20,        // mm — for hoops
    hoopThickness: 1.5,      // mm — hoop wire/band thickness
    climbLength: 18,         // mm — for climbers/crawlers
    cuffWidth: 4,            // mm — for cuffs
    cuffOpening: 8,          // mm — gap to squeeze over cartilage
    mechanism: "butterfly",  // backing — only shown when valid for category
    quantity: "pair",
    placement: "lobe",
    postDiameter: 0.8,       // mm — stud post thickness
  },

  // piercing
  piercing: {
    style: "labret",
    postLength: 6,
    gauge: 1.2,
    endSize: 4,
    ringDiameter: 10,
    footWidth: 5,
    quantity: "single",
  },

  // chain
  chain: {
    style: "cable",
    length: 450,
    linkWidth: 3,
    gauge: 1.0,
    clasp: "lobster",
  },

  // keychain
  keychain: {
    shape: "rectangle",
    width: 35,
    height: 55,
    depth: 3,
    ringStyle: "split-ring",
    textLayout: "centered",
  },

  // surface decoration
  decoration: {
    method: "none",
    text: "",
    font: "serif",
    fontSize: 8,
    depth: 0.3,
    svgUrl: null,
    cadUrl: null,
    placement: "center",
    mirrorBack: false,
  },
};