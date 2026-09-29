---
inclusion: always
---

# sculptura product context

sculptura is a jewelry platform with three separated artifacts:

1. **the studio** (paracraft + tessa): the creative engine. paracraft is
   a deterministic geometry compiler built on openscad; tessa is a
   vision-model middle layer that proposes typed parameter values and
   never generates geometry. the studio owns geometry generation and
   physical validation (wall thickness, clearance, shrinkage).
2. **the platform**: sales, listings, commissions, discovery, payouts.
   typescript/node, supabase-first. supabase is the authoritative
   ledger. spree commerce exists only as a local prototype sandbox for
   checkout mechanics, never the production stack.
3. **the design release**: the versioned, immutable interface between
   them. a release is created only by the server-side release gate
   after headless openscad validation; the platform consumes releases
   and never touches geometry.

key product rules:
- metal-only jewelry. no stones supplied.
- buyers do not need an account to buy; commission requests require login.
- only creator accounts use the design agent. buyers submit briefs to creators.
- two-way pricing: creator fixes net earnings or retail price; the server
  computes the other side. the client never computes money.
- creator discovery is earned (published listings), never granted at signup.
- the house line is a launch catalog of templated basics published through
  the identical creator pipeline under a house account; no discovery privileges.
