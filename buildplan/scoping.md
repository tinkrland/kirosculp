# the full scope-out: what we build, and what we refuse to conjoin

the overall build scoping for sculptura, recorded before the heavy engineering starts. this document sits above the [relay legs](README.md): it decides what artifacts exist, what each one owns, and in what order the engineering capacity gets spent.

## the first fault, named

the lovable build conjoined two things that must never share a codebase: the public website (explanatory content, marketing voice, the studiogram guide) and the platform (accounts, listings, checkout, dashboards, orders). that conjoin is the first fault of the original build. its consequences:

- content changes could break commerce, and commerce changes could break content
- product engineering could never go deep, because every deep feature risked the brochure
- serving, seo, and copy cadence concerns leaked into product code and vice versa

## the verdict: three artifacts, fully separated

### 1. the content shell

the public explanatory website. pages from [marketing/](../marketing/README.md) and the [studiogram guides](../studio/studiogram/README.md), in the established lowercase voice.

- static site, deployed independently
- no accounts, no orders, no database, no client state
- explains the product; never runs it
- links into the platform only as navigation to a separately deployed app

### 2. the platform (the product)

the actual thing: the four product surfaces (studio, platform, console, admin) and the two execution domains (operations, manufacturing), per the [boundaries that do not bend](../README.md). this is where the engineering goes deep. scoped below.

### 3. the docs, in retelldb

public documentation will live in retelldb, a separate, independent project started by the owner. the name is recorded here only as the boundary marker: retelldb's spec is not written yet, and no design decisions about it are made in this repository. what this repo does record:

- the foundation's `explain/` and `audit/` folders stay as internal repository documentation
- anything intended as public docs is authored portable, so it can move to retelldb without restructuring

## the platform, scoped properly instead of shallow

the first build was shallow: demo mode, a hardcoded admin password, plaintext credentials, permissive row policies, mock checkout, no escrow, and single pages carrying copied local state. "proper" means each surface is engineered to the full flow, not the demo happy path:

### creators, fully

- account lifecycle, saved hand configurations, reusable presets
- one canonical project model: revisions, versions, and a server release gate, not copied page state
- commission opt-in as a real toggle with its own gate (authentication, conversation, approval, disputes), muted until those exist
- payout onboarding triggered at the payout threshold, connected-account flows for eligible countries

### buyers, fully

- guest checkout for standard listings, account-gated commissions, as already decided
- order history, status, delivery protection, and support tied to a real settlement record
- prices that come only from the trusted server-side computation, never client-provided values

### money, really

- trusted pricing server-side: two-way pricing (fixed creator earnings or fixed retail) computed from manufacturing cost and platform fees
- escrow/payment-holding for the commission flow
- the ledger lives in supabase, prototyped with spree + localstripe/fetchsandbox before stripe, per the finance sequencing already decided
- refunds, payouts, and evidence trails as first-class records

### manufacturing, really

- only design-release-bound orders enter routing; no orphan listings
- route eligibility from accepted partner evidence only, quotes as time-bounded snapshots
- partner adapters and status propagation per the manufacturer layer

### non-negotiables carried forward

- the [design release](../contracts/design-release.md) remains the studio-to-platform baton
- metal-only, no supplied stones; v1 without bring-your-own-stone cavities, per the lines drawn
- no client-provided price, cost, earnings, or validation claim is ever trusted
- paracraft stays decoupled from tessa and independently extractable

## how the build runs

the relay stays the sequence: [security](security/README.md) first (contain the snapshot's password and row-policy vulnerabilities), then [paracraft](paracraft/README.md) rule convergence, [tessa](tessa/README.md)'s protocol, the [studio](studio/README.md) release gate, the [platform](platform/README.md) rework, then [operations](operations/README.md). the content shell and retelldb run as parallel tracks outside the relay: the shell once marketing content settles, retelldb whenever its spec exists.

the engineering capacity for the deep passes is kiro.dev and the ibm credits, held in substantial quantity for exactly this. the spending rule: credits go against written specs, not open-ended prompting. each leg's spec is the leg readme plus its contracts, so the sessions have a defined done; and the [audit](../audit/index.md) stays the truth ledger for what actually exists at any moment.

## what is deliberately out of scope right now

- the wearables vr/ar try-on folder stays a future version, not a build track
- bringing the old lovable build forward is rejected; it is evidence and source material only
- retelldb is not designed, staffed, or scheduled from this repository
