# compliance

identity and payout requirements, sanctions/export checks, consumer protections, tax evidence, privacy obligations, product restrictions, and records retention. rollout gates consume approved compliance decisions; they do not infer them.


creator onboarding geography follows current payout-provider availability, while shipping geography follows the separate destination allowlist. payout kyc is intended at the $50/€50 first-release threshold (usd 25 / eur 25 for payouts after the first), but sanctions, provider, transaction-monitoring, or legal rules may require earlier verification.

## audited implementation reference

**status: research only**

### existing source evidence

- no compliance service exists in the source applications.
- `manufacturing/research/topics/vienna-convention-ccm.md` and rollout records in this foundation hold research inputs.

### what exists now

- source uis do not enforce hallmarking, restricted-route, sanctions, consumer-information, or evidence-expiry rules.

### required changes

- turn approved findings into versioned route predicates and required production documentation.
- keep legal review and evidence dates explicit.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
