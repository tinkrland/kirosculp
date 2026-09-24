import { ArrowLeft, ArrowRight, Aperture, Box, CircleDotDashed } from "lucide-react";
import { Link } from "react-router-dom";
import SiteFooter from "@/components/home/SiteFooter";
import SeoTags from "@/components/seo/SeoTags";
import { studiogramGuides } from "@/features/studiogram/studiogramContent";

const studioPrinciples = [
  "the photographed artifact is the same modeled object prepared for manufacturing",
  "the hand, jewelry, camera, light, and environment remain separate parts of the scene",
  "saved scene choices make every captured view reproducible",
  "studiogram renders a configured 3d scene rather than imagining a product image",
];

export default function Studiogram() {
  return (
    <div className="min-h-screen">
      <SeoTags
        title="studiogram | sculptura"
        description="explore how sculptura's upcoming studiogram will place real modeled jewelry on a configurable hand and create repeatable product photography."
        canonical="https://sculptura.annecrypted.com/studiogram"
        keywords="studiogram, virtual jewelry studio, 3d jewelry photography, sculptura"
      />

      <main className="px-5 pb-20 pt-10 md:px-8 md:pt-14">
        <div className="mx-auto max-w-6xl">
          <Link to="/" className="mb-12 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> back
          </Link>

          <header className="grid gap-10 border-b border-border/70 pb-14 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 border border-border bg-card px-3 py-1.5 font-mono text-[11px] uppercase text-muted-foreground">
                <Aperture className="h-3.5 w-3.5" aria-hidden="true" />
                upcoming studio guide
              </div>
              <h1 className="max-w-4xl font-serif text-5xl font-light lowercase leading-none text-foreground md:text-7xl">studiogram</h1>
              <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-muted-foreground md:text-xl">photograph jewelry before it has been made. studiogram is sculptura's planned virtual product studio, built around the same 3d artifact that would be sent for manufacturing.</p>
            </div>
            <p className="max-w-sm border-l border-border pl-5 text-sm font-light leading-relaxed text-muted-foreground">these pages explain the intended experience. they do not launch or simulate the studio itself.</p>
          </header>

          <section className="py-14 md:py-20" aria-labelledby="journey-title">
            <div className="mb-9 grid gap-3 md:grid-cols-[12rem_1fr]">
              <p className="font-mono text-xs text-muted-foreground">the journey</p>
              <div>
              <h2 id="journey-title" className="font-serif text-3xl font-light lowercase text-foreground md:text-4xl">the complete studiogram guide</h2>
              <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-muted-foreground">start with the purpose and complete flow, then explore each part of the scene and what happens behind it.</p>
              </div>
            </div>

            <div className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
              {studiogramGuides.map((guide) => {
                const GuideIcon = guide.icon;
                return (
                  <Link key={guide.slug} to={`/studiogram/${guide.slug}`} className="group flex min-h-80 flex-col border-b border-r border-border bg-card p-6 transition-colors hover:bg-muted/40">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-xs text-muted-foreground">{guide.step}</span>
                      <GuideIcon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden="true" />
                    </div>
                    <div className="mt-auto">
                      <p className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">{guide.eyebrow}</p>
                      <h3 className="font-serif text-2xl font-light lowercase text-foreground">{guide.title}</h3>
                      <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">{guide.summary}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-xs text-foreground">read this guide <ArrowRight className="h-3.5 w-3.5" /></span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="grid gap-8 border-y border-border py-12 md:grid-cols-[12rem_1fr] md:py-16" aria-labelledby="why-title">
            <p className="font-mono text-xs text-muted-foreground">why it exists</p>
            <div className="max-w-3xl">
              <h2 id="why-title" className="font-serif text-3xl font-light lowercase text-foreground md:text-4xl">the product can be seen before it exists physically</h2>
              <p className="mt-5 text-base font-light leading-relaxed text-muted-foreground">made-to-order jewelry may be ready to size, validate, and list before a physical sample has been cast. studiogram closes that photography gap by showing the actual modeled piece in a controlled scene. creators can prepare product images without a physical hand model, sample, camera, or separate rendering workflow.</p>
            </div>
          </section>

          <section className="grid gap-8 py-14 md:grid-cols-[12rem_1fr] md:py-20" aria-labelledby="principles-title">
            <div className="flex items-start gap-2 font-mono text-xs text-muted-foreground"><Box className="h-4 w-4" /> the foundation</div>
            <div>
              <h2 id="principles-title" className="font-serif text-3xl font-light lowercase text-foreground md:text-4xl">what remains true throughout</h2>
              <ul className="mt-7 grid gap-4 sm:grid-cols-2">
                {studioPrinciples.map((principle) => (
                  <li key={principle} className="flex gap-3 border-t border-border pt-4 text-sm font-light leading-relaxed text-foreground/80">
                    <CircleDotDashed className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    {principle}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
