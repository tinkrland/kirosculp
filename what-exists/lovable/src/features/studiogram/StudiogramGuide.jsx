import { ArrowLeft, ArrowRight, CircleDotDashed } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import SiteFooter from "@/components/home/SiteFooter";
import SeoTags from "@/components/seo/SeoTags";
import { getStudiogramGuide, studiogramGuides } from "./studiogramContent";

export default function StudiogramGuide() {
  const { pageName } = useParams();
  const guide = getStudiogramGuide(pageName);

  if (!guide) return <Navigate to="/studiogram" replace />;

  const guideIndex = studiogramGuides.findIndex((item) => item.slug === guide.slug);
  const nextGuide = studiogramGuides[guideIndex + 1];
  const GuideIcon = guide.icon;

  return (
    <div className="min-h-screen">
      <SeoTags
        title={`${guide.title} | studiogram`}
        description={`${guide.summary} learn how this upcoming part of sculptura's studiogram is planned to work.`}
        canonical={`https://sculptura.annecrypted.com/studiogram/${guide.slug}`}
        keywords={`sculptura studiogram, virtual jewelry studio, ${guide.title}`}
      />

      <main className="px-5 pb-20 pt-10 md:px-8 md:pt-14">
        <div className="mx-auto max-w-5xl">
          <Link to="/studiogram" className="mb-12 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            all studiogram guides
          </Link>

          <header className="grid gap-8 border-b border-border/70 pb-12 md:grid-cols-[1fr_15rem] md:items-end">
            <div>
              <p className="mb-4 font-mono text-[11px] uppercase text-muted-foreground">step {guide.step} · {guide.eyebrow}</p>
              <h1 className="max-w-3xl font-serif text-4xl font-light lowercase leading-tight text-foreground md:text-6xl">{guide.title}</h1>
              <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-muted-foreground md:text-lg">{guide.introduction}</p>
            </div>
            <div className="flex aspect-square items-center justify-center border border-border bg-card">
              <GuideIcon className="h-16 w-16 stroke-1 text-foreground" aria-hidden="true" />
            </div>
          </header>

          <div className="divide-y divide-border/70">
            {guide.sections.map((section, sectionIndex) => (
              <section key={section.title} className="grid gap-6 py-10 md:grid-cols-[10rem_1fr] md:py-14">
                <p className="font-mono text-xs text-muted-foreground">{guide.step}.{sectionIndex + 1}</p>
                <div className="max-w-2xl">
                  <h2 className="font-serif text-2xl font-light lowercase text-foreground md:text-3xl">{section.title}</h2>
                  <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground md:text-base">{section.body}</p>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                    {section.points.map((point) => (
                      <li key={point} className="flex gap-2 border-t border-border pt-3 text-xs leading-relaxed text-foreground/80">
                        <CircleDotDashed className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>

          <aside className="border border-border bg-muted/30 p-6 md:p-8">
            <p className="font-mono text-[11px] uppercase text-muted-foreground">what this is</p>
            <p className="mt-3 max-w-2xl font-serif text-xl font-light leading-relaxed text-foreground md:text-2xl">this page explains the planned studiogram experience. the studio itself is not available yet.</p>
          </aside>

          <nav className="mt-10 flex flex-wrap items-center justify-between gap-4" aria-label="studiogram guide navigation">
            <Link to="/studiogram" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> overview
            </Link>
            {nextGuide ? (
              <Link to={`/studiogram/${nextGuide.slug}`} className="inline-flex items-center gap-2 text-sm text-foreground">
                next: {nextGuide.title} <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link to="/creator-docs" className="inline-flex items-center gap-2 text-sm text-foreground">
                creator docs <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </nav>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
