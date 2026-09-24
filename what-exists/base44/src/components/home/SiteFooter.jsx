import { useState } from "react";
import { Link } from "react-router-dom";

const links = {
  explore: [
    { label: "browse artifacts", to: "/explore" },
    { label: "browse stores", to: "/explore?tab=stores" },
    { label: "faq", to: "/faq" },
  ],
  creators: [
    { label: "open a store", to: "/store/create" },
    { label: "access dashboard", to: "/store/access" },
    { label: "pricing model", to: "/faq#pricing" },
  ],
  company: [
    { label: "how it works", to: "/#how-it-works" },
    { label: "roadmap", to: "/roadmap" },
    { label: "for designers", to: "/#for-who" },
  ],
};

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <footer className="border-t border-border/60 px-6 pt-14 pb-10" style={{ background: "hsl(224 14% 10%)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-10 mb-12">
          {/* Brand + newsletter */}
          <div className="space-y-5 max-w-xs">
            <Link to="/">
              <span className="font-wordmark text-2xl text-white/90 tracking-wide">sculptura</span>
              <span className="font-wordmark text-sm text-white/30">.shop</span>
            </Link>
            <p className="text-xs text-white/40 tracking-wide font-light leading-relaxed">
              a marketplace for cad designers to publish metal artifacts, and for collectors to discover objects that don't exist anywhere else.
            </p>

            {/* Newsletter */}
            <div className="space-y-2 pt-1">
              <p className="text-[10px] tracking-widest font-mono text-white/30 uppercase">stay in the loop</p>
              {submitted ? (
                <p className="text-xs text-white/50 tracking-wide font-light">you're on the list. we'll be in touch.</p>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 placeholder:text-white/20 tracking-wide focus:outline-none focus:border-white/20"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white/60 tracking-wider border border-white/10 transition-colors whitespace-nowrap"
                  >
                    subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-4">
            <p className="text-[10px] tracking-widest font-mono text-white/30 uppercase">explore</p>
            <ul className="space-y-2.5">
              {links.explore.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-xs tracking-wide text-white/50 hover:text-white/90 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Creators */}
          <div className="space-y-4">
            <p className="text-[10px] tracking-widest font-mono text-white/30 uppercase">creators</p>
            <ul className="space-y-2.5">
              {links.creators.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-xs tracking-wide text-white/50 hover:text-white/90 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <p className="text-[10px] tracking-widest font-mono text-white/30 uppercase">company</p>
            <ul className="space-y-2.5">
              {links.company.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-xs tracking-wide text-white/50 hover:text-white/90 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] tracking-wider font-mono text-white/25">from cad to metal</p>
          <p className="text-[11px] tracking-wider font-mono text-white/20">sculptura.shop</p>
        </div>
      </div>
    </footer>
  );
}