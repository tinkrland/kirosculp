import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Eye } from "lucide-react";

const ACCENT_PRESETS = [
  "#84A48B", "#558E9B", "#A36361", "#888958",
  "#C96349", "#7BB2BA", "#A386A9", "#D2A996",
  "#E1CA7A", "#F79E70", "#C8B3CA", "#C1D8DF",
];

const ICONS = ["✦", "◈", "⬡", "❋", "◉", "△", "◇", "⊕", "✺", "⬟", "⌘", "✿"];

export default function StorefrontAppearance({ creatorAccount, onSaved }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    store_heading: creatorAccount?.store_heading ?? "",
    store_subheading: creatorAccount?.store_subheading ?? "",
    bio: creatorAccount?.bio ?? "",
    philosophy: creatorAccount?.philosophy ?? "",
    accent_color: creatorAccount?.accent_color ?? "#84A48B",
    accent_color_secondary: creatorAccount?.accent_color_secondary ?? "#C1D8DF",
    store_icon: creatorAccount?.store_icon ?? "✦",
    banner_url: creatorAccount?.banner_url ?? "",
    logo_url: creatorAccount?.logo_url ?? "",
    avatar_url: creatorAccount?.avatar_url ?? "",
  });
  
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/creators/storefront/appearance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save storefront appearance');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-account", creatorAccount.handle] });
      toast.success("storefront appearance saved");
      onSaved?.();
    },
    onError: () => {
      toast.error("failed to save appearance");
    }
  });

  return (
    <div className="space-y-6">
      {/* storefront identity */}
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">storefront identity</p>
          <Button variant="outline" size="sm" className="text-xs">
            <Eye className="w-3 h-3 mr-1" />
            preview public page
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">store heading</Label>
            <Input 
              value={form.store_heading} 
              onChange={(e) => update("store_heading", e.target.value)}
              placeholder="e.g. handcrafted metal objects from the future"
              className="rounded-xl bg-background border-border/60 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">store subheading</Label>
            <Input 
              value={form.store_subheading} 
              onChange={(e) => update("store_subheading", e.target.value)}
              placeholder="brief description of your work"
              className="rounded-xl bg-background border-border/60 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">bio</Label>
            <Textarea 
              value={form.bio} 
              onChange={(e) => update("bio", e.target.value)}
              placeholder="tell visitors about yourself and your creative process..."
              className="rounded-xl bg-background border-border/60 text-sm min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">philosophy</Label>
            <Textarea 
              value={form.philosophy} 
              onChange={(e) => update("philosophy", e.target.value)}
              placeholder="your design philosophy or creative approach..."
              className="rounded-xl bg-background border-border/60 text-sm min-h-[80px]"
            />
          </div>
        </div>
      </div>

      {/* visual identity */}
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">visual identity</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">accent color</Label>
            <div className="flex flex-wrap gap-2">
              {ACCENT_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => update("accent_color", color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    form.accent_color === color ? "border-foreground scale-110" : "border-border/40"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Input 
              type="color"
              value={form.accent_color} 
              onChange={(e) => update("accent_color", e.target.value)}
              className="w-20 h-8 p-1 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">store icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => update("store_icon", icon)}
                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm transition-all ${
                    form.store_icon === icon ? "border-foreground bg-secondary" : "border-border/40"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* media assets */}
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">media assets</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">banner image url</Label>
            <Input 
              value={form.banner_url} 
              onChange={(e) => update("banner_url", e.target.value)}
              placeholder="https://..."
              className="rounded-xl bg-background border-border/60 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">logo url</Label>
            <Input 
              value={form.logo_url} 
              onChange={(e) => update("logo_url", e.target.value)}
              placeholder="https://..."
              className="rounded-xl bg-background border-border/60 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">avatar url</Label>
            <Input 
              value={form.avatar_url} 
              onChange={(e) => update("avatar_url", e.target.value)}
              placeholder="https://..."
              className="rounded-xl bg-background border-border/60 text-sm"
            />
          </div>
        </div>
      </div>

      <Button 
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="w-full rounded-full py-5 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90"
      >
        <Save className="w-4 h-4 mr-2" />
        {saveMutation.isPending ? "saving..." : "save appearance"}
      </Button>
    </div>
  );
}