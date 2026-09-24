# features

a list of everything sculptura currently does.

---

## artifact publishing

creators upload a 3d design file (.glb or .stl) and a render image, set a name, description, category, and specs. they choose a material (silver, brass, gold) and a primary customer region. they set their own earnings per piece, and the platform calculates the final customer price automatically.

artifacts flow through a lifecycle: draft, pending_review, published, rejected, archived.

---

## 3d model viewer

artifact detail pages render interactive three.js viewers for .glb files. the model auto-rotates, responds to drag-to-rotate input, and falls back to a static image if no model file is present.

---

## parametric jewelry design studio

a multi-page studio at /build, /templates, /styles, /presets, /materials, /print, and /code. all studio state is stored in localstorage and persisted across tabs.

the /build page is a 6-step wizard:

1. type - choose jewelry category (ring, pendant, bracelet, earring, chain, keychain)
2. design - shape, profile, dimensions, clasps, mechanisms, and bail options specific to each type
3. surface - decoration method (engrave, emboss, svg upload, cad upload), repeating patterns
4. stone - setting type, gem selection, size, and count
5. material - metal choice and surface finish
6. synopsis - full design review with links to export or print

the 3d viewport on the right updates in real time as the user makes changes. a collapsible toolbar on the left of the viewport provides orbit, select, and zoom controls.

---

## openscad export

the /code page generates openscad parametric code from the active studio design. the code can be copied or downloaded as a .scad file for use in any cad tool.

---

## sculpteo print flow

the /print page exports the active design as an stl and provides a web2web redirect to sculpteo's shopping cart. no api credentials are required - it uses a browser post redirect.

---

## explore page

a browsable catalog of published artifacts, filterable by category and material, with a free-text search across artifact names and creator handles. also includes a stores tab for browsing market accounts.

---

## creator profiles

each creator has a public storefront at `/shop/:username` showing their bio, commission status, hourly rate, turnaround time, materials, and software. their published artifacts are listed below.

---

## market accounts

an alternative account system that does not require login. a creator fills in their handle, email, and profile details. a unique key is generated and shown once. they save it. from then on, they use the key to access their dashboard.

accounts start in draft state. the creator submits for review when ready. a manual review moves it to active or rejected.

---

## account dashboard

a sidebar-based workspace for market account holders with sections for:

- overview - quick stats on artifacts, orders, and earnings; submit-for-review button
- artifacts - list of published and draft artifacts with archive/publish toggle
- orders - order tracking with progress bar and tracking number display
- analytics - placeholder for engagement data
- finance - earnings breakdown, balance summary
- insights - private business data (time spent, tool costs, calculated hourly earnings)
- settings - profile, commissions, materials, pricing margins, and payout method

---

## store settings

- profile - display name, bio, contact email, avatar
- commissions - open/closed toggle, hourly rate, turnaround time, rush availability
- materials and tools - tag-based input for materials worked and cad software used
- pricing margins - markup percentage with a live example breakdown
- payout - method selection (bank transfer, paypal, wise, crypto) and account details

---

## admin review panel

a separate admin interface at /admin for reviewing pending artifact submissions, managing all artifacts, and updating order statuses and tracking numbers.

---

## pricing engine

all prices are calculated from a base manufacturing cost (defined per material and region in `lib/pricing.js`) plus the creator's chosen earnings. the customer always sees the full final price. manufacturing costs and creator earnings are not shown to buyers.

---

## cart and checkout

a localstorage-backed cart stores selected artifacts and materials. a drawer shows the current queue. a checkout flow collects shipping details and submits an order record.