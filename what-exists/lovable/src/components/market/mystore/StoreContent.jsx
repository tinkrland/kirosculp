import { db } from '@/lib/db';
import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Plus, Trash2 } from "lucide-react";

export default function StoreContent({ account, onSaved }) {
  const queryClient = useQueryClient();
  const [orderMessage, setOrderMessage] = useState(account?.order_message ?? "");
  const [faqItems, setFaqItems] = useState(account?.faq_items ?? []);

  const addFaq = () => setFaqItems([...faqItems, { q: "", a: "" }]);
  const removeFaq = (i) => setFaqItems(faqItems.filter((_, idx) => idx !== i));
  const updateFaq = (i, field, val) => {
    const next = faqItems.map((item, idx) => idx === i ? { ...item, [field]: val } : item);
    setFaqItems(next);
  };

  const saveMutation = useMutation({
    mutationFn: () => db.entities.MarketAccount.update(account.id, { order_message: orderMessage, faq_items: faqItems }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-account", account.handle] });
      toast.success("content saved");
      onSaved?.();
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">post-order message</p>
        <p className="text-[11px] text-muted-foreground/40 tracking-wide -mt-3">shown to buyers after checkout</p>
        <Textarea
          value={orderMessage}
          onChange={(e) => setOrderMessage(e.target.value)}
          placeholder="Thank you for your order! I'll start work on your piece within 2 days and send you updates via email."
          className="rounded-xl bg-background border-border/60 text-sm tracking-wide min-h-[100px]"
        />
      </div>

      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">store faq</p>
            <p className="text-[11px] text-muted-foreground/40 tracking-wide mt-0.5">shown on your public store page</p>
          </div>
          <Button variant="outline" size="sm" onClick={addFaq}
            className="rounded-full text-xs tracking-wider gap-1.5 border-border/60">
            <Plus className="w-3.5 h-3.5" /> add item
          </Button>
        </div>

        {faqItems.length === 0 && (
          <p className="text-xs text-muted-foreground/30 tracking-wide text-center py-4">no faq items yet</p>
        )}

        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <div key={i} className="bg-background rounded-[14px] border border-border/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-widest text-muted-foreground/30 uppercase">item {i + 1}</span>
                <button onClick={() => removeFaq(i)} className="text-muted-foreground/30 hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">question</Label>
                <Input value={item.q} onChange={(e) => updateFaq(i, "q", e.target.value)}
                  placeholder="e.g. How long does production take?"
                  className="rounded-xl bg-card border-border/50 text-sm tracking-wide" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">answer</Label>
                <Textarea value={item.a} onChange={(e) => updateFaq(i, "a", e.target.value)}
                  placeholder="e.g. Most pieces ship within 3 weeks of order..."
                  className="rounded-xl bg-card border-border/50 text-sm tracking-wide min-h-[70px]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
        className="rounded-full px-5 py-5 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5">
        <Save className="w-3.5 h-3.5" />
        {saveMutation.isPending ? "saving..." : "save content"}
      </Button>
    </div>
  );
}