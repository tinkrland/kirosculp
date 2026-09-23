# Current source state and build plan

## Audit scope

This audit read every non-generated file in the two supplied source repositories and every file already in this foundation:

| Source | files read | role intended by the target architecture |
|---|---:|---|
| `sculptura` | 175 | creative studio |
| `sculptura.dev` | 224 | offering platform |
| `sculptura-foundation` before this reconciliation | 87 | contracts, architecture, research, and implementation plan |
| **Total** | **486** | |

For every file, the audit recorded its path, hash, purpose, implemented behavior, persistence type, integrations, findings, and likely architectural domain. Dependency directories, generated build output, and git internals were excluded. Lockfiles were read and structurally inventoried. Binary assets were hashed and classified.

Among the two application repositories, 130 relative paths occur in both. 69 are byte-for-byte identical and 61 have diverged. This is not a clean studio/platform split yet. It is two overlapping product snapshots.

## Build and test state

### `sculptura`

- The production build completes
- Type checking fails inside the installed Three.js JavaScript because the current `jsconfig` checks dependency JavaScript without an appropriate boundary
- Lint reports 12 unused imports across studio and copied platform files
- No automated tests are present

### `sculptura.dev`

- The production build completes
- The main generated JavaScript chunk is about 1.89 MB before gzip, and Vite reports the expected large-chunk warning
- The configured test command fails because there are no test files
- Lint reports 9 errors, mostly explicit `any` values in edge functions plus one `prefer-const` issue
- Supabase is the real persistence layer, but several product surfaces still fall back to local storage or static demo data

Passing a front-end build does not prove that checkout, commissions, admin authorization, routing, payment, fulfillment, or payouts are production-ready.

## What exists in `sculptura`

### Real studio work worth retaining

- `src/pages/studio/BuildPage.jsx` contains the broad guided jewelry builder for rings, pendants, bracelets, earrings, piercings, chains, and keychains
- `src/components/canvas/JewelryViewport.jsx` contains the main Three.js viewport, procedural shapes, multi-piece handling, selection, repositioning, and a client-side clay deformation tool
- `src/components/canvas/RingViewport.jsx` and `RingControls.jsx` contain the earlier ring-specific path
- `src/lib/jewelryDefaults.js`, `jewelryTemplates.js`, and `multiPieceJewelry.js` define much of the present parameter vocabulary and procedural assembly behavior
- `src/lib/svgToShape.js` supports SVG-derived pendant shapes
- `src/lib/stlExport.js` exports scene geometry to STL
- `src/components/canvas/CodePanel.jsx` creates downloadable OpenSCAD for the ring path
- `src/pages/studio/MaterialsPage.jsx`, `PrintPage.jsx`, `StylesPage.jsx`, `TemplatesPage.jsx`, `PresetsPage.jsx`, and `CodePage.jsx` form the current virtual-studio navigation
- `src/lib/studioStore.js` persists the active design in local storage

### Studio limitations

- There is no Tessa implementation
- The product contract identifies ParaCraft as a deterministic OpenSCAD compiler framework and WebGL as the in-browser model renderer, but the audited snapshot has no explicit ParaCraft service or package boundary
- OpenSCAD generation is ring-focused rather than a canonical compiler for every supported project type
- The source contains a WebGL/Three.js viewport, but the audited code does not yet prove that every displayed model comes from the same OpenSCAD compile used for validation and production
- Geometry state is an unversioned browser object, not a schema-validated project aggregate
- No immutable design release is created
- No trusted manufacturability service runs before publishing
- Viewport geometry, sculpting, OpenSCAD output, and STL export do not yet prove equivalent production geometry
- `PrintPanel.jsx` sends exported STL toward Sculpteo directly from the studio, crossing the intended boundary into manufacturing and ordering
- Several file-upload affordances advertise formats that are not implemented as complete import pipelines

### Platform code that must leave `sculptura`

`sculptura` also contains copied marketplace, checkout, storefront, creator-account, order, admin-review, pricing, wallet, and home-page code. Examples include:

- `src/pages/Checkout.jsx`
- `src/pages/PublishArtifact.jsx`
- `src/pages/ArtifactDetail.jsx`
- `src/pages/ShopProfile.jsx`
- `src/pages/market/*`
- `src/components/market/*`
- `src/components/artifacts/*`
- `src/components/cart/CartDrawer.jsx`
- Base44 entities for `Artifact`, `CreatorProfile`, `MarketAccount`, `Order`, and `User`

These are platform concerns. They should not remain active dependencies of the final studio.

## What exists in `sculptura.dev`

### Marketplace and storefront surface

Implemented UI and partial persistence exist for:

- Public home, explore, artifact, creator, storefront, collection, and size-guide pages
- Artifact cards and grids
- Creator storefront appearance, content, social links, username, collections, newsletters, promotional codes, waitlists, tips, and profile settings
- Creator dashboards for artifacts, orders, analytics, finance, insights, and settings
- Buyer follows, lists, wishlists, shared lists, order history, and recommendations
- Static information surfaces including about, compare, roadmap, creator docs, and Studiogram content
- Display-currency selection using static client-side conversion rates
- Local demonstration sandboxes for creators and buyers

Some of these are database-backed, some are local-storage-backed, and some are visual shells. Each folder reference identifies the difference.

### Commissions

Current commission code includes:

- `src/components/market/settings/SettingsCommissions.jsx`
- `src/pages/CommissionPage.jsx`
- `src/components/commissions/CommissionRequestForm.jsx`
- `src/components/commissions/CommissionTermsEditor.jsx`
- `src/components/market/sections/CommissionRequestsSection.jsx`
- The `commission_requests` migration

This is not the required commission product. The live form currently supports anonymous submission, and the original policy permits anonymous insert and public read. There is no complete conversation, escrow, milestone, revision, acceptance, cancellation, fulfillment, or dispute lifecycle. Commissions must remain muted until authenticated request intake and the whole lifecycle exist.

### Checkout and orders

Current code includes:

- A local-storage cart
- A multi-step checkout
- Guest contact and shipping fields
- Coupon lookup
- The `place-order` edge function
- Order rows and a buyer order-history view

`place-order` improves on direct client inserts by re-reading published artifacts before snapshotting amounts. However, it does not charge a payment method. It inserts an order with status `placed`. Its comments also claim user-scoped RLS protection while guest insertion relies on a later permissive policy.

Additional correctness gaps include:

- Creator earnings are copied independently of coupon discounts, so the financial allocation can become inconsistent
- No trusted manufacturing quote is obtained at checkout
- No shipping, tax, insurance, currency, or route price is established
- No idempotency key prevents duplicate order creation
- No inventory or route reservation exists
- No payment authorization, capture, webhook, refund, chargeback, or settlement ledger exists

### Publishing

`publish-artifact` verifies a creator access key and forces `pending_review`, which is better than trusting a direct browser insert. It still accepts client-provided `manufacturing_costs`, `creator_earnings`, and `prices`, and it does not require a design release. The platform currently publishes an artifact-shaped record rather than consuming a verified studio release.

### Creator access

Creator market accounts use a generated access key whose SHA-256 hash is stored. The raw key is shown once, then the handle and key are retained in session storage while the creator dashboard is open.

This path needs to become normal authenticated creator identity with recovery, revocation, session management, role enforcement, and audit history. Payout details must not be stored as ordinary editable account JSON.

### Admin surface

Existing pages cover overview, review, manufacturers, routing, settings, docs, and an idea notebook. These are useful interface references, but they are not a secure control plane.

`src/components/admin/AdminLayout.jsx` contains a universal plaintext password, `Password`, and records an unlocked flag in session storage. This is only a client-side visual gate. It provides no backend authorization.

Some admin tables expect role-based RLS, while the UI does not establish a real admin identity. `admin_ideas` is worse: its migration permits open read, insert, update, and delete.

### Manufacturing and routing

- `manufacturers` and `platform_settings` tables exist
- Admin pages can edit manufacturer metadata and select routing modes/defaults
- No production manufacturer adapter is connected
- No quote service is implemented
- No capability filtering engine is implemented
- No route-ranking or reservation engine is implemented
- No order submission, webhook, polling, cancellation, retry, or reconciliation flow is implemented

An admin routing form is configuration UI, not a routing system.

## Database and security findings

Supabase migrations create profiles, roles, artifacts, creator profiles, market accounts, orders, collections, commission requests, follows, lists, creator-doc notes, manufacturers, platform settings, and admin ideas.

Critical repairs include:

1. Replace the universal client-side admin password with authenticated admin users and server-enforced roles
2. Remove open `admin_ideas` policies
3. Require authentication and ownership for commission requests, with no public-read policy
4. Remove or replace permissive `using (true)` and `with check (true)` policies on sensitive tables and storage paths
5. Remove legacy open updates on `market_accounts`
6. Prevent public exposure of access-key hashes, payout details, private creator configuration, buyer data, and commission content
7. Move every privileged mutation behind a narrowly validated server operation
8. Add rate limits, abuse controls, idempotency, audit events, and security tests
9. Validate every migration as cumulative database state because a later policy can invalidate an earlier fix

`migrations/0001_admin_roles_and_market_account_privacy.sql` in this foundation is a remediation draft, not proof that the live source database has been repaired.

## Target separation

### Studio keeps

- Creator project authoring
- Tessa's constrained vision-to-parameter assistance
- Project schemas and parameter validation
- ParaCraft compilation
- Geometry generation
- Preview rendering derived from the canonical build
- Manufacturability checks
- Immutable design-release creation

### Platform keeps

- Accounts and roles
- Listings and storefronts
- Collections, follows, lists, wishlists, and discoverability
- Authenticated commission relationships
- Carts and buyer checkout
- Channel publishing

### Operations owns

- Authoritative pricing
- Payment, settlement, refunds, payouts, and ledger entries
- Destination and route availability
- Shipping, insurance, returns, claims, tax, customs, and compliance state

### Manufacturing owns

- Material and process capability truth
- Manufacturer onboarding and adapters
- Quotes
- Route eligibility and ranking
- Production order submission and reconciliation
- Quality evidence

### Console and admin present or control those domains

Neither surface becomes a second source of truth.

## Ordered build plan

### 0. Security containment

- Deploy corrected cumulative RLS
- Remove the client admin password
- Disable anonymous commission intake
- Protect private market-account data
- Lock privileged writes behind authenticated server functions

### 1. Establish the studio contract

- Version the canonical studio project schema
- Define the Tessa proposal schema and allowed parameter operations
- Extract ParaCraft into the only geometry compiler
- Make preview, OpenSCAD, mesh, mass calculation, and validation derive from the same build artifact
- Issue signed or integrity-protected design releases

### 2. Make platform publishing consume releases

- Add design-release storage and lookup
- Replace client-supplied manufacturing and validation claims
- Separate release facts from listing merchandising fields
- Migrate existing artifacts or mark them legacy and non-routable

### 3. Build trusted quote and pricing services

- Connect material and manufacturer capability records
- Obtain or calculate route-specific production quotes
- Implement the two-way pricing model on the server
- Snapshot all financial inputs and outputs

### 4. Make checkout a payment workflow

- Add payment authorization and capture
- Add idempotency and webhooks
- Reserve the chosen release, quote, and route
- Create append-only order and ledger events
- Support guest checkout without weakening private order access

### 5. Build manufacturing orchestration

- Implement provider adapters
- Validate route eligibility
- Submit production orders only after the required payment state
- Reconcile partner status, tracking, failures, retries, and cancellations

### 6. Build commissions as a complete product

- Require commissioner authentication
- Add creator conversation, terms, milestones, escrow, revisions, acceptance, cancellation, payout, and disputes
- Unmute commissions only when the lifecycle is enforceable

### 7. Complete operational surfaces

- Creator payouts and connected accounts
- Buyer and creator support
- Refunds, claims, insurance, returns, and delivery exceptions
- Operator audit log and policy history
- Reporting backed by real events rather than placeholder metrics

## Source-reference convention

Folder READMEs in this foundation now use these labels:

- **Exists** means working source code or a real schema is present
- **Partial** means some behavior exists but important persistence, authorization, or lifecycle work is missing
- **Shell** means a page or control exists without the system it represents
- **Missing** means no implementation was found in either repository
- **Move** means useful code exists in the wrong architectural domain
- **Rewrite** means the current behavior conflicts with the target contract or security model

These labels describe the audited snapshots. They are not claims about a deployment outside the supplied repositories.
