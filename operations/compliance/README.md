# Compliance

Identity and payout requirements, sanctions/export checks, consumer protections, tax evidence, privacy obligations, product restrictions, and records retention. Rollout gates consume approved compliance decisions; they do not infer them.


Creator onboarding geography follows current payout-provider availability, while shipping geography follows the separate destination allowlist. Payout KYC is intended at the $20/€20 release threshold, but sanctions, provider, transaction-monitoring, or legal rules may require earlier verification.

## Audited implementation reference

**Status: research only**

### Existing source evidence

- No compliance service exists in the source applications.
- `manufacturing/research/topics/vienna-convention-ccm.md` and rollout records in this foundation hold research inputs.

### What exists now

- Source UIs do not enforce hallmarking, restricted-route, sanctions, consumer-information, or evidence-expiry rules.

### Required changes

- Turn approved findings into versioned route predicates and required production documentation.
- Keep legal review and evidence dates explicit.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
