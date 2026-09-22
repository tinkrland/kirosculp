# studio: creators

creator identity, project ownership, presets, and saved creative assets. a person enters the Studio as a creator, even if they arrived as a Pinterest lurker, buyer, illustrator, avatar designer, or someone who had never previously considered themselves a jewelry designer.

buyers and commissioners do not receive direct Studio access in those roles. a buyer who wants to author a design crosses into the creator flow and owns a creator project.

## creator flow

1. **become a creator**
   create a creator identity and enter the Studio. this does not automatically create a public shop, publish work, enable commissions, or place the creator in discovery.

2. **start a private project**
   add references, describe the intended feeling, and choose a starting template or parameter set.

3. **shape the design**
   work directly with controls or use Tessa as the middle-layer operator. Tessa proposes values for predefined knobs; the creator accepts, rejects, or changes them.

4. **compile and inspect**
   ParaCraft compiles the accepted project through OpenSCAD, enforces physical limits, and presents the deterministic model through the browser WebGL renderer.

5. **revise until valid**
   the creator responds to wall-thickness, shrinkage, clearance, feature, and process feedback. failed work remains an editable private project.

6. **issue a design release**
   a passing, creator-approved build becomes an immutable versioned release. this is the only object that may cross from Studio to Platform.

7. **publish an offer**
   on the Platform, the creator turns a release into a listing, configures materials and pricing intent, and chooses a storefront or connected channel. ordinary made-to-order sales can now happen passively.

8. **optionally enable commissions later**
   commission availability is a deliberate creator toggle, not a default effect of signup. enabling it means the creator is willing to receive authenticated briefs under the commission lifecycle and terms. it does not give commissioners Studio access.

9. **pause commissions independently**
   a creator can stop accepting new commissions while keeping released listings available for ordinary purchases.

## audited implementation reference

**status: partial**

### existing source evidence

- `sculptura/src/pages/studio/BuildPage.jsx`
- `sculptura/src/components/studio/StudioNav.jsx`
- `sculptura/src/lib/studioStore.js`
- `sculptura/src/pages/PublishArtifact.jsx`
- `sculptura.dev/src/components/market/settings/SettingsCommissions.jsx`

### what exists now

- a creator can move through a broad guided builder, inspect a WebGL/Three.js preview, and persist one active design in browser local storage
- the existing publish page crosses directly into listing creation and does not create a design release
- a commission toggle exists in platform settings, but authenticated request intake and the complete commission lifecycle do not

### required changes

- replace the browser-only active design with authenticated creator projects and explicit revisions
- keep listing publication out of Studio and issue a release for Platform consumption
- keep commissions off by default and independent from ordinary listings
- activate the commission toggle only after authenticated intake, conversation, terms, payment protection, revisions, acceptance, cancellation, fulfillment, payout, and disputes are enforceable

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
