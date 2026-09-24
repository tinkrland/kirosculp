import { db } from '@/lib/db';
import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, X, Plus } from "lucide-react";

const SUGGESTED_MATERIALS = ["silver", "brass", "gold", "bronze", "copper", "steel", "titanium", "aluminum", "resin", "ceramic"];
const SUGGESTED_TOOLS = ["rhino", "blender", "fusion 360", "zbrush", "solidworks", "autocad", "grasshopper", "cinema 4d", "maya", "houdini"];

function TagInput({ label, values, onChange, suggestions }) {
  const [input, setInput] = useState("");

  const add = (val) => {
    const trimmed = val.trim().toLowerCase();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
    setInput("");
  };

  const remove = (val) => onChange(values.filter((v) => v !== val));

  return (
    <div className="space-y-3">
      <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">{label}</Label>

      <div className="flex flex-wrap gap-2 min-h-[36px]">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs tracking-wide bg-secondary border border-border/50 text-foreground">
            {v}
            <button onClick={() => remove(v)} className="ml-0.5 hover:text-destructive transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder={`add ${label.toLowerCase()}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(input); } }}
          className="rounded-xl bg-background border-border/60 text-sm tracking-wide flex-1"
        />
        <Button variant="outline" size="icon" className="rounded-xl shrink-0" onClick={() => add(input)}>
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {suggestions.filter((s) => !values.includes(s)).map((s) => (
          <button key={s} onClick={() => add(s)}
            className="px-2.5 py-1 rounded-full text-[11px] tracking-wide text-muted-foreground/60 border border-dashed border-border/50 hover:border-foreground/30 hover:text-foreground transition-colors">
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SettingsMaterials({ account }) {
  const queryClient = useQueryClient();
  const [materials, setMaterials] = useState(account?.materials ?? []);
  const [tools, setTools] = useState(account?.tools ?? []);

  const saveMutation = useMutation({
    mutationFn: () => db.entities.MarketAccount.update(account.id, { materials, tools }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-account", account.handle] });
      toast.success("saved");
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-7">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">materials & software</p>
        <TagInput label="Materials" values={materials} onChange={setMaterials} suggestions={SUGGESTED_MATERIALS} />
        <div className="h-px bg-border/30" />
        <TagInput label="CAD Tools" values={tools} onChange={setTools} suggestions={SUGGESTED_TOOLS} />
      </div>

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
        className="rounded-full px-5 py-5 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5">
        <Save className="w-3.5 h-3.5" />
        {saveMutation.isPending ? "saving..." : "save"}
      </Button>
    </div>
  );
}