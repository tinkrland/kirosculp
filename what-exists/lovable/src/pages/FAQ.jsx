import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SiteFooter from "../components/home/SiteFooter";

const faqSections = [
  {
    id: "general",
    label: "general",
    items: [
      {
        q: "what is sculptura?",
        a: "sculptura is a marketplace where cad designers publish their 3d designs as purchasable metal artifacts. buyers order them and sculptura routes production to a manufacturing partner, shipping the finished piece worldwide.",
      },
      {
        q: "what materials are available?",
        a: "currently silver, brass, and gold are available. material availability may vary by region and is set per artifact by the creator.",
      },
      {
        q: "are pieces made to order?",
        a: "yes. most artifacts on sculptura are made to order. your piece is manufactured after you place the request, which keeps quality high and waste low.",
      },
      {
        q: "how long does production take?",
        a: "production time depends on the artifact, material, and your region. most pieces take 2 to 4 weeks from order to delivery. individual creator pages show estimated turnaround times.",
      },
    ],
  },
  {
    id: "buyers",
    label: "buyers",
    items: [
      {
        q: "do i need an account to order?",
        a: "no. you can browse and order without creating an account. creating a buyer account is optional and lets you track orders and save favourites.",
      },
      {
        q: "what is the commissioner tier?",
        a: "commissioner is an optional upgrade for buyers who want to work more closely with creators. it unlocks direct commission requests, priority response, and early access to new drops.",
      },
      {
        q: "how do commissions work?",
        a: "if a creator has commissions open, you can send them a brief describing the piece you have in mind. the creator will respond with a quote and timeline. payment is handled through sculptura.",
      },
      {
        q: "can i return or cancel an order?",
        a: "because pieces are made to order, cancellations are only possible within 24 hours of placing an order. returns are accepted for manufacturing defects.",
      },
      {
        q: "which countries do you ship to?",
        a: "sculptura ships globally. delivery times and exact costs vary by destination and are shown at checkout.",
      },
    ],
  },
  {
    id: "stores",
    label: "for stores",
    items: [
      {
        q: "how do i open a store?",
        a: "go to the create account page, choose a handle, and generate your access key. your store starts in draft. when you're ready, submit it for review and sculptura will approve it manually.",
      },
      {
        q: "how does the access key work?",
        a: "sculptura uses a key-based system instead of passwords. when you create your account, you receive a one-time access key. save it somewhere safe, as it is the only way to log into your dashboard.",
      },
      {
        q: "how much do i earn per sale?",
        a: "you set your own earnings per artifact when you publish. the final buyer price is your earnings plus the manufacturing cost for that material and region. sculptura does not take a commission cut on top of that.",
      },
      {
        q: "how are payouts handled?",
        a: "earnings accumulate in your sculptura balance. you can request a payout to your bank at any time from the finance section of your dashboard.",
      },
      {
        q: "what file formats can i upload?",
        a: "sculptura supports .glb, .gltf, and .stl files for 3d models, plus standard image formats for render previews.",
      },
      {
        q: "what is the manual review process?",
        a: "every store goes through a one-time manual review before going live. sculptura checks that the account is genuine and that initial artifacts meet quality standards. review typically takes 1 to 3 business days.",
      },
    ],
  },
  {
    id: "pricing",
    label: "pricing",
    items: [
      {
        q: "how is the final artifact price calculated?",
        a: "final price equals manufacturing cost plus creator earnings. manufacturing cost covers production and shipping, set by sculptura based on material and region. creators set their own earnings on top.",
      },
      {
        q: "does sculptura charge a platform fee?",
        a: "sculptura builds its margin into the manufacturing cost. there is no additional fee on top of the creator's earnings.",
      },
      {
        q: "can a creator change their earnings after publishing?",
        a: "yes. creators can update their earnings on existing artifacts at any time. changes take effect on new orders only.",
      },
      {
        q: "why are prices different for similar items?",
        a: "pricing is set by creators and reflects design complexity, material choice, production cost, and their own margin.",
      },
      {
        q: "when am i charged?",
        a: "you are charged at checkout. your order is then produced and shipped.",
      },
      {
        q: "where does my payment go?",
        a: "payments are processed securely, and funds are released to creators after orders are completed.",
      },
    ],
  },
  {
    id: "packaging",
    label: "packaging & shipping",
    items: [
      {
        q: "will my order come in sculptura packaging?",
        a: "not always. orders are fulfilled through trusted manufacturing partners, so packaging may vary depending on how your item is produced and shipped.",
      },
      {
        q: "will the packaging have another company's branding?",
        a: "in some cases, yes. we are working toward more neutral packaging over time, but during early stages, items may arrive in packaging from our production partners.",
      },
      {
        q: "where does my order ship from?",
        a: "your order is produced and shipped by one of our manufacturing partners, which may be located in a different region than you.",
      },
      {
        q: "why does packaging vary?",
        a: "each artifact is made on demand using different materials and processes. because of this, fulfillment can involve different partners with slightly different packaging systems.",
      },
      {
        q: "will this change in the future?",
        a: "yes. as sculptura grows, we plan to standardize packaging, offer more neutral branding, and explore creator-branded packaging options.",
      },
    ],
  },
  {
    id: "production",
    label: "how products are made",
    items: [
      {
        q: "are these mass-produced?",
        a: "no. each item is made on demand from a digital design, using processes like metal casting or 3d-based fabrication.",
      },
      {
        q: "who makes the products?",
        a: "sculptura works with specialized manufacturing partners to produce each item. creators design the artifacts, and we handle the production process.",
      },
      {
        q: "can i trust the quality?",
        a: "all designs go through a review process before being published to ensure they are manufacturable and meet basic quality standards.",
      },
      {
        q: "how long does it take?",
        a: "production times vary depending on the design and material, but most orders take 1 to 3 weeks including production and shipping.",
      },
      {
        q: "can i get faster shipping?",
        a: "expedited options may be available depending on the item and creator, but not all artifacts support rush production.",
      },
    ],
  },
  {
    id: "creators",
    label: "creators & stores",
    items: [
      {
        q: "who am i buying from?",
        a: "each item is designed by an independent creator. sculptura provides the infrastructure for production, payments, and delivery.",
      },
      {
        q: "can i contact a creator?",
        a: "yes. you can message creators directly from their profile to ask questions or request custom work. feature availability may vary.",
      },
      {
        q: "can creators make custom pieces?",
        a: "many creators accept custom requests. check their profile for availability, pricing style, and turnaround time.",
      },
    ],
  },
  {
    id: "returns",
    label: "returns & issues",
    items: [
      {
        q: "can i return my item?",
        a: "because items are made on demand, returns are limited. however, if something arrives damaged or incorrect, we will make it right.",
      },
      {
        q: "what if something goes wrong?",
        a: "reach out through the platform and we will help resolve the issue.",
      },
    ],
  },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-sm tracking-wide text-foreground font-light">{item.q}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground/50 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground font-light leading-relaxed tracking-wide pb-4 pr-6">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  // all sections render in a single flow. the chip row at the top is purely
  // a quick-jump filter: clicking a chip scrolls to that section and marks
  // it active. active state is also driven by scroll position so the chip
  // row stays in sync as the user reads.
  const [activeSection, setActiveSection] = useState(faqSections[0].id);
  const sectionRefs = useRef({});

  const jumpToSection = (id) => {
    setActiveSection(id);
    const el = sectionRefs.current[id];
    if (!el) return;
    // offset accounts for the sticky header height
    const top = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: "smooth" });
  };

  useEffect(() => {
    const onScroll = () => {
      // pick the section whose top is closest to (but not past) the viewport offset
      const offset = 140;
      let current = faqSections[0].id;
      for (const s of faqSections) {
        const el = sectionRefs.current[s.id];
        if (!el) continue;
        if (el.getBoundingClientRect().top - offset <= 0) current = s.id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      <div className="px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 tracking-wide transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            back
          </Link>

          <div className="mb-8">
            <h1 className="font-serif text-2xl md:text-4xl font-light tracking-tight lowercase text-foreground mb-2">
              frequently asked questions
            </h1>
            <p className="text-sm text-muted-foreground tracking-wide font-light">
              everything you need to know about sculptura
            </p>
          </div>

          {/* sticky quick-jump chip row */}
          <div className="sticky top-[68px] z-30 -mx-6 px-6 py-3 mb-6 bg-background/85 backdrop-blur-md border-b border-border/40">
            <div className="flex flex-wrap gap-2">
              {faqSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => jumpToSection(s.id)}
                  className={`px-4 py-1.5 rounded-full text-xs tracking-wider lowercase border transition-all duration-200 ${
                    activeSection === s.id
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* all sections rendered in flow */}
          <div className="space-y-10">
            {faqSections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                ref={(el) => { sectionRefs.current[s.id] = el; }}
                // scroll-margin keeps anchored sections clear of the sticky chip row
                style={{ scrollMarginTop: "120px" }}
              >
                <h2 className="font-serif text-lg md:text-xl font-light tracking-tight lowercase text-foreground mb-3 px-1">
                  {s.label}
                </h2>
                <div className="bg-card rounded-[20px] border border-border/50 shadow-paper px-7 py-2">
                  {s.items.map((item) => (
                    <FAQItem key={item.q} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}