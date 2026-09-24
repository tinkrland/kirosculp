// /about. fleshes out the marketing surface with real product narrative
// (mission, how it works in plain english, the manufacturing reality, who
// it's for) instead of the previous "coming soon" placeholder.

import { Link } from "react-router-dom";
import { ArrowLeft, Hammer, Globe, Users, Sparkles, ArrowRight } from "lucide-react";
import SiteFooter from "../components/home/SiteFooter";

const PILLARS = [
  {
    icon: Hammer,
    title: "real metal, not props",
    body: "every artifact is cast in solid silver, brass, bronze, or gold using lost wax casting from a 3d printed wax pattern. the same technique used by goldsmiths for thousands of years.",
  },
  {
    icon: Globe,
    title: "designers anywhere, manufacturing anywhere",
    body: "you upload a cad file from any country. we route the order to a manufacturing partner near the buyer to keep cost, speed, and carbon down.",
  },
  {
    icon: Users,
    title: "a marketplace, not a print shop",
    body: "every designer gets a storefront, collections, commissions, a follower base, and a payout wallet. you build an audience, not just a checkout url.",
  },
  {
    icon: Sparkles,
    title: "objects that didn't exist before",
    body: "sculptura is built so weird, specific, beautiful pieces can find the small audiences who want them, instead of dying in a folder on someone's desktop.",
  },
];

const TIMELINE = [
  { phase: "now", body: "demo mode with stripe sandbox checkout. creators can publish, run a store, take commissions, and accept orders end to end." },
  { phase: "next", body: "live manufacturing partners wired up to the routing engine. real payouts. real shipping. real metal in real mailboxes." },
  { phase: "later", body: "per-region partner network, bring-your-own-stone fulfilment, designer collaborations, physical pop-ups." },
];

export default function About() {
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

          {/* hero */}
          <div className="mb-12">
            <p className="text-[11px] tracking-widest font-mono text-muted-foreground/50 uppercase mb-3">
              about sculptura
            </p>
            <h1 className="font-serif text-3xl md:text-5xl font-light tracking-tight lowercase text-foreground mb-4">
              cad designers should be able to sell physical metal.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground tracking-wide font-light leading-relaxed">
              there are millions of independent jewelry and product designers making
              beautiful things in cad. almost none of them have a path to selling
              those designs as real, finished, wearable metal pieces. sculptura is
              the platform that closes that gap.
            </p>
          </div>

          {/* mission */}
          <div className="bg-card rounded-[20px] border border-border/50 shadow-paper px-7 py-8 space-y-5 mb-12">
            <p className="text-[10px] tracking-widest font-mono text-muted-foreground/50 uppercase">
              the mission
            </p>
            <p className="text-sm text-muted-foreground font-light leading-relaxed tracking-wide">
              sculptura is a marketplace for cad-designed metal artifacts. designers
              publish their work, buyers order it, and we handle everything between
              the file and the finished piece on someone's hand. that means
              casting, finishing, quality control, packaging, shipping, payments,
              and support. the designer keeps doing what they love. we do the rest.
            </p>
            <p className="text-sm text-muted-foreground font-light leading-relaxed tracking-wide">
              if you've ever made something in cad and thought "i wish i could just
              sell this without becoming a jeweler, a fulfilment company, and a
              customer support agent at the same time", this is for you.
            </p>
            <Link to="/compare" className="inline-flex items-center gap-1 text-xs tracking-wider lowercase text-foreground hover:opacity-70 transition-opacity">
              how this compares to other platforms <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* pillars */}
          <div className="mb-12">
            <h2 className="font-serif text-2xl font-light lowercase tracking-tight text-foreground mb-6">
              what we believe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="bg-card border border-border/50 rounded-[20px] p-6">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center mb-4">
                      <Icon className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="font-serif text-base lowercase mb-1.5">{p.title}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* manufacturing */}
          <div className="bg-card rounded-[20px] border border-border/50 px-7 py-8 mb-12">
            <p className="text-[10px] tracking-widest font-mono text-muted-foreground/50 uppercase mb-3">
              how things actually get made
            </p>
            <h2 className="font-serif text-xl font-light lowercase tracking-tight text-foreground mb-4">
              lost wax casting, modernised
            </h2>
            <ol className="space-y-3 text-sm text-muted-foreground font-light leading-relaxed tracking-wide list-decimal list-inside">
              <li>creator uploads a cad file (stl, step, obj).</li>
              <li>we 3d print a pattern in castable wax or castable resin.</li>
              <li>the pattern is invested in plaster, then burned out in a kiln.</li>
              <li>molten metal is poured into the resulting cavity.</li>
              <li>the cast is broken out, sprues cut, surface filed and polished.</li>
              <li>quality check, packaging, ships worldwide.</li>
            </ol>
            <p className="text-xs text-muted-foreground/70 mt-5 leading-relaxed">
              for larger sculptural pieces we use sand casting from the same 3d
              printed pattern. lower cost on big pours, slightly less detail.
            </p>
          </div>

          {/* timeline */}
          <div className="mb-12">
            <h2 className="font-serif text-2xl font-light lowercase tracking-tight text-foreground mb-6">
              where we are
            </h2>
            <div className="space-y-4">
              {TIMELINE.map((t) => (
                <div key={t.phase} className="flex gap-5 bg-card border border-border/50 rounded-[16px] p-5">
                  <div className="text-[10px] tracking-widest font-mono text-muted-foreground/60 uppercase w-16 shrink-0 pt-0.5">
                    {t.phase}
                  </div>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed tracking-wide">
                    {t.body}
                  </p>
                </div>
              ))}
            </div>
            <Link to="/roadmap" className="inline-flex items-center gap-1 text-xs tracking-wider lowercase text-foreground hover:opacity-70 transition-opacity mt-4">
              full roadmap <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* cta */}
          <div className="flex flex-wrap gap-3">
            <Link to="/store/create" className="px-6 py-3 rounded-full bg-foreground text-background text-xs tracking-wider lowercase hover:opacity-90 transition-opacity">
              open a store
            </Link>
            <Link to="/explore" className="px-6 py-3 rounded-full border border-border/60 text-foreground text-xs tracking-wider lowercase hover:border-foreground/40 transition-colors">
              browse artifacts
            </Link>
            <Link to="/creator-docs" className="px-6 py-3 rounded-full text-muted-foreground text-xs tracking-wider lowercase hover:text-foreground transition-colors">
              creator docs
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
