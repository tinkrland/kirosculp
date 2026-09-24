# roadmap

what comes next for sculptura, in rough priority order.

---

## short term

- complete the market account dashboard (analytics section is currently a placeholder)
- artifact editing so creators can update pricing, description, and files after publishing
- order request flow: allow buyers to submit a request through the artifact page, which creates a record the creator can respond to
- email notifications when an account passes or fails review
- key recovery flow via email verification for market accounts
- improve the studio export flow: preview stl before sending to print

---

## mid term

- real order tracking with status updates from the manufacturing partner
- multiple material options per artifact (currently limited to one material per publish)
- commission request flow: a structured form buyers fill out to request custom work
- analytics dashboard with real view and engagement data
- payout processing integration (stripe connect or similar)
- three.js geometry for chain and keychain types in the design studio
- supabase migration option for teams that need self-hosted infrastructure

---

## long term

- manufacturing partner api integration for live cost and lead time data
- bulk artifact import for creators migrating from other platforms
- collection or series groupings for artifacts
- buyer accounts with order history and saved items
- mobile-optimized storefront view
- subdomain routing (username.sculptura.shop) when dns infrastructure is in place
- offline-capable studio with local file export, no backend required