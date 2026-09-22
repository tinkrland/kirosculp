# manufacturer layer

one normalized adapter interface per partner for upload, quote, order, and status. adapters return `null` for unavailable vendor fields and preserve raw responses for audit. capability truth comes from the reference dataset, not hardcoded adapter claims.
