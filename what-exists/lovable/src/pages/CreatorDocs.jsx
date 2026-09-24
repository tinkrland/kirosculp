import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Compass,
  Ruler,
  Camera,
  Tags,
  Megaphone,
  Package,
  TrendingUp,
  Scale,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import SiteFooter from "../components/home/SiteFooter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// consolidated sections: similar topics clubbed together so the page reads
// as a tighter outline rather than a long shopping list of cards.
const sections = [
  {
    icon: Compass,
    title: "getting started",
    items: [
      "what sculptura is, who it's for, and how the pilot works",
      "a tour of your dashboard and the lifecycle of an artifact",
      "checklist for opening a store that feels finished on day one",
    ],
  },
  {
    icon: Ruler,
    title: "designing, templates, and stone setting",
    items: [
      "minimum wall thickness, undercut limits, and tolerances supported by our pilot manufacturer",
      "what the lost-wax pipeline can and cannot reproduce in fine detail",
      "size systems we support today (rings, bracelets, free-size pieces) and what's coming next",
      "starter cad files for rings, pendants, brooches, and earrings",
      "patterns that print and cast cleanly, patterns that fight you",
      "finishing notes: polished, brushed, oxidised, and what each one costs in time",
      "designing pieces where stones can be set later by local jewellers",
      "bezels, prongs, and channels that support post-cast stone setting",
    ],
  },
  {
    icon: Camera,
    title: "photography and presentation",
    items: [
      "lighting setups that work with a phone and one window",
      "how to render cad mockups that don't look like cad mockups",
      "writing artifact descriptions that tell a story without overselling",
    ],
  },
  {
    icon: Tags,
    title: "pricing your work",
    items: [
      "how material cost, surcharges, and your margin stack up",
      "pricing by weight vs. pricing by design effort",
      "when to use size surcharges and how to think about ring upsizing",
      "discounting strategy and when coupons help (or hurt)",
    ],
  },
  {
    icon: Megaphone,
    title: "marketing, storefront, and analytics",
    items: [
      "naming and positioning that distinguishes you from other creators",
      "customising your store banner, accent colours, icon, and layout",
      "using the built-in newsletter, tip jar, and waitlist banners",
      "choosing a public handle and what the permanent slug means for your links",
      "off-platform: instagram, pinterest, and craft fairs",
      "adding your own analytics id to your profile to see traffic sources",
      "tracked links to measure which posts and campaigns actually convert",
    ],
  },
  {
    icon: Package,
    title: "fulfillment and commissions",
    items: [
      "what happens between a confirmed order and a finished piece",
      "lead times: what to promise, what to under-promise",
      "creating commission documentation: what you offer, what you do not",
      "writing commission terms that protect you and set clear expectations",
      "pricing custom work, revision limits, and deposit structures",
    ],
  },
  {
    icon: TrendingUp,
    title: "talking to collectors and growing over time",
    items: [
      "responding to enquiries, especially around custom work",
      "setting expectations on timeline and finish",
      "handling refunds, remakes, and edge cases gracefully",
      "reading your analytics: views, conversion, repeat buyers",
      "building a body of work vs. one-off experiments",
      "creator tiers, seo weighting, and how rank works on sculptura",
    ],
  },
  {
    icon: Scale,
    title: "policy, ip, and trust",
    items: [
      "what you can and can't publish",
      "originality, references, and protecting your designs",
      "platform fees, payouts, and how disputes are handled",
    ],
  },
];

const categories = [
  "design and casting",
  "pricing",
  "photography",
  "marketing and storefront",
  "commissions",
  "policy and trust",
  "something else",
];

export default function CreatorDocs() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: "",
    subject: "",
    message: "",
    email: "",
  });

  const resetForm = () =>
    setForm({ category: "", subject: "", message: "", email: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) {
      toast({
        title: "add a note",
        description: "the note can't be empty.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("creator_docs_notes").insert({
      category: form.category || null,
      subject: form.subject.trim() || null,
      message: form.message.trim(),
      email: form.email.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({
        title: "couldn't send your note",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "note sent",
      description: "thanks, we read every one of these.",
    });
    resetForm();
    setOpen(false);
  };

  return (
    <div>
      <div className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 tracking-wide transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            back
          </Link>

          <div className="mb-10">
            <p className="text-[10px] tracking-widest font-mono uppercase mb-3 text-muted-foreground/50">
              coming soon
            </p>
            <h1 className="font-serif text-2xl md:text-4xl font-light tracking-tight lowercase text-foreground mb-3">
              creator docs
            </h1>
            <p className="text-sm text-muted-foreground tracking-wide font-light leading-relaxed max-w-2xl">
              a full handbook for designers building a shop on sculptura. the docs are being written as we run the pilot, so the structure below is what to expect when it goes live. nothing here is locked in yet, and we will keep adding to it as creators tell us what they need.
            </p>
          </div>

          <div className="bg-card rounded-[20px] border border-border/50 shadow-paper px-7 py-6 mb-10 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-light tracking-tight lowercase text-foreground mb-2">
                why this exists
              </h2>
              <p className="text-sm text-muted-foreground font-light tracking-wide leading-relaxed">
                most creators we have spoken to are excellent designers and reluctant marketers. the goal of these docs is to take everything we learn from running the platform - what casts well, what sells well, what listings convert, what photos work - and put it in one place so you do not have to figure it out alone.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.title}
                  className="bg-card rounded-[20px] border border-border/50 shadow-paper px-6 py-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-serif text-base font-light tracking-tight lowercase text-foreground">
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-2 pl-1">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="text-sm text-muted-foreground font-light tracking-wide leading-relaxed flex gap-2"
                      >
                        <span className="text-muted-foreground/40 mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="bg-card rounded-[20px] border border-border/50 shadow-paper px-7 py-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-light tracking-tight lowercase text-foreground mb-2">
                in the meantime
              </h2>
              <p className="text-sm text-muted-foreground font-light tracking-wide leading-relaxed mb-3">
                if you are designing a piece right now and want to know whether it will cast cleanly, send a note. the same goes for pricing, photography, or anything else where you would normally check a docs page. leaving an email is optional, anonymous notes are welcome too.
              </p>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 text-xs tracking-wider text-foreground border border-border/60 px-4 py-2 rounded-full hover:bg-secondary transition-colors"
              >
                send a note
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif font-light tracking-tight lowercase">
              send a note
            </DialogTitle>
            <DialogDescription className="text-xs tracking-wide">
              tell us what you're stuck on, what you wish existed, or what you'd like the docs to cover. email is optional.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs tracking-wide lowercase text-muted-foreground">
                category (optional)
              </Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-wide lowercase text-muted-foreground">
                subject (optional)
              </Label>
              <Input
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                maxLength={200}
                placeholder="a one-line summary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-wide lowercase text-muted-foreground">
                your note
              </Label>
              <Textarea
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                maxLength={4000}
                rows={5}
                placeholder="what would you like to tell us?"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-wide lowercase text-muted-foreground">
                email (optional, leave blank to stay anonymous)
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                maxLength={320}
                placeholder="you@example.com"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs tracking-wider px-4 py-2 rounded-full border border-border/60 hover:bg-secondary transition-colors"
              >
                cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="text-xs tracking-wider px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? "sending..." : "send note"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
}
