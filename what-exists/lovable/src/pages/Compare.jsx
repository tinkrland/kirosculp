// /compare. answers the "what is this?" question with a one-liner
// (redbubble for jewelry designers) and then proves it with a tabular
// comparison against platforms people already know.
//
// designed to be skimmable: hero one-liner, mental-model row of cards,
// then a wide feature matrix so a visitor can locate sculptura against
// what they already use.

import { Link } from "react-router-dom";
import { ArrowLeft, Check, X, Minus, Sparkles, Hammer, Palette, Coins } from "lucide-react";
import SiteFooter from "../components/home/SiteFooter";

const PLATFORMS = [
  { key: "sculptura", name: "sculptura", tag: "you are here" },
  { key: "redbubble", name: "redbubble", tag: "print on demand" },
  { key: "etsy", name: "etsy", tag: "handmade marketplace" },
  { key: "shapeways", name: "shapeways", tag: "3d print bureau" },
  { key: "shopify", name: "diy shopify store", tag: "build it yourself" },
];

// y = yes, n = no, p = partial
const ROWS = [
  {
    label: "designer ships nothing themselves",
    cells: { sculptura: "y", redbubble: "y", etsy: "n", shapeways: "y", shopify: "n" },
  },
  {
    label: "made in real metal (silver, brass, gold, bronze)",
    cells: { sculptura: "y", redbubble: "n", etsy: "y", shapeways: "p", shopify: "p" },
  },
  {
    label: "lost wax casting from cad",
    cells: { sculptura: "y", redbubble: "n", etsy: "n", shapeways: "p", shopify: "n" },
  },
  {
    label: "no inventory, made on demand",
    cells: { sculptura: "y", redbubble: "y", etsy: "n", shapeways: "y", shopify: "n" },
  },
  {
    label: "designer keeps their brand and store page",
    cells: { sculptura: "y", redbubble: "p", etsy: "y", shapeways: "p", shopify: "y" },
  },
  {
    label: "global manufacturing routing",
    cells: { sculptura: "y", redbubble: "y", etsy: "n", shapeways: "y", shopify: "n" },
  },
  {
    label: "commission requests built in",
    cells: { sculptura: "y", redbubble: "n", etsy: "p", shapeways: "n", shopify: "n" },
  },
  {
    label: "bring-your-own-stone setting workflow",
    cells: { sculptura: "y", redbubble: "n", etsy: "p", shapeways: "n", shopify: "n" },
  },
  {
    label: "built for jewelry / wearable metal",
    cells: { sculptura: "y", redbubble: "n", etsy: "p", shapeways: "p", shopify: "p" },
  },
  {
    label: "you have to source a manufacturer yourself",
    cells: { sculptura: "n", redbubble: "n", etsy: "y", shapeways: "n", shopify: "y" },
  },
];

const cellIcon = {
  y: <Check className="w-4 h-4 text-foreground" />,
  n: <X className="w-4 h-4 text-muted-foreground/40" />,
  p: <Minus className="w-4 h-4 text-muted-foreground/60" />,
};

function MentalModelCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-card border border-border/50 rounded-[20px] p-6">
      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center mb-4">
        <Icon className="w-4 h-4 text-foreground" />
      </div>
      <div className="font-serif text-lg lowercase mb-1.5">{title}</div>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

export default function Compare() {
  return (
    <div>
      <div className="px-6 py-10">
        <div className="max-w-6xl mx-auto">
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
              what is this, in one line
            </p>
            <h1 className="font-serif text-3xl md:text-5xl font-light tracking-tight lowercase text-foreground mb-4">
              redbubble, but for jewelry designers
            </h1>
            <p className="text-base md:text-lg text-muted-foreground tracking-wide font-light leading-relaxed max-w-3xl">
              you upload a cad file. we cast it in real metal when someone buys it.
              we route the order to a manufacturing partner, ship the finished piece,
              and pay you. you do not touch wax, plaster, kilns, or shipping labels.
            </p>
          </div>

          {/* mental model */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            <MentalModelCard
              icon={Palette}
              title="you design"
              description="cad model in your tool of choice. ring, pendant, bracelet, sculptural object. you own the design."
            />
            <MentalModelCard
              icon={Hammer}
              title="we manufacture"
              description="lost wax casting from a 3d printed wax pattern. silver, brass, bronze, gold. your file becomes a real object."
            />
            <MentalModelCard
              icon={Coins}
              title="you get paid"
              description="we handle checkout, production, shipping, and support. your share lands in your wallet on every sale."
            />
          </div>

          {/* comparison table */}
          <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-light tracking-tight lowercase text-foreground">
                how we compare
              </h2>
              <p className="text-sm text-muted-foreground tracking-wide mt-1">
                where sculptura sits next to platforms you already know
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] tracking-wider text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> yes</span>
              <span className="inline-flex items-center gap-1.5"><Minus className="w-3.5 h-3.5" /> partial</span>
              <span className="inline-flex items-center gap-1.5"><X className="w-3.5 h-3.5" /> no</span>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-[20px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/40 bg-secondary/30">
                    <th className="px-5 py-4 text-[10px] tracking-widest font-mono text-muted-foreground uppercase">
                      capability
                    </th>
                    {PLATFORMS.map((p) => (
                      <th
                        key={p.key}
                        className={`px-4 py-4 text-center min-w-[120px] ${
                          p.key === "sculptura" ? "bg-foreground/5" : ""
                        }`}
                      >
                        <div className="text-xs lowercase font-medium tracking-wide text-foreground">
                          {p.name}
                          {p.key === "sculptura" && (
                            <Sparkles className="inline-block w-3 h-3 ml-1 -mt-0.5" />
                          )}
                        </div>
                        <div className="text-[9px] tracking-widest font-mono text-muted-foreground/50 uppercase mt-1">
                          {p.tag}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, i) => (
                    <tr key={i} className="border-b border-border/30 last:border-0">
                      <td className="px-5 py-4 text-xs tracking-wide text-foreground/90 lowercase">
                        {row.label}
                      </td>
                      {PLATFORMS.map((p) => (
                        <td
                          key={p.key}
                          className={`px-4 py-4 text-center ${
                            p.key === "sculptura" ? "bg-foreground/5" : ""
                          }`}
                        >
                          <div className="inline-flex">{cellIcon[row.cells[p.key]]}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* the analogy explained */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
            <div className="bg-card border border-border/50 rounded-[20px] p-6">
              <p className="text-[10px] tracking-widest font-mono text-muted-foreground/50 uppercase mb-2">
                the redbubble analogy
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                redbubble lets illustrators upload artwork and sell it printed on
                t-shirts, mugs, and posters without ever touching a printer.
                sculptura does the same thing for cad designers and wearable metal.
                upload the file once, sell it forever, never ship a box.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-[20px] p-6">
              <p className="text-[10px] tracking-widest font-mono text-muted-foreground/50 uppercase mb-2">
                why this is not shapeways
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                shapeways is a 3d print bureau. you upload a file and they print
                it directly in metal or plastic. we cast in real metal using lost
                wax, which gives jewelry-grade finish, real precious metals, and
                much lower per-unit cost at the volumes indie designers actually sell.
                we are also a marketplace, not a print shop, so designers get a
                storefront and discovery, not just a checkout url.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link
              to="/store/create"
              className="px-6 py-3 rounded-full bg-foreground text-background text-xs tracking-wider lowercase hover:opacity-90 transition-opacity"
            >
              open a store
            </Link>
            <Link
              to="/explore"
              className="px-6 py-3 rounded-full border border-border/60 text-foreground text-xs tracking-wider lowercase hover:border-foreground/40 transition-colors"
            >
              browse artifacts
            </Link>
            <Link
              to="/about"
              className="px-6 py-3 rounded-full text-muted-foreground text-xs tracking-wider lowercase hover:text-foreground transition-colors"
            >
              about sculptura
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
