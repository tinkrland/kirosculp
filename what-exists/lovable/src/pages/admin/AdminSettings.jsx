// platform-wide toggles. anything that does not belong to a single
// section ends up here: support email, maintenance flag, anything we
// add later that needs a global home.

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AdminSettings() {
  const qc = useQueryClient();
  const [supportEmail, setSupportEmail] = useState("");
  const [maintenance, setMaintenance] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_settings").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (!settings) return;
    setSupportEmail(settings.support_email || "");
    setMaintenance(!!settings.maintenance_mode);
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("platform_settings").update({
        support_email: supportEmail || null,
        maintenance_mode: maintenance,
      }).eq("id", settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("settings saved");
      qc.invalidateQueries({ queryKey: ["platform-settings"] });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AdminLayout title="platform settings" subtitle="global switches that affect every visitor">
      <div className="bg-card border border-border/50 rounded-[16px] p-6 space-y-6 max-w-2xl">
        <div>
          <Label className="text-xs">support email</Label>
          <Input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="hello@sculptura.shop"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground/60 mt-1">
            shown wherever the site asks people to reach out.
          </p>
        </div>

        <div className="flex items-start justify-between gap-4 pt-4 border-t border-border/40">
          <div>
            <div className="text-sm lowercase">maintenance mode</div>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-md">
              when on, the marketplace shows a soft pause notice and disables
              checkout. existing dashboards stay reachable.
            </p>
          </div>
          <Switch checked={maintenance} onCheckedChange={setMaintenance} />
        </div>

        <Button onClick={() => save.mutate()} disabled={save.isPending || !settings} className="rounded-full">
          {save.isPending ? "saving..." : "save settings"}
        </Button>
      </div>
    </AdminLayout>
  );
}
