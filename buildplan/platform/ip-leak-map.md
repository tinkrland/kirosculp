# ip leak map: every way someone could run away with our stuff

the licensing model ([ip-licensing.md](ip-licensing.md)) says what
people *may* do. this page says what they *could* do regardless, so
protections can be placed where the leaks actually are. researched
2026-09-29; treat as a threat model, not legal advice (counsel review
standing requirement unchanged).

## the honest headline

two leak classes dominate everything else:

1. **once a design is publicly visible, it is re-creatable.** anyone
   with eyes on a listing can model a lookalike by hand or with any
   3d tool. no license, watermark, or contract prevents imitation of
   what is displayed in public. this is the jewelry industry's oldest
   problem (knockoffs existed before cad), and our answer is the same
   as every house brand's: speed, price, chain of title, brand, and
   takedown rights. not secrecy.
2. **the manufacturing chain holds the real files.** casting partners
   receive castable geometry for every order. a partner (or their
   employee) can cast extras or leak the file. this is a *partner
   governance* problem, not a license problem, and it is where
   contractual teeth matter most.

everything below is smaller than these two.

## the vectors, ranked

### v1: exported stl → third-party manufacturing (the named one)

- **what leaks:** the free-tier stl export, taken to sculpteo or a
  local caster for commercial production.
- **covered by:** the personal-use license terms; release-id metadata
  in the file; violation = license breach plus, for template-based
  designs, a genuine ip claim in the platform-owned components.
- **residual risk:** detection is weak; the metadata survives only if
  the file is passed as-is (any re-mesh strips it). the mitigation is
  incentive design: the full commercial grant is the easy path to
  provable ownership, and honest commercialization of a
  personal-licensed design is impossible (no chain of title).

### v2: client-side preview → mesh extraction

- **what leaks:** the webgl preview streams the mesh to the browser to
  render it. a determined user can dump it from browser memory or
  intercept the transfer.
- **reality check:** this cannot be fully prevented (the alternative,
  rendered video streams, destroys the interactive configurator that is
  the product). lower mesh resolution for previews, rate-limit, and
  accept the residual: the dumped preview mesh is still low-res and
  marked; manufacturing-grade geometry never touches the client, only
  the server-validated release does.
- **note:** preview mesh of a *house template* is platform geometry;
  extraction is an ip claim we can make (v1's stronger cousin).

### v3: partner-side leakage (the big one)

- **what leaks:** every production order sends castable geometry to a
  casting partner.
- **protections:** partner agreements with quantity-attestation,
  per-order unique geometry watermarks (micro-variation in
  non-functional geometry, different per order so an extra casting is
  traceable to a leaked order file), file-retention and destruction
  terms, and audit rights. per-order uniqueness also catches the
  gray-market seller: a piece sold outside our ledger is provably a
  copy of order n's file.
- **this is also the answer to "the creator's stl leaked and someone
  casts it":** a stray casting shows up carrying order n's watermark,
  and the trail leads somewhere.

### v4: listing cloning (renders + copy scraped to another marketplace)

- **what leaks:** listing images, renders, and descriptions are public
  by definition.
- **protections:** the native channel integrations (shopify, etsy,
  amazon) give us *programmatic* takedown paths (ip reports via their
  apis) rather than manual dmca forms; platform-watermarked renders
  prove origin. a lookalike re-modeled from photos is style imitation:
  not ours to prevent, only to outcompete.

### v5: parameter family reconstruction (reverse engineering a template)

- **what leaks:** a creator with studio access can explore a house
  template's parameter envelope and reproduce a near-identical design
  by writing their own openscad.
- **protections:** terms (derivative-of-template clauses), the
  release pipeline (their near-clone still validates through paracraft
  and gets compared against house templates in similarity space at
  release time, flagging knockoffs before they can list), and the
  discovery layer refusing listings flagged as template derivatives.
- **residual:** similarity detection is a later leg (falkordb/postgres
  search spike); until then this is terms-only.

### v6: tessa and engine internals

- **what leaks:** nothing by design: prompts, rule sets, and geometry
  code are server-side; the client sees parameters and preview meshes.
- **residual risk:** insider threat and code theft are ordinary
  security concerns for the security leg, not channel-specific ones.

### v7: commission pieces and buyouts

- **what leaks:** nothing improper: a buyer with a personal-use
  delivery holds the piece; a buyout grant is a clean transfer. the
  creator's own post-buyout behavior is their right.
- **watch item:** a commissioner could commission a design, receive
  it, then reverse-engineer the physical piece into cad. this is v1/v4
  in miniature: watermarking and terms cover what they cover, and
  physical reverse engineering is, again, the industry's oldest
  unsolved problem.

## what we deliberately do not do

- no client-side drm on previews: it does not work and it poisons the
  product.
- no watermarking that alters functional or fit geometry: paracraft
  validation governs what may change; watermarks live in
  non-functional zones or stay out entirely for delicate pieces.
- no enforcement theater: we do not build scanning infrastructure we
  cannot act on. takedown paths that exist (native channels) get used;
  hypothetical ones get documented, not built.

## open items

- per-order watermark scheme needs a paracraft leg design note
  (where micro-variation is safe, per family) before it is more than a
  sentence.
- similarity detection rides the search-store spike
  ([search-store-alternatives.md](discovery/search-store-alternatives.md));
  reuse it, do not build a second one.
- partner agreement templates are operations/legal work
  ([the legal directory](../../operations/legal/)), fed by this map.
