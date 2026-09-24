# features

## browsing

- home page with featured artifacts and editorial sections
- explore page lists every published artifact and active store, with demo data shown when the database is empty
- artifact detail page renders a 3d model viewer (three.js) and material picker
- store profile page shows a creator's published catalog and store branding

## cart and checkout

- in-memory cart persisted to localstorage so reloads don't drop selections
- checkout collects customer info, shipping address, and notes
- orders are placed by calling the place-order edge function which snapshots prices server-side from the artifact record (the cart payload's price is never trusted)
- saved address option for repeat buyers

## creator stores

- store creation flow generates a one-time access key (sha256 hash stored, raw key shown once)
- access page verifies the key client-side against the stored hash
- store dashboard with overview, artifacts, orders, analytics, finance, insights sections
- mystore section for editing branding, content, socials, coupons, tip jar, waitlist
- store settings cover profile, materials, tools, commissions, pricing, payout method
- store status lifecycle: draft -> pending_review -> active or rejected

## publishing artifacts

- creators upload images and 3d model files (.glb / .stl) to a public storage bucket
- artifacts are submitted with status pending_review
- admin review page lists pending artifacts and lets an admin publish or reject with notes
- admin can also update order statuses and add tracking numbers

## authentication

- supabase auth with email + password
- google sign-in
- demo mode: spins up a throwaway account so you can poke around without committing to a real signup
- separate access-key auth for store dashboards (creators don't need a supabase account to run their store)
