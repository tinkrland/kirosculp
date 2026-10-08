---
title: identity model and ids
summary: the four sculptura identity objects, their immutable ids, their handles and display names, and what is public versus internal.
---

# platform: identity model and ids

the handle structure and the artist/creator distinction are recorded
elsewhere ([creator access](creator-access.md), [storefront
surfaces](storefronts/README.md)). this document closes the remaining gap:
the ids themselves, the display name, and what each surface actually shows.
the ids live here in the platform leg, not the security leg: they are
account-model facts, not fraud or trust machinery, and they must stay
independent of every trust, corridor and market concept.

## the identity objects and their ids

| object | immutable id | minted when | public handle | display layer |
|---|---|---|---|---|
| artist account (the person) | cin (creator id number) | artist account creation | artist username `@artistname` | display name |
| storefront (the shop) | sin (storefront id number) | first storefront creation | shop handle `@shopname` | shop display name |
| buyer account | bin (buyer id number) | buyer signup | none in v1 | none in v1 |

- **cin is minted at account creation, not at the creator transition.**
  an artist becomes a creator by passing gates, and a state change must
  not mint a new number: the account keeps the id it was born with. the
  name says "creator" because the account's purpose is creatorship, and
  because the buyer-side analogue (bin) is named the same way. an
  admitted artist holds their cin before they are a creator, and a
  rejected or parked account holds a cin that simply never progresses.
  open question, flagged: whether the id should instead be called ain
  (artist id number) to match the artist-first progression, with cin as
  an alias or a non-number. current standing: keep cin, one id per
  person-account, minted once.
- **sin belongs to the shop object, not the person.** the account and
  the shop are separate objects, currently connected one-to-one. if
  multi-storefront support ever arrives, one cin connects to several
  sins, which is exactly why the two numbers must never merge.
- **bin mints at buyer signup.** buyers have no public handle, profile
  page or display name in v1; buyer identity is visible only where the
  buyer opts in, per the engagement and wishlist redaction rules
  ([engagement](buyers/engagement.md)).

## names versus handles versus ids

three different layers, never collapsed:

- **the display name** ("juliette cavanaugh") is the human-readable
  label the artist shows. it is not unique, not a handle, never used in
  urls or routing, and changes freely (any edit cadence limit stays
  open until abuse shows a need for one). the artist profile header
  leads with it.
- **the artist username** is the unique, rate-limited public handle
  (existing rule: 2 changes per 30 days, 5 lifetime) that lives at
  `creators.sculptura.tld/@artistname`.
- **the shop handle** is a separate unique namespace living at
  `sculptura.tld/@shopname`. the two handle namespaces are
  independent: changing one never changes the other.
- **the ids (cin, sin, bin) are none of the above.** no handle is
  derived from any id and no id is derived from any handle, so handle
  churn never touches the audit trail and ids never leak naming
  history.

## public versus internal

public surfaces (artist profile, storefront, search, discovery) render
only display names and handles. the ids are internal join keys for
support, release records, payout onboarding, dispute evidence and audit
logs. an opaque number carries no earned trust signal, and a public
sequential id invites enumeration, so none of the three ids is ever
rendered on a public page.

the one place an id is shown is the owner's own private dashboard
settings, discord-style: the creator can read their cin there, but
nobody else ever sees it, and buyers can read their bin the same way.
changing a username or display name never changes the id, and it is
the id, not any handle, that stays associated with payout onboarding
and every downstream record. support or dispute flows still do not
quote ids; threads carry their own reference numbers, and a creator
who needs to reference their account for support can be told to check
their settings page.

## admin lookup

the admin panel exposes a cli-style lookup keyed by id. `lookup cin
<number>` returns the account's join keys in a fixed shape:

```
lookup cin 12345678

username:    @artistusername
storefront:  @storefrontname
idv_complete: true
```

admin-only: it exists because the ids are the join keys, so an admin
resolving an account to its current handles goes through the id, not
the other way around. creators and buyers never see this surface;
creators read their own cin in dashboard settings as ruled above.

the demo [roster](creators/demo-roster.md) and [buyers registry](buyers/demo-buyers.md)
capture names and handles only; when fixture CIN/SIN values are minted they
belong in the roster table, BIN values in the buyers registry table, not in
the id definitions here.
