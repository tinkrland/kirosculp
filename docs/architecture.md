---
title: architecture boundaries
summary: every file in sculptura and sculptura.dev, sorted into studio / platform / console / admin.
---

# architecture boundaries

this is the actual, current file-by-file map of both repos, read in full, sorted into the four systems. it is not aspirational — it says where things live *today*, so the boundary work is "move this," not "guess where this goes."

legend: **studio** = geometry/design. **platform** = commerce surface. **console** = money. **admin** = control tower. **shared** = genuinely cross-cutting (auth plumbing, ui primitives, layout chrome) and fine to stay shared.

---

## studio (creator-only, geometry and design)

### `sculptura` — the current studio implementation
```
src/App.jsx
src/components/canvas/CodePanel.jsx
src/components/canvas/JewelryControls.jsx
src/components/canvas/JewelryViewport.jsx
src/components/canvas/PrintPanel.jsx
src/components/canvas/RingControls.jsx
src/components/canvas/RingViewport.jsx
src/components/canvas/TemplatesPanel.jsx
src/components/studio/StudioNav.jsx
src/components/viewer/ModelViewer.jsx
src/lib/jewelryDefaults.js
src/lib/jewelryTemplates.js
src/lib/multiPieceJewelry.js
src/lib/sculpteoMaterials.js
src/lib/stlExport.js
src/lib/studioStore.js
src/lib/svgToShape.js
src/pages/CanvasDesigner.jsx
src/pages/studio/BuildPage.jsx
src/pages/studio/CodePage.jsx
src/pages/studio/MaterialsPage.jsx
src/pages/studio/PresetsPage.jsx
src/pages/studio/PrintPage.jsx
src/pages/studio/StylesPage.jsx
src/pages/studio/TemplatesPage.jsx
```
this is a real parametric ring/jewelry builder already — controls, viewport, code panel, stl export, templates. it predates paracraft-jewelry (per `AGENTS.md` in `sculptura.dev`, the plan is to port keeberia's paracraft engine and specialize it for jewelry, treating `jewelryTemplates.js` / `jewelryDefaults.js` / `multiPieceJewelry.js` as *seed vocabulary*, not the final schema). so: this code is the right starting reference, not the final engine. `sculpteoMaterials.js` is a studio file today because it's used to constrain what's designable, but the manufacturer relationship itself belongs in admin, not here — see the note in that file's section below.

### `sculptura.dev` — studio touchpoints living in the platform repo
```
AGENTS.md
src/components/viewer/ModelViewer.jsx
src/features/studiogram/StudiogramGuide.jsx
src/features/studiogram/studiogramContent.js
src/pages/ProductStudio.jsx
```
`AGENTS.md` is the actual engine contract (backend on xano, paracraft ported from keeberia, agent-assisted parameter selection, castability validator, deterministic scad → mesh pipeline). `ProductStudio.jsx` and the `studiogram` feature are the closest thing to a studio entry point that exists in the platform repo today, which is exactly the leak this document exists to name: **the studio's entry point should not live inside the platform's router.** once paracraft-jewelry exists as its own service, `/productstudio` should become a *link out* to the studio, not a page that renders studio UI inside the platform's own app shell.

**boundary rule:** studio code never imports platform commerce state (cart, checkout, orders) and never computes a sellable price. it emits a design and a castability report. nothing else.

---

## platform (listings, storefronts, discovery, checkout, commission intake)

this is the largest bucket in both repos, which is itself a finding: a lot of what's tagged "platform" today is actually console or admin work wearing a platform component's clothes (see the overrides below). the pages and components that are correctly platform:

### `sculptura`
```
src/components/artifacts/{ArtifactCard,ArtifactGrid,MaterialTag,OrderModal}.jsx
src/components/cart/CartDrawer.jsx
src/components/creator/CreatorSidebar.jsx
src/components/dashboard/{InsightCard,MyArtifacts}.jsx
src/components/explore/StoreGrid.jsx
src/components/home/*                                  (marketing/home surface)
src/components/layout/Header.jsx
src/components/market/MarketSidebar.jsx
src/components/market/mystore/{StoreAppearance,StoreContent,StorePreviewCard,StoreSocials,StoreWaitlist}.jsx
src/components/market/sections/{AnalyticsSection,ArtifactsSection,OrdersSection,OverviewSection,SettingsSection,StoreProfileSection}.jsx
src/components/market/settings/{SettingsCommissions,SettingsMaterials,SettingsProfile}.jsx
src/lib/{AuthContext,PageNotFound,cartStore,demoData}.js(x)
src/pages/{ArtifactDetail,Checkout,CreatorProfile,Dashboard,Explore,Home,Onboarding,PublishArtifact,ShopProfile}.jsx
src/pages/market/{AccessAccount,CreateAccount,MarketDashboard,MyStore,StoreSettings}.jsx
```

### `sculptura.dev`
```
src/App.jsx, src/main.tsx
src/components/artifacts/{ArtifactCard,ArtifactGrid,OrderModal}.jsx
src/components/cart/CartDrawer.jsx
src/components/commissions/{CommissionRequestForm,CommissionTermsEditor}.jsx     — see the muted-tab note below
src/components/creator/CreatorSidebar.jsx
src/components/dashboard/{InsightCard,MyArtifacts}.jsx
src/components/explore/StoreGrid.jsx
src/components/follow/{FollowButton,FollowsAndLists}.jsx
src/components/home/*
src/components/layout/{BuyerHeader,Header}.jsx
src/components/market/MarketSidebar.jsx
src/components/market/mystore/{StoreAppearance,StoreContent,StoreNewsletter,StorePreviewCard,StoreSocials,StoreUsername,StoreWaitlist}.jsx
src/components/market/sections/{AnalyticsSection,ArtifactsSection,CollectionsSection,CommissionRequestsSection,OrdersSection,OverviewSection,SettingsSection,StoreProfileSection}.jsx
src/components/market/settings/{SettingsCommissions,SettingsMaterials,SettingsProfile}.jsx
src/components/shop/{ShopCollections,ShopNewsletter}.jsx
src/lib/{AuthContext,CurrencyContext,PageNotFound,cartStore,db,demoData,demoSandbox,followStore,sizing,slug,wishlistStore}.js(x)
src/pages/{About,ArtifactDetail,Auth,BuyerDashboard,Checkout,CollectionPage,CommissionPage,Compare,CreatorDocs,CreatorProfile,Dashboard,DemoApp,DemoBuyer,Explore,FAQ,Home,Onboarding,PublishArtifact,SharedList,ShopArtifactBySlug,ShopProfile,Studiogram}.jsx
src/pages/market/{AccessAccount,CreateAccount,MarketDashboard,MyStore,StoreSettings}.jsx
supabase/functions/{place-order,publish-artifact,store-update}/index.ts
src/integrations/supabase/types.ts
```

`place-order` deserves a callout: it's a genuinely well-built boundary already. it snapshots price/manufacturing-cost/creator-earnings server-side from the trusted `artifacts` row rather than trusting client-submitted prices, and it supports guest checkout (jwt optional) alongside logged-in buyers. that's the platform doing its job correctly — checkout logic that also happens to *read* console-owned numbers (price, manufacturing cost, earnings) without computing them itself. keep that pattern; don't let checkout start doing pricing math inline.

**boundary rule:** platform code never derives a price, margin, or payout number from scratch — it reads whatever console already computed and stored on the artifact/order row. platform also never talks to a manufacturer api directly — that's admin's job via the routing layer.

---

## console (money: pricing, payouts, margins, wallet, coupons, currency)

these are tagged "platform" in the raw component tree today because they live under `src/components/market/...` alongside storefront customization, but they are money logic, not storefront logic, and should be pulled into their own boundary — likely their own `console/` folder and their own service layer, even before any ui reshuffle.

### `sculptura`
```
src/components/dashboard/WalletSection.jsx
src/components/market/mystore/{StoreCoupons,StoreTipJar}.jsx
src/components/market/sections/{FinanceSection,InsightsSection}.jsx
src/components/market/settings/{SettingsPayout,SettingsPricing}.jsx
src/lib/pricing.js
```

### `sculptura.dev`
```
src/components/dashboard/WalletSection.jsx
src/components/layout/CurrencySwitcher.jsx
src/components/market/mystore/{StoreCoupons,StoreTipJar}.jsx
src/components/market/sections/{FinanceSection,InsightsSection}.jsx
src/components/market/settings/{SettingsPayout,SettingsPricing}.jsx
src/components/shop/ShopPromoCodes.jsx
src/lib/{currency,pricing}.js
```

`SettingsPricing.jsx` is where the two-way pricing promise (fix earnings vs. fix retail price) needs to live as an actual reversible calculation, not two separate one-way forms. `SettingsPayout.jsx` currently offers `manual` and a `stripe_connect (planned)` option — see [`payouts.md`](payouts.md) for why that's the right call already.

**boundary rule:** console is the only system allowed to write `prices`, `manufacturing_costs`, `creator_earnings` on an artifact, or `payout_details` on a market account. platform and admin read those fields; they don't compute or edit them inline.

---

## admin (control tower)

### `sculptura`
```
src/pages/AdminReview.jsx
```

### `sculptura.dev`
```
src/components/admin/AdminLayout.jsx
src/pages/AdminReview.jsx
src/pages/admin/{AdminDocs,AdminIdea,AdminManufacturers,AdminOverview,AdminRouting,AdminSettings}.jsx
supabase/migrations/20260512235827_..._aeefe298.sql        (the migration that widened RLS to lean on the admin password — see security-fixes.md)
```

this is the cleanest boundary in the whole codebase already. `AdminOverview` pulls real counts, `AdminManufacturers` stores partner connections with credential *references* (not raw keys — the actual key lives as a server secret, correctly), `AdminRouting` explicitly documents that only stripe-sandbox routing is wired end to end today, and `AdminDocs` is unusually honest about its own single-shared-password gate being a pilot shortcut. the one thing to fix is exactly what it already says needs fixing: swap the password gate for the `user_roles` / `has_role('admin')` system that migration `20260429121931` already built. see [`security-fixes.md`](security-fixes.md).

**boundary rule:** admin operates the manufacturer connections and routing rules. it does not generate designs (studio's job) and it does not compute a creator's price or payout (console's job) — it sets the *policy* those systems run under (default manufacturer, routing mode, payout mode).

---

## shared (fine to stay shared)

auth plumbing (`AuthContext`, `ProtectedRoute`, `crypto.js` for the market-account hash scheme), generic ui primitives (`components/ui/*`, excluded from this map since there are ~40 of them and none carry domain logic), layout chrome (`AppLayout`, `Header`, `GrainOverlay`), and build config. these don't need boundary work — they're already correctly domain-agnostic.

---

## the leak this map is meant to stop

three things blur the boundary right now, concretely:

1. **console logic lives inside platform's `market/` folder.** `FinanceSection`, `SettingsPayout`, `SettingsPricing`, `WalletSection` sit next to `StoreAppearance` and `ArtifactsSection` with no folder-level or module-level separation. moving them into a `console/` namespace (even without changing behavior) makes the boundary enforceable in code review, not just in a doc.
2. **the studio's entry point (`ProductStudio.jsx` / studiogram) renders inside the platform app.** once paracraft-jewelry is its own service producing design releases, this should become a redirect/link, not an embedded page.
3. **commission intake exists in platform with no console/admin backing yet.** `CommissionRequestForm` inserts directly into `commission_requests` with no login requirement and no escrow — see the muted-tab shell for how to represent that honestly in the ui without building escrow yet.
