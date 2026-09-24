import { ArrowLeft, ArrowRight, Boxes, Camera, Gem, Hand, Layers, Lightbulb, Move3d, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import SiteFooter from "@/components/home/SiteFooter";
import SeoTags from "@/components/seo/SeoTags";

const studioSteps = [
  {
    number: "01",
    icon: Hand,
    title: "choose a hand",
    summary: "pick a configurable base hand rather than a photograph, then shape its proportions and appearance.",
    parameters: ["presentation", "skin tone", "hand proportions", "finger proportions", "nail appearance", "body hair"],
    footnote: "the controls modify one underlying hand model. save a configuration once and reuse it across product photography.",
  },
  {
    number: "02",
    icon: Gem,
    title: "add your jewelry",
    summary: "place your existing 3d designs on the hand, then arrange individual pieces into a complete composition.",
    parameters: ["move a piece", "choose its attachment", "change orientation", "reorder a stack", "remove a piece", "add another piece"],
    footnote: "each artifact remains its own 3d object, so the result is a real arrangement rather than a flattened composite.",
  },
  {
    number: "03",
    icon: Camera,
    title: "adjust the scene",
    summary: "configure the photography environment around the composed hand and jewelry.",
    parameters: ["camera position", "camera angle", "focal framing", "hand pose", "lighting", "backdrop"],
    footnote: "the same arrangement can be viewed from another angle without rebuilding the hand or jewelry.",
  },
  {
    number: "04",
    icon: Play,
    title: "make the hand move",
    summary: "change the underlying hand pose while attached jewelry continues to follow the correct geometry.",
    parameters: ["alternate views", "movement previews", "short animations", "gifs", "different hand positions"],
    footnote: "the jewelry remains the creator's actual modeled object throughout the process.",
  },
];

const thingsYouDoNotNeed = [
  "a physical hand model",
  "a camera",
  "a photography studio",
  "physical samples of every design",
  "a separate 3d rendering workflow",
];

const technicalNotes = [
  { icon: Boxes, title: "parameterized base mesh", body: "the hand is one parameterized mesh with separate shape and surface controls, not a library of unrelated people." },
  { icon: Move3d, title: "attachment coordinate spaces", body: "jewelry placement follows a named hand or finger location, which keeps a ring attached when the finger bends." },
  { icon: Layers, title: "posing acts on the rig", body: "posing deforms the hand model. jewelry transforms follow the attachment reference instead of being repainted." },
  { icon: Lightbulb, title: "rendering is the last step", body: "the final image is rendered only after the artifact, hand, pose, camera, lighting, and environment are configured." },
];

const sceneGraph = `scene
├── hand model
│   ├── morphology parameters
│   ├── surface parameters
│   └── pose state
├── jewelry objects
│   ├── geometry
│   ├── transforms
│   └── attachment state
├── camera
├── lighting
└── environment`;

export default function ProductStudio() {
  return (
    <div className="min-h-screen">
      <SeoTags
        title="product studio | sculptura"
        description="learn how sculptura's planned 3d product studio turns real jewelry geometry into controlled, repeatable product photography."
        canonical="https://sculptura.annecrypted.com/productstudio"
        keywords="jewelry product photography, 3d jewelry rendering, virtual hand model, sculptura studio"
      />

      <main className="px-6 pb-16 pt-10">
        <div className="mx-auto max-w-5xl">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> back
          </Link>

          <header className="mb-12">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 font-mono text-[11px] uppercase text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> virtual studio
            </span>
            <h1 className="mb-4 max-w-3xl font-serif text-3xl font-light lowercase text-foreground md:text-5xl">photograph jewelry you have not made yet</h1>
            <p className="max-w-2xl text-base font-light leading-relaxed text-muted-foreground md:text-lg">the product studio lets you present designs without physically owning or photographing a model. think of it like a digital dollhouse for product photography, built from real 3d objects.</p>
          </header>

          <Link to="/studiogram" className="group mb-16 grid gap-5 border border-border bg-card p-6 transition-colors hover:bg-muted/40 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase text-muted-foreground">explore the complete guide</p>
              <h2 className="font-serif text-2xl font-light text-foreground md:text-3xl">open studiogram</h2>
              <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-muted-foreground">read the purpose, full workflow, individual scene guides, and behind-the-scenes explanation.</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
          </Link>

          <div className="mb-16 space-y-6">
            {studioSteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <section key={step.number} className="rounded-[20px] border border-border/50 bg-card p-6 shadow-paper md:p-8">
                  <div className="mb-5 flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted/40"><StepIcon className="h-5 w-5 text-foreground/80" /></div>
                    <div><span className="mb-1 block font-mono text-[11px] uppercase text-muted-foreground">step {step.number}</span><h2 className="font-serif text-xl font-light text-foreground md:text-2xl">{step.title}</h2></div>
                  </div>
                  <p className="mb-6 max-w-3xl text-sm font-light leading-relaxed text-muted-foreground md:text-base">{step.summary}</p>
                  <ul className="mb-6 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                    {step.parameters.map((parameter) => <li key={parameter} className="flex items-start gap-2 text-sm font-light text-foreground/85"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />{parameter}</li>)}
                  </ul>
                  <p className="max-w-3xl border-l-2 border-border/60 pl-4 text-sm font-light leading-relaxed text-muted-foreground">{step.footnote}</p>
                </section>
              );
            })}
          </div>

          <section className="mb-16 rounded-[20px] border border-border/50 bg-card p-6 shadow-paper md:p-8">
            <h2 className="mb-4 font-serif text-2xl font-light text-foreground">why this exists</h2>
            <p className="mb-5 max-w-3xl text-sm font-light leading-relaxed text-muted-foreground">product photography usually happens after a piece is cast. the studio moves that step before manufacturing, so a creator can list and present a design that currently exists as geometry. you do not need:</p>
            <ul className="mb-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">{thingsYouDoNotNeed.map((item) => <li key={item} className="flex items-start gap-2 text-sm font-light text-foreground/85"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />{item}</li>)}</ul>
            <Link to="/studiogram/why" className="inline-flex items-center gap-2 text-sm text-foreground">read why studiogram exists <ArrowRight className="h-4 w-4" /></Link>
          </section>

          <section className="mb-16">
            <h2 className="mb-3 font-serif text-2xl font-light text-foreground md:text-3xl">technical implementation</h2>
            <p className="mb-8 max-w-3xl text-sm font-light leading-relaxed text-muted-foreground">the product studio is a 3d scene system, not an image-generation feature. that decision shapes every part below.</p>
            <div className="mb-8 grid gap-4 md:grid-cols-2">{technicalNotes.map((note) => { const NoteIcon = note.icon; return <article key={note.title} className="rounded-[18px] border border-border/50 bg-card p-5 shadow-paper"><div className="mb-3 flex items-center gap-3"><NoteIcon className="h-4 w-4 text-muted-foreground" /><h3 className="font-mono text-sm uppercase text-foreground/80">{note.title}</h3></div><p className="text-sm font-light leading-relaxed text-muted-foreground">{note.body}</p></article>; })}</div>
            <div className="rounded-[20px] border border-border/50 bg-card p-6 shadow-paper md:p-8"><h3 className="mb-4 font-mono text-xs uppercase text-muted-foreground">scene composition</h3><pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground/80 md:text-sm">{sceneGraph}</pre></div>
          </section>

          <section className="mb-14 rounded-[20px] border border-border/50 bg-muted/30 p-6 md:p-8">
            <h2 className="mb-5 font-serif text-2xl font-light text-foreground">the important distinction</h2>
            <div className="max-w-3xl space-y-5">
              <div><span className="mb-2 block font-mono text-[11px] uppercase text-muted-foreground">the studio does not ask</span><p className="font-serif text-lg font-light italic text-muted-foreground md:text-xl">“what would this jewelry probably look like on a hand?”</p></div>
              <div><span className="mb-2 block font-mono text-[11px] uppercase text-muted-foreground">it asks</span><p className="font-serif text-lg font-light italic text-foreground md:text-xl">“given this hand geometry, this jewelry geometry, this pose, this camera, and this lighting setup, what does the scene render as?”</p></div>
              <p className="text-sm font-light leading-relaxed text-muted-foreground">the object being photographed is the creator's actual modeled jewelry rather than a generated imitation.</p>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}