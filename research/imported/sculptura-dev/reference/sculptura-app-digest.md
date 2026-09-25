# sculptura app digest: deep read of origin/main (the lovable source)

research: 2026-09-11 · source: kqrla/sculptura.dev origin/main: src/lib/{sizing,pricing,db,demodata}.js, src/pages/{about,faq,roadmap,compare,creatordocs,sizeguide,publishartifact,productstudio,admin/*}.jsx, src/components/{home,market}/* · status: cited (repo-internal, verbatim)

## thesis

the repo is the complete source of truth for the product. the lovable app (220 files) already implements the creator marketplace end to end in demo mode: store accounts, publishing, admin review, orders, checkout sandbox: and its source states precisely which parts are real, mock, or coming. the parametric jewelry engine lands in the gaps the app itself names: tolerances the sizeguide defers, the ring-size→millimeters table sizing.js lacks, the manufacturer routing phase 5 promises, and the 3d preview/AR try-on the roadmap leaves unchecked. read against the engine work, the app defines the *product contract*; the engine supplies the *physics contract*; neither may invent the other's half.

## the domain model (verbatim)

**materials: internally inconsistent today:**
- marketing + process story: `"solid silver, brass, bronze, or gold"` (src/pages/About.jsx), `"silver, brass, bronze, gold"` (src/pages/admin/AdminIdea.jsx), `"order made-to-order in silver, brass or gold"` (app homepage copy 2026-09-11)
- pricing model: `MATERIALS = ["silver", "brass", "gold"]`: **bronze is missing from pricing.js despite being promised** (src/lib/pricing.js)
- the engine's material table must resolve this discrepancy; manufacturer-capabilities.json already models bronze-capable bureaus

**pricing: explicitly mock:**
- `MANUFACTURING_COSTS` per material × region (europe / north_america / asia / global) is labeled `"mock values"` in source (src/lib/pricing.js). final price = manufacturing cost + creator earnings; `"sculptura does not take a commission cut on top of that"` (src/pages/FAQ.jsx)
- real manufacturing costs must arrive through the manufacturer adapters, never through these placeholders

**sizing: the seed file has a hole:**
- `RING_SIZES` = us 4–13 in half-step increments, but there is **no us size → inner diameter mapping anywhere in the app** (src/lib/sizing.js). the design agent smoke test (2026-09-11) had glm-4-7-flash supply `"US 7 ≈ 17.3mm"` from its own memory: an uncited number that must be replaced by a cited standards table (sizing-tables.json) before candidates validate. `defaultSizesFor("ring")` = ["6", "7", "8"]
- creatordocs promises: `"size systems we support today (rings, bracelets, free-size pieces)"` (src/pages/CreatorDocs.jsx)

**fulfillment claims:**
- `"most pieces take 2 to 4 weeks from order to delivery"` (src/pages/FAQ.jsx); regional estimates 8–20 business days by region (src/lib/pricing.js delivery_estimates)
- `"because pieces are made to order, cancellations are only possible within 24 hours"` (src/pages/FAQ.jsx)

## the backend split (important for integration)

- the lovable app runs on **supabase**: manufacturers table, platform_settings, auth, orders all via `supabase.from(table)` (src/lib/db.js documents the swap-out seam: `"swap this file out and you can point [the backend elsewhere]"`)
- the engine side is specced for **xano** (design agent endpoint, worker queue, see backend/xano/). two backends are in play: the existing marketplace on supabase, the engine on xano. the manufacturer adapter shape must match the supabase `manufacturers` table fields (below) or the digest's field map must reconcile them

**supabase manufacturers table (src/pages/admin/AdminManufacturers.jsx):**
name, slug, region (`"eu, us, global"`), capabilities (array), supported_materials (array, e.g. `"silver, brass, bronze"`), status (active/inactive), contact_email, api_endpoint, credential_ref (`"backend secrets; only the reference name lives here"`), notes, is_default. manufacturer-capabilities.json should reconcile against exactly this field set.

**order routing modes (src/pages/admin/AdminRouting.jsx):**
- `stripe_demo`: `"safe for the pilot. nothing routes to manufacturers."`
- `stripe_live_auto`: `"real charges. paid orders push to the default manufacturer api."`
- payout options include manual. the routing engine is a platform_settings row; `"functional once a manufacturer integration is live"`

## where the engine work lands in the roadmap (src/pages/Roadmap.jsx)

phase 5, all unchecked: **`"regional manufacturing routing"`** (the adapter + routing engine), **`"3d preview and AR try-on"`** (the preview engine + virtual studio), multi-material per artifact, international shipping calculator. phase 1–2 (store accounts, publishing, review, orders, checkout sandbox) are done. about timeline: "now`" = demo mode end to end; "`next" = `"live manufacturing partners wired up to the routing engine. real payouts. real shipping. real metal in real mailboxes."` (src/pages/About.jsx timeline)

## the promises the engine must make true (CreatorDocs.jsx, `"designing, templates, and stone setting"`)

- `"minimum wall thickness, undercut limits, and tolerances supported by our pilot manufacturer"`
- `"what the lost-wax pipeline can and cannot reproduce in fine detail"`
- `"patterns that print and cast cleanly, patterns that fight you"`
- `"bezels, prongs, and channels that support post-cast stone setting"`
- `"starter cad files for rings, pendants, brooches, and earrings"`
- `"finishing notes: polished, brushed, oxidised, and what each one costs in time"`

every one of these is a research artifact this project already has scaffolding for (casting notes, primitives notes, casting-tolerances.json). the app is writing checks the engine's cited research must cash.

## other load-bearing facts

- auth is key-based, not passwords: `"you receive a one-time access key… the only way to log into your dashboard"` (src/pages/FAQ.jsx): engine-side design records must not assume email identity
- productstudio (/productstudio) is an explainer for the virtual studio: `"this is image generation. it is not"`: hand models with adjustable parameters (skin tone, proportions, finger length/thickness) (src/pages/ProductStudio.jsx). the studio renders real geometry, never generative images: same no-inference principle as the engine
- process claims and their sources: see ../jewelry/casting/sculptura-process-claims.md
- manufacturer hunt and negatives: see manufacturer-capabilities.json (+9 entries) and ../jewelry/manufacturing/*.md
