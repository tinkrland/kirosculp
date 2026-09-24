import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save } from "lucide-react";

// Username (handle) editor.
//
// the public storefront url uses the editable handle, but the permanent
// `slug` never changes - internal references and admin links stay stable
// regardless of how often the creator renames themselves.
//
// rules: lowercase letters and numbers only, 4+ chars, unique. uniqueness
// and format are also enforced in the store-update edge function.
export default function StoreUsername({ account, onSaved }) {
  const queryClient = useQueryClient();
  const [handle, setHandle] = useState(account?.handle ?? "");
  const cleaned = handle.toLowerCase().replace(/[^a-z0-9]/g, "");
  const valid = cleaned.length >= 4;
  const changed = cleaned !== account?.handle;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!valid) throw new Error("username must be at least 4 letters or numbers");
      return db.entities.MarketAccount.update(account.id, { handle: cleaned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-account", account.handle] });
      toast.success("username updated, redirecting…");
      onSaved?.(cleaned);
    },
    onError: (err) => toast.error(err.message || "could not update username"),
  });

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">public username</p>

        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">handle</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground/60 tracking-wide">sculptura.shop/</span>
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="rounded-xl bg-background border-border/60 text-sm tracking-wide font-mono"
            />
          </div>
          <p className="text-[11px] text-muted-foreground/40 tracking-wide">
            lowercase letters and numbers only, minimum 4 characters. must be unique across sculptura.
          </p>
          {handle && handle !== cleaned && (
            <p className="text-[11px] text-amber-600 tracking-wide">
              will be saved as <span className="font-mono">{cleaned}</span>
            </p>
          )}
        </div>

        <div className="bg-secondary/40 rounded-xl border border-border/30 p-4 space-y-1">
          <p className="text-[10px] tracking-widest text-muted-foreground/50 uppercase">permanent slug</p>
          <p className="text-xs font-mono text-muted-foreground/80">{account?.slug || "-"}</p>
          <p className="text-[11px] text-muted-foreground/40 tracking-wide leading-relaxed">
            this internal id never changes, even if you rename your store. links shared with admins or in
            integrations stay valid.
          </p>
        </div>
      </div>

      <Button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending || !valid || !changed}
        className="rounded-full px-5 py-5 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5"
      >
        <Save className="w-3.5 h-3.5" />
        {saveMutation.isPending ? "saving..." : "save username"}
      </Button>
    </div>
  );
}
