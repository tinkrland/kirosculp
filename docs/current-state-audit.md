# current source state and build plan

## audit scope

this audit read every non-generated file in the two supplied source repositories and every file already in this foundation:

| source | files read | role intended by the target architecture |
|---|---:|---|
| `sculptura` | 175 | creative studio |
| `sculptura.dev` | 224 | offering platform |
| `sculptura-foundation` before this reconciliation | 87 | contracts, architecture, research, and implementation plan |
| **total** | **486** | |

for every file, the audit recorded its path, hash, purpose, implemented behavior, persistence type, integrations, findings, and likely architectural domain. dependency directories, generated build output, and git internals were excluded. lockfiles were read and structurally inventoried. binary assets were hashed and classified.

among the two application repositories, 130 relative paths occur in both. 69 are byte-for-byte identical and 61 have diverged. this is not a clean studio/platform split yet. it is two overlapping product snapshots.

## build and test state

### `sculptura`

- the production build completes
- type checking fails inside the installed Three.js javascript because the current `jsconfig` checks dependency javascript without an appropriate boundary
- lint reports 12 unused imports across studio and copied platform files
- no automated tests are present

### `sculptura.dev`

- the production build completes
- the main generated javascript chunk is about 1.89 mb before gzip, and vite reports the expected large-chunk warning
- the configured test command fails because there are no test files
- lint reports 9 errors, mostly explicit `any` values in edge functions plus one `prefer-const` issue
- supabase is the real persistence layer, but several product surfaces still fall back to local storage or static demo data

passing a front-end build does not prove that checkout, commissions, admin authorization, routing, payment, fulfillment, or payouts are production-ready.

## what exists in `sculptura`

### real studio work worth retaining

- `src/pages/studio/BuildPage.jsx` contains the broad guided jewelry builder for rings, pendants, bracelets, earrings, piercings, chains, and keychains
- `src/components/canvas/JewelryViewport.jsx` contains the main Three.js viewport, procedural shapes, multi-piece handling, selection, repositioning, and a client-side clay deformation tool
- `src/components/canvas/RingViewport.jsx` and `RingControls.jsx` contain the earlier ring-specific path
- `src/lib/jewelryDefaults.js`, `jewelryTemplates.js`, and `multiPieceJewelry.js` define much of the present parameter vocabulary and procedural assembly behavior
- `src/lib/svgToShape.js` supports svg-derived pendant shapes
- `src/lib/stlExport.js` exports scene geometry to stl
- `src/components/canvas/CodePanel.jsx` creates downloadable openscad for the ring path
- `src/pages/studio/MaterialsPage.jsx`, `PrintPage.jsx`, `StylesPage.jsx`, `TemplatesPage.jsx`, `PresetsPage.jsx`, and `CodePage.jsx` form the current virtual-studio navigation
- `src/lib/studioStore.js` persists the active design in local storage

### studio limitations

- there is no tessa implementation
- the product contract identifies paracraft as a deterministic openscad compiler framework and webgl as the in-browser model renderer, but the audited snapshot has no explicit paracraft service or package boundary
- openscad generation is ring-focused rather than a canonical compiler for every supported project type
- the source contains a WebGL/Three.js viewport, but the audited code does not yet prove that every displayed model comes from the same openscad compile used for validation and production
- geometry state is an unversioned browser object, not a schema-validated project aggregate
- no immutable design release is created
- no trusted manufacturability service runs before publishing
- viewport geometry, sculpting, openscad output, and stl export do not yet prove equivalent production geometry
- `PrintPanel.jsx` sends exported stl toward sculpteo directly from the studio, crossing the intended boundary into manufacturing and ordering
- several file-upload affordances advertise formats that are not implemented as complete import pipelines

### platform code that must leave `sculptura`

`sculptura` also contains copied marketplace, checkout, storefront, creator-account, order, admin-review, pricing, wallet, and home-page code. examples include:

- `src/pages/Checkout.jsx`
- `src/pages/PublishArtifact.jsx`
- `src/pages/ArtifactDetail.jsx`
- `src/pages/ShopProfile.jsx`
- `src/pages/market/*`
- `src/components/market/*`
- `src/components/artifacts/*`
- `src/components/cart/CartDrawer.jsx`
- base44 entities for `Artifact`, `CreatorProfile`, `MarketAccount`, `Order`, and `User`

these are platform concerns. they should not remain active dependencies of the final studio.

## what exists in `sculptura.dev`

### marketplace and storefront surface

implemented ui and partial persistence exist for:

- public home, explore, artifact, creator, storefront, collection, and size-guide pages
- artifact cards and grids
- creator storefront appearance, content, social links, username, collections, newsletters, promotional codes, waitlists, tips, and profile settings
- creator dashboards for artifacts, orders, analytics, finance, insights, and settings
- buyer follows, lists, wishlists, shared lists, order history, and recommendations
- static information surfaces including about, compare, roadmap, creator docs, and studiogram content
- display-currency selection using static client-side conversion rates
- local demonstration sandboxes for creators and buyers

some of these are database-backed, some are local-storage-backed, and some are visual shells. each folder reference identifies the difference.

### commissions

current commission code includes:

- `src/components/market/settings/SettingsCommissions.jsx`
- `src/pages/CommissionPage.jsx`
- `src/components/commissions/CommissionRequestForm.jsx`
- `src/components/commissions/CommissionTermsEditor.jsx`
- `src/components/market/sections/CommissionRequestsSection.jsx`
- the `commission_requests` migration

this is not the required commission product. the live form currently supports anonymous submission, and the original policy permits anonymous insert and public read. there is no complete conversation, escrow, milestone, revision, acceptance, cancellation, fulfillment, or dispute lifecycle. commissions must remain muted until authenticated request intake and the whole lifecycle exist.

### checkout and orders

current code includes:

- a local-storage cart
- a multi-step checkout
- guest contact and shipping fields
- coupon lookup
- the `place-order` edge function
- order rows and a buyer order-history view

`place-order` improves on direct client inserts by re-reading published artifacts before snapshotting amounts. however, it does not charge a payment method. it inserts an order with status `placed`. its comments also claim user-scoped rls protection while guest insertion relies on a later permissive policy.

additional correctness gaps include:

- creator earnings are copied independently of coupon discounts, so the financial allocation can become inconsistent
- no trusted manufacturing quote is obtained at checkout
- no shipping, tax, insurance, currency, or route price is established
- no idempotency key prevents duplicate order creation
- no inventory or route reservation exists
- no payment authorization, capture, webhook, refund, chargeback, or settlement ledger exists

### publishing

`publish-artifact` verifies a creator access key and forces `pending_review`, which is better than trusting a direct browser insert. it still accepts client-provided `manufacturing_costs`, `creator_earnings`, and `prices`, and it does not require a design release. the platform currently publishes an artifact-shaped record rather than consuming a verified studio release.

### creator access

creator market accounts use a generated access key whose sha-256 hash is stored. the raw key is shown once, then the handle and key are retained in session storage while the creator dashboard is open.

this path needs to become normal authenticated creator identity with recovery, revocation, session management, role enforcement, and audit history. payout details must not be stored as ordinary editable account json.

### admin surface

existing pages cover overview, review, manufacturers, routing, settings, docs, and an idea notebook. these are useful interface references, but they are not a secure control plane.

`src/components/admin/AdminLayout.jsx` contains a universal plaintext password, `Password`, and records an unlocked flag in session storage. this is only a client-side visual gate. it provides no backend authorization.

some admin tables expect role-based rls, while the ui does not establish a real admin identity. `admin_ideas` is worse: its migration permits open read, insert, update, and delete.

### manufacturing and routing

- `manufacturers` and `platform_settings` tables exist
- admin pages can edit manufacturer metadata and select routing modes/defaults
- no production manufacturer adapter is connected
- no quote service is implemented
- no capability filtering engine is implemented
- no route-ranking or reservation engine is implemented
- no order submission, webhook, polling, cancellation, retry, or reconciliation flow is implemented

an admin routing form is configuration ui, not a routing system.

## database and security findings

supabase migrations create profiles, roles, artifacts, creator profiles, market accounts, orders, collections, commission requests, follows, lists, creator-doc notes, manufacturers, platform settings, and admin ideas.

critical repairs include:

1. replace the universal client-side admin password with authenticated admin users and server-enforced roles
2. remove open `admin_ideas` policies
3. require authentication and ownership for commission requests, with no public-read policy
4. remove or replace permissive `using (true)` and `with check (true)` policies on sensitive tables and storage paths
5. remove legacy open updates on `market_accounts`
6. prevent public exposure of access-key hashes, payout details, private creator configuration, buyer data, and commission content
7. move every privileged mutation behind a narrowly validated server operation
8. add rate limits, abuse controls, idempotency, audit events, and security tests
9. validate every migration as cumulative database state because a later policy can invalidate an earlier fix

`migrations/0001_admin_roles_and_market_account_privacy.sql` in this foundation is a remediation draft, not proof that the live source database has been repaired.

## target separation

### studio keeps

- creator project authoring
- tessa's constrained vision-to-parameter assistance
- project schemas and parameter validation
- paracraft compilation
- geometry generation
- preview rendering derived from the canonical build
- manufacturability checks
- immutable design-release creation

### platform keeps

- accounts and roles
- listings and storefronts
- collections, follows, lists, wishlists, and discoverability
- authenticated commission relationships
- carts and buyer checkout
- channel publishing

### operations owns

- authoritative pricing
- payment, settlement, refunds, payouts, and ledger entries
- destination and route availability
- shipping, insurance, returns, claims, tax, customs, and compliance state

### manufacturing owns

- material and process capability truth
- manufacturer onboarding and adapters
- quotes
- route eligibility and ranking
- production order submission and reconciliation
- quality evidence

### console and admin present or control those domains

neither surface becomes a second source of truth.

## ordered build plan

### 0. security containment

- deploy corrected cumulative rls
- remove the client admin password
- disable anonymous commission intake
- protect private market-account data
- lock privileged writes behind authenticated server functions

### 1. establish the studio contract

- version the canonical studio project schema
- define the tessa proposal schema and allowed parameter operations
- extract paracraft into the only geometry compiler
- make preview, openscad, mesh, mass calculation, and validation derive from the same build artifact
- issue signed or integrity-protected design releases

### 2. make platform publishing consume releases

- add design-release storage and lookup
- replace client-supplied manufacturing and validation claims
- separate release facts from listing merchandising fields
- migrate existing artifacts or mark them legacy and non-routable

### 3. build trusted quote and pricing services

- connect material and manufacturer capability records
- obtain or calculate route-specific production quotes
- implement the two-way pricing model on the server
- snapshot all financial inputs and outputs

### 4. make checkout a payment workflow

- add payment authorization and capture
- add idempotency and webhooks
- reserve the chosen release, quote, and route
- create append-only order and ledger events
- support guest checkout without weakening private order access

### 5. build manufacturing orchestration

- implement provider adapters
- validate route eligibility
- submit production orders only after the required payment state
- reconcile partner status, tracking, failures, retries, and cancellations

### 6. build commissions as a complete product

- require commissioner authentication
- add creator conversation, terms, milestones, escrow, revisions, acceptance, cancellation, payout, and disputes
- unmute commissions only when the lifecycle is enforceable

### 7. complete operational surfaces

- creator payouts and connected accounts
- buyer and creator support
- refunds, claims, insurance, returns, and delivery exceptions
- operator audit log and policy history
- reporting backed by real events rather than placeholder metrics

## source-reference convention

folder readmes in this foundation now use these labels:

- **exists** means working source code or a real schema is present
- **partial** means some behavior exists but important persistence, authorization, or lifecycle work is missing
- **shell** means a page or control exists without the system it represents
- **missing** means no implementation was found in either repository
- **move** means useful code exists in the wrong architectural domain
- **rewrite** means the current behavior conflicts with the target contract or security model

these labels describe the audited snapshots. they are not claims about a deployment outside the supplied repositories.
