// db-ports.mjs
//
// database-backed implementations of the two ports the decision service needs:
// a policy store and a recorder. both take a plain `query(sql, params)` function
// returning `{ rows }`, so the same code runs against pglite in tests and a
// service_role connection on a server. no driver is imported here.
//
// every statement is parameterized. the only path that writes is
// public.record_payout_signal_check, which is executable by service_role only.

/** the policy row for a market, falling back to DEFAULT. a specific row wins. */
const POLICY_SQL = `
  select policy_version, market, mandatory_checks, positive_outcome
    from sculptura_private.payout_signal_policy
   where policy_version = $1 and enabled and market in ($2, 'DEFAULT')`;

const FIND_SQL = `
  select d.creator_profile_id, d.moment, d.outcome, d.reason_codes, d.policy_version,
         d.selected_checks, e.device_hash, e.ip_digest
    from sculptura_private.payout_signal_decisions d
    left join sculptura_private.creator_signal_events e on e.submission_id = d.submission_id
   where d.submission_id = $1::uuid`;

const RECORD_SQL = `
  select public.record_payout_signal_check(
    $1::uuid, $2, $3::uuid, $4, $5, $6, $7, $8::jsonb, $9, $10, $11::jsonb, $12, $13::jsonb, $14::jsonb, $15
  ) as r`;

/** @param {(sql: string, params?: any[]) => Promise<{ rows: any[] }>} query */
export function createDbPolicyStore(query) {
  return {
    async getPolicy(policyVersion, market) {
      const { rows } = await query(POLICY_SQL, [policyVersion, market]);
      const row = rows.find((r) => r.market === market) ?? rows.find((r) => r.market === 'DEFAULT');
      if (!row) return null;
      return {
        policyVersion: row.policy_version,
        mandatoryChecks: [...row.mandatory_checks],
        positiveOutcome: row.positive_outcome,
      };
    },
  };
}

/** @param {(sql: string, params?: any[]) => Promise<{ rows: any[] }>} query */
export function createDbRecorder(query) {
  return {
    async record(row) {
      const { rows } = await query(RECORD_SQL, [
        row.creatorProfileId, row.moment, row.submissionId, row.deviceHash, row.ipDigest,
        row.hashKeyId, row.collectionStatus, JSON.stringify(row.deviceFeatures),
        row.processorVersion, row.policyVersion, JSON.stringify(row.selectedChecks), row.outcome,
        JSON.stringify(row.reasonCodes), JSON.stringify(row.networkFlags), row.adapterVersion,
      ]);
      return rows[0].r;
    },

    async findExisting(submissionId) {
      const { rows } = await query(FIND_SQL, [submissionId]);
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        creatorProfileId: r.creator_profile_id,
        moment: r.moment,
        deviceHash: r.device_hash ?? null,
        ipDigest: r.ip_digest ?? null,
        decision: {
          outcome: r.outcome,
          reasonCodes: [...r.reason_codes],
          policyVersion: r.policy_version,
          selectedChecks: [...r.selected_checks],
        },
      };
    },
  };
}
