import { db } from '@/lib/db';
import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save } from "lucide-react";

const ACCENT_PRESETS = [
  "#84A48B", "#558E9B", "#A36361", "#888958",
  "#C96349", "#7BB2BA", "#A386A9", "#D2A996",
  "#E1CA7A", "#F79E70", "#C8B3CA", "#C1D8DF",
];

const ICONS = ["✦", "◈", "⬡", "❋", "◉", "△", "◇", "⊕", "✺", "⬟", "⌘", "✿"];

export default function StoreAppearance({ account, onSaved }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    store_heading: account?.store_heading ?? "",
    store_subheading: account?.store_subheading ?? "",
    accent_color: account?.accent_color ?? "#84A48B",
    accent_color_secondary: account?.accent_color_secondary ?? "#C1D8DF",
    store_icon: account?.store_icon ?? "✦",
    banner_url: account?.banner_url ?? "",
    logo_url: account?.logo_url ?? "",
    avatar_url: account?.avatar_url ?? "",
  });
  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const saveMutation = useMutation({
    mutationFn: () => db.entities.MarketAccount.update(account.id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-account", account.handle] });
      toast.success("appearance saved");
      onSaved?.();
    },
  });

  return (
    <div className="space-y-6">
      {/* heading & subheading */}
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">store identity</p>

        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">store heading</Label>
          <Input value={form.store_heading} onChange={(e) => update("store_heading", e.target.value)}
            placeholder="e.g. handcrafted metal objects from the future"
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide" />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">subheading</Label>
          <Input value={form.store_subheading} onChange={(e) => update("store_subheading", e.target.value)}
            placeholder="a short tagline"
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide" />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">store icon / symbol</Label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((icon) => (
              <button key={icon} onClick={() => update("store_icon", icon)}
                className={`w-9 h-9 rounded-lg border text-lg transition-all flex items-center justify-center ${
                  form.store_icon === icon ? "border-foreground bg-foreground/5" : "border-border/40 hover:border-foreground/30"
                }`}>
                {icon}
              </button>
            ))}
            <input
              type="text"
              maxLength={2}
              placeholder="custom"
              value={ICONS.includes(form.store_icon) ? "" : form.store_icon}
              onChange={(e) => update("store_icon", e.target.value)}
              className="w-20 h-9 rounded-lg border border-border/40 bg-background text-center text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* accent colors */}
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">accent colors</p>

        <div className="space-y-3">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">primary accent</Label>
          <div className="flex flex-wrap gap-2 items-center">
            {ACCENT_PRESETS.map((c) => (
              <button key={c} onClick={() => update("accent_color", c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${form.accent_color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"}`}
                style={{ background: c }} />
            ))}
            <div className="flex items-center gap-2 ml-1">
              <input type="color" value={form.accent_color}
                onChange={(e) => update("accent_color", e.target.value)}
                className="w-7 h-7 rounded-full border-0 cursor-pointer" />
              <span className="text-[11px] text-muted-foreground/50 font-mono">{form.accent_color}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">secondary accent</Label>
          <div className="flex flex-wrap gap-2 items-center">
            {ACCENT_PRESETS.map((c) => (
              <button key={c} onClick={() => update("accent_color_secondary", c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${form.accent_color_secondary === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"}`}
                style={{ background: c }} />
            ))}
            <div className="flex items-center gap-2 ml-1">
              <input type="color" value={form.accent_color_secondary}
                onChange={(e) => update("accent_color_secondary", e.target.value)}
                className="w-7 h-7 rounded-full border-0 cursor-pointer" />
              <span className="text-[11px] text-muted-foreground/50 font-mono">{form.accent_color_secondary}</span>
            </div>
          </div>
        </div>
      </div>

      {/* images */}
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">images</p>

        {[
          { field: "avatar_url", label: "Avatar URL", hint: "square profile image" },
          { field: "logo_url", label: "Logo URL", hint: "optional logo (transparent PNG ideal)" },
          { field: "banner_url", label: "Banner URL", hint: "wide header image for your store page" },
        ].map(({ field, label, hint }) => (
          <div key={field} className="space-y-2">
            <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">{label}</Label>
            <p className="text-[10px] text-muted-foreground/40 tracking-wide -mt-1">{hint}</p>
            <Input value={form[field]} onChange={(e) => update(field, e.target.value)}
              placeholder="https://..."
              className="rounded-xl bg-background border-border/60 text-sm tracking-wide" />
            {form[field] && (
              <img src={form[field]} alt="" className="w-16 h-10 rounded-lg object-cover border border-border/40" />
            )}
          </div>
        ))}
      </div>

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
        className="rounded-full px-5 py-5 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5">
        <Save className="w-3.5 h-3.5" />
        {saveMutation.isPending ? "saving..." : "save appearance"}
      </Button>
    </div>
  );
}