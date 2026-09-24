# creator ip

research folder for creator intellectual property rights: who owns what across the design, release, listing, and order lifecycle. this is product-shaping research, not legal conclusions; every answer here eventually needs counsel review before it becomes platform terms.

## why this is hard for sculptura specifically

sculptura is not a simple upload-and-sell marketplace. a creator does not upload a finished model: they shape typed parameters, often with tessa proposing values, over platform-authored bases and controls, and paracraft compiles the geometry. ownership questions sit on top of that stack, and each layer has a different likely owner: the base templates, the parameter values, the compiled mesh, the listing copy, the photographs.

## the ownership stack to resolve

- **the base design:** platform-authored ring, earring, and pendant bases (including the affinity, promise, double-heart, and claddagh directions). a base itself is old, widely used cultural vocabulary, but sculptura's implementation of it is platform work.
- **the parameter state:** the creator's chosen dimensions, profiles, repetitions, and relationships. this is the strongest candidate for "the creator's design".
- **tessa's proposals:** ai-proposed parameter values the creator accepts, rejects, or adjusts. what does acceptance mean for authorship claims?
- **the compiled mesh:** deterministic output of paracraft from the parameter state. same parameters, same mesh, for anyone. if the platform re-renders it, is that a copy of the creator's work?
- **the design release:** the versioned, hashed, immutable record. beyond its engineering role, it is a timestamped authorship record: who authored which parameter state, when, on top of which base version. this could be sculptura's best ip evidence artifact and should be designed with that second role in mind.
- **listing and capture assets:** listing copy is the creator's; studiogram renders are machine photographs of the creator's released mesh. who holds rights to the images, and what license does the platform need to display, cache, and promote them?

## open questions to research

### authorship and copyright

- does a parameter-state design qualify for copyright protection in each first-cohort country, or is it more like a useful article with thin protection?
- how much creative choice is required given that creators pick from bounded controls? the more bounded the knobs, the weaker the authorship story, and sculptura's controls are deliberately bounded.
- where is the line on platform-authored bases with small creator modifications, and does a minimum-modification threshold matter for what creators may claim as theirs?
- how do us copyright office positions on ai-assisted work map onto tessa: the creator provides intent and references, accepts or rejects proposals, and owns the decisions. what documentation makes the human-authorship case strongest?

### commissions

- when a buyer submits references and a brief, and a creator develops the design: who owns the resulting parameter state and release? common practice says the buyer commissions a one-off, but the creator's tooling and labor created the design.
- does a commission transfer the design itself, or only the manufactured piece? sculptura's decision on this shapes the commission terms template.
- can creators offer "exclusive design" commissions where the design is never re-listed, and how would the platform enforce non-relisting?

### licenses and channel sales

- what license does the platform need from creators to host listings, route manufacturing, and fulfill orders, including white-label storefronts and native channel integrations (shopify, etsy, tiktok shop, and the rest)?
- when a design sells through a creator's connected storefront, does the creator license the design to that channel, to the buyer, or both?
- what license do buyers receive? a buyer owns the metal piece; do they receive any rights to the design, or none? reselling the physical piece must stay clearly allowed.

### protection and enforcement

- design patents, copyright, and trade dress: which mix actually protects jewelry in practice, per jurisdiction, and what is worth the cost at indie prices?
- how do we handle a creator claiming another creator's design (two creators converging on similar parameter states independently)? parameter similarity is not proof of copying when the control space is bounded.
- dmca-style takedown and counter-notice flow for listings: what process obligation exists for the marketplace and the white-label storefronts?
- what protection, if any, applies to the exported mesh before manufacturing? once a design is displayed as a 3d preview, screen-capture and reconstruction are possible. is the commercial moat manufacturing access rather than mesh secrecy, and should terms reflect that honestly?

### platform-side claims

- does making paracraft open source later weaken any platform claim on designs made with it? intended answer: no, the engine's license and the designs' ownership are separate, but this needs to be written down properly in the paracraft license work.
- moral rights: eu jurisdictions recognize creator attribution and integrity rights that us law mostly does not. what attribution does a creator keep when their piece is displayed on buyer profiles, in marketing, or in marketplace discovery?

## status

open research. nothing here is decided, drafted, or counsel-reviewed. the immediate use is to shape two artifacts so they do not have to be redesigned later: the [design release contract](../../../contracts/design-release.md) (authorship and provenance fields) and the platform terms (licenses, commission ownership, takedown flow).
