// manage manufacturer connections. behind the scenes, each row maps a
// human label to an api endpoint and a credential reference. we never
// store actual api keys here; the credential_ref points at a server
// secret so rotation stays out of the database.

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Factory, Trash2, CheckCircle2, CircleDot } from "lucide-react";

const STATUS_STYLES = {
  active: "text-emerald-600 bg-emerald-50 border-emerald-200",
  testing: "text-amber-600 bg-amber-50 border-amber-200",
  inactive: "text-muted-foreground bg-secondary border-border",
};

const EMPTY = {
  name: "", slug: "", region: "", capabilities: "", supported_materials: "",
  status: "inactive", contact_email: "", api_endpoint: "", credential_ref: "", notes: "",
};

function ManufacturerForm({ initial, onSubmit, submitting }) {
  const [form, setForm] = useState(initial || EMPTY);
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      capabilities: form.capabilities ? form.capabilities.split(",").map((s) => s.trim()).filter(Boolean) : [],
      supported_materials: form.supported_materials ? form.supported_materials.split(",").map((s) => s.trim()).filter(Boolean) : [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">name</Label>
          <Input value={form.name} onChange={update("name")} required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">slug</Label>
          <Input value={form.slug} onChange={update("slug")} required placeholder="shapeways" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">region</Label>
          <Input value={form.region} onChange={update("region")} placeholder="eu, us, global" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">status</Label>
          <select
            value={form.status}
            onChange={update("status")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="inactive">inactive</option>
            <option value="testing">testing</option>
            <option value="active">active</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">capabilities (comma separated)</Label>
        <Input value={form.capabilities} onChange={update("capabilities")} placeholder="cast, polish, plate, engrave" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">supported materials (comma separated)</Label>
        <Input value={form.supported_materials} onChange={update("supported_materials")} placeholder="silver, brass, bronze" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">contact email</Label>
          <Input type="email" value={form.contact_email} onChange={update("contact_email")} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">api endpoint</Label>
          <Input value={form.api_endpoint} onChange={update("api_endpoint")} placeholder="https://..." />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">credential reference (secret name, never the key itself)</Label>
        <Input value={form.credential_ref} onChange={update("credential_ref")} placeholder="SHAPEWAYS_API_KEY" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">notes</Label>
        <Textarea value={form.notes} onChange={update("notes")} rows={3} />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={submitting} className="rounded-full">
          {submitting ? "saving..." : "save"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminManufacturers() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: list = [] } = useQuery({
    queryKey: ["manufacturers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("manufacturers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createOne = useMutation({
    mutationFn: async (payload) => {
      const { error } = await supabase.from("manufacturers").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("manufacturer added");
      qc.invalidateQueries({ queryKey: ["manufacturers"] });
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const setDefault = useMutation({
    mutationFn: async (id) => {
      await supabase.from("manufacturers").update({ is_default: false }).neq("id", "00000000-0000-0000-0000-000000000000");
      const { error } = await supabase.from("manufacturers").update({ is_default: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("default updated");
      qc.invalidateQueries({ queryKey: ["manufacturers"] });
    },
  });

  const removeOne = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("manufacturers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("removed");
      qc.invalidateQueries({ queryKey: ["manufacturers"] });
    },
  });

  return (
    <AdminLayout title="manufacturers" subtitle="api connections to partner manufacturing services">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground/70 max-w-xl">
          add the manufacturers your platform routes orders to. credentials live as
          backend secrets; only the reference name lives here.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2"><Plus className="w-4 h-4" /> add manufacturer</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="lowercase">new manufacturer</DialogTitle></DialogHeader>
            <ManufacturerForm onSubmit={(p) => createOne.mutate(p)} submitting={createOne.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-[16px]">
          <Factory className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground/60">no manufacturers connected yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((m) => (
            <div key={m.id} className="bg-card border border-border/50 rounded-[16px] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-light lowercase">{m.name}</h3>
                    <span className={`text-[11px] tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLES[m.status] || STATUS_STYLES.inactive}`}>
                      {m.status}
                    </span>
                    {m.is_default && (
                      <span className="text-[11px] tracking-wider px-2 py-0.5 rounded-full border border-foreground/20 text-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> default
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    {m.slug}{m.region ? ` , ${m.region}` : ""}{m.contact_email ? ` , ${m.contact_email}` : ""}
                  </div>
                  {m.api_endpoint && (
                    <div className="text-xs text-muted-foreground/60 mt-1 font-mono truncate">{m.api_endpoint}</div>
                  )}
                  {(m.capabilities?.length || m.supported_materials?.length) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.capabilities?.map((c) => <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary">{c}</span>)}
                      {m.supported_materials?.map((c) => <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary">{c}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!m.is_default && (
                    <Button size="sm" variant="outline" className="rounded-full text-xs gap-1" onClick={() => setDefault.mutate(m.id)}>
                      <CircleDot className="w-3 h-3" /> set default
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="rounded-full text-xs text-red-600" onClick={() => removeOne.mutate(m.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              {m.notes && <p className="text-xs text-muted-foreground/70 mt-3 leading-relaxed">{m.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
