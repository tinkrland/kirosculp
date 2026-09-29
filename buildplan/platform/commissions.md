# commissions: in-platform, escrowed, disputable

commissions are why the front-desk email routing explicitly does not
broker deals. a commission is a custom-work engagement: the creator is
paid for the idea and the labor of customizing it, plus optionally the
manufactured piece. taken off-platform, the creator handles the whole
situation alone: chasing payment, scope arguments, refunds, chargebacks.
so commissions live in-platform, under rails, like vgen's model.

## never out of the platform

- the routed support mailbox answers questions; it never negotiates,
  quotes, or accepts commissions. commission offers made by email are
  redirected into the flow, not handled there.
- all commission briefs, messages, drafts, and approvals stay
  in-platform and retained: the record is the dispute evidence.
- off-platform settlement is outside the terms: no protection claims
  for it, no ledger entries for it.

## the terms are structured data, not a carrd page

the creator console's commissions tab is where a creator switches
commissions on (manual toggle, never default-on from signup) and
configures terms intuitively:

- **pricing model:** flat, hourly, or milestone-based; deposits allowed.
  the buyer sees the model rendered plainly before committing.
- **scope:** revisions count and policy, turnaround expectations,
  boundaries (metal-only, no stones, printability constraints apply to
  commissioned pieces exactly as to listed ones).
- **rights:** usage and personal-use terms, stated as part of the terms
  of record.
- **availability:** open/closed status, queue depth or slots, pause.

the public creator page's commissions tab renders these terms
(structured, comparable, no link-outs), which is what replaces the
carrd.co site: the platform is the terms surface.

### carrd-parity: what the tab must carry so no external page is needed

a creator reaches for carrd when the platform page cannot answer a
buyer's questions. so the commissions tab carries everything a carrd
would, as structured data plus bounded freeform:

- **how commissions work (platform-rendered, once):** the escrow
  flow, what a brief is, milestones, what protection means. written
  by the platform, identical for every creator; no creator should
  have to explain our own rails.
- **the structured terms:** pricing model, scope, rights (including
  the buyout option and the personal-use default from
  [ip-licensing.md](ip-licensing.md)), availability and live queue
  state. legally binding, canonical, always rendered.
- **commission gallery:** completed work, published with buyer
  permission or anonymized ([creator-surfaces.md](creator-surfaces.md)).
- **faq:** creator-authored questions and answers, bounded freeform;
  supplements but never overrides the structured terms. if a faq
  answer contradicts the terms of record, the terms win and the
  contradiction is surfaced to the creator in the console.
- **commission reviews:** buyer-written, tied to completed
  commissions only, never to canceled ones; disputes stay private to
  the dispute flow.
- **process story:** turnaround reality, how the creator works,
  reference-photo etiquette; freeform, displayed after the terms.

the rule that keeps it clean: anything legally binding is structured
data; freeform sections may add warmth but may not add obligations.
a carrd is needed only when the platform refuses to say what it
already knows.

## the flow

1. buyer (logged in, per the standing rule) submits a brief:
   references, preferences, intent. no geometry, no parameter
   editing; the creator interprets the brief in the studio.
2. creator accepts with final terms (price, milestones, timeline) or
   declines/counteroffers. accepted terms become the contract of
   record.
3. buyer funds escrow: the supabase ledger holds the commission value
   in a commission-scoped escrow account.
4. work proceeds through the studio: the custom piece is developed by
   the creator with tessa/paracraft, checkpointed by design releases;
   the buyer previews checkpoints exactly as released, never raw
   geometry.
5. staged releases per milestone: design approval, (if the piece is
   included) manufacture and ship, final acceptance.
6. completion releases remaining escrow to the creator wallet.

## disputes

state machine, not vibes: `brief, accepted, funded, in_progress,
delivered, revision_requested, disputed, resolved, cancelled`.
dispute handling is platform-mediated over the retained record:
briefs, messages, checkpoint releases, and acceptance actions.
refund rules draw from escrow and follow the ledger's append-only
entries; nothing is unwritten. dispute questions arriving at the
front desk are routed into the dispute flow, never adjudicated by
email.

## pricing and fees (direction only, set with the pricing leg)

- the labor/idea fee is entirely creator-set (flat/hourly/milestone),
  and the platform fee applies to it per the standard fee structure.
- if the manufactured piece is included, it prices through the normal
  trusted-pricing path (manufacturing cost + fee split); the two-way
  pricing model applies to the piece component, not the labor.

## boundaries

- commissions opt-in is a manual toggle with an availability state;
  nothing about it is implied by published listings.
- the buyer briefs, the creator designs: buyers never operate the
  studio agent, per the standing rule.
- commissioned pieces pass the same paracraft validation before any
  manufacture; a commission cannot override geometry constraints.
- commissions reference design releases and listings; escrow and
  release actions are ledger entries, and the payments readme's model
  holds unchanged.
