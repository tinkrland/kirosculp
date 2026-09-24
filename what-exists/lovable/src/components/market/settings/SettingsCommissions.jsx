// commission settings for a market account.
//
// thin wrapper around CommissionTermsEditor - saves the patch through
// the store-update edge function (db facade routes MarketAccount
// updates there automatically).

import { useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import CommissionTermsEditor from "@/components/commissions/CommissionTermsEditor";

export default function SettingsCommissions({ account }) {
  const queryClient = useQueryClient();
  return (
    <CommissionTermsEditor
      initial={account}
      hasMarketAccount={true}
      onSave={async (patch) => {
        await db.entities.MarketAccount.update(account.id, patch);
        queryClient.invalidateQueries({ queryKey: ["market-account", account.handle] });
      }}
    />
  );
}
