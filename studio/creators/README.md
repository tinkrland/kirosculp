# Studio: creators

Creator identity, project ownership, presets, and saved creative assets. A person enters the Studio as a creator, even if they arrived as a Pinterest lurker, buyer, illustrator, avatar designer, or someone who had never previously considered themselves a jewelry designer.

Buyers and commissioners do not receive direct Studio access in those roles. A buyer who wants to author a design crosses into the creator flow and owns a creator project.

## Creator flow

1. **Become a creator**
   Create a creator identity and enter the Studio. This does not automatically create a public shop, publish work, enable commissions, or place the creator in discovery.

2. **Start a private project**
   Add references, describe the intended feeling, and choose a starting template or parameter set.

3. **Shape the design**
   Work directly with controls or use Tessa as the middle-layer operator. Tessa proposes values for predefined knobs; the creator accepts, rejects, or changes them.

4. **Compile and inspect**
   ParaCraft compiles the accepted project through OpenSCAD, enforces physical limits, and presents the deterministic model through the browser WebGL renderer.

5. **Revise until valid**
   The creator responds to wall-thickness, shrinkage, clearance, feature, and process feedback. Failed work remains an editable private project.

6. **Issue a design release**
   A passing, creator-approved build becomes an immutable versioned release. This is the only object that may cross from Studio to Platform.

7. **Publish an offer**
   On the Platform, the creator turns a release into a listing, configures materials and pricing intent, and chooses a storefront or connected channel. Ordinary made-to-order sales can now happen passively.

8. **Optionally enable commissions later**
   Commission availability is a deliberate creator toggle, not a default effect of signup. Enabling it means the creator is willing to receive authenticated briefs under the commission lifecycle and terms. It does not give commissioners Studio access.

9. **Pause commissions independently**
   A creator can stop accepting new commissions while keeping released listings available for ordinary purchases.

## Audited implementation reference

**Status: partial**

### Existing source evidence

- `sculptura/src/pages/studio/BuildPage.jsx`
- `sculptura/src/components/studio/StudioNav.jsx`
- `sculptura/src/lib/studioStore.js`
- `sculptura/src/pages/PublishArtifact.jsx`
- `sculptura.dev/src/components/market/settings/SettingsCommissions.jsx`

### What exists now

- A creator can move through a broad guided builder, inspect a WebGL/Three.js preview, and persist one active design in browser local storage
- The existing publish page crosses directly into listing creation and does not create a design release
- A commission toggle exists in platform settings, but authenticated request intake and the complete commission lifecycle do not

### Required changes

- Replace the browser-only active design with authenticated creator projects and explicit revisions
- Keep listing publication out of Studio and issue a release for Platform consumption
- Keep commissions off by default and independent from ordinary listings
- Activate the commission toggle only after authenticated intake, conversation, terms, payment protection, revisions, acceptance, cancellation, fulfillment, payout, and disputes are enforceable

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
