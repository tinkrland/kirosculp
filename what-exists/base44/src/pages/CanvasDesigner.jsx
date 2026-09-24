import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Code2, Layout, Printer, Layers } from "lucide-react";
import JewelryViewport from "@/components/canvas/JewelryViewport";
import JewelryControls from "@/components/canvas/JewelryControls";
import CodePanel from "@/components/canvas/CodePanel";
import TemplatesPanel from "@/components/canvas/TemplatesPanel";
import PrintPanel from "@/components/canvas/PrintPanel";
import { DEFAULT_JEWELRY } from "@/lib/jewelryDefaults";

const TABS = [
  { id: "design",    label: "Design",    icon: Layers },
  { id: "templates", label: "Templates", icon: Layout },
  { id: "print",     label: "Print",     icon: Printer },
  { id: "code",      label: "Code",      icon: Code2 },
];

export default function CanvasDesigner() {
  const [jewelry, setJewelry] = useState(DEFAULT_JEWELRY);
  const [tab, setTab] = useState("design");
  const sceneGroupRef = useRef(null);

  const set = (key, val) => setJewelry((j) => ({ ...j, [key]: val }));
  const setNested = (section, key, val) =>
    setJewelry((j) => ({ ...j, [section]: { ...j[section], [key]: val } }));

  const applyTemplate = (config) => {
    setJewelry((j) => ({
      ...DEFAULT_JEWELRY,
      ...config,
      // preserve segment quality preference
      segments: j.segments,
    }));
    setTab("design");
  };

  // Whether to show the 3D viewport in the main panel
  const showViewport = tab === "design" || tab === "print";
  // Whether to show the sidebar controls
  const showControls = tab === "design";

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="border-b border-border/60 px-5 py-3 flex items-center justify-between bg-card/90 backdrop-blur-sm flex-shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground tracking-wide transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            sculptura
          </Link>
          <div className="w-px h-4 bg-border/60" />
          <span className="font-mono text-xs tracking-widest text-foreground/70 uppercase">
            jewelry studio
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/50">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
            <span className="text-[10px] font-mono text-muted-foreground tracking-wider">live preview</span>
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border/50">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] tracking-wide font-mono transition-all ${
                tab === id
                  ? "bg-card text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Design name / piece info */}
        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-muted-foreground/50 tracking-wider">
          <span>{jewelry.type}</span>
          <span className="text-border">·</span>
          <span>{jewelry.material}</span>
          <span className="text-border">·</span>
          <span>{jewelry.finish}</span>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left sidebar — only for Design and Print tabs */}
        {(showControls || tab === "print" || tab === "templates") && (
          <aside className="w-72 xl:w-80 border-r border-border/60 overflow-hidden flex-shrink-0 bg-card/40 flex flex-col">
            {tab === "design" && (
              <div className="flex-1 overflow-y-auto">
                <JewelryControls jewelry={jewelry} set={set} setNested={setNested} />
              </div>
            )}
            {tab === "templates" && (
              <TemplatesPanel onApply={applyTemplate} />
            )}
            {tab === "print" && (
              <PrintPanel
                jewelry={jewelry}
                getSceneGroup={() => sceneGroupRef.current}
              />
            )}
          </aside>
        )}

        {/* Main content area */}
        <main className="flex-1 relative overflow-hidden">
          {/* Always keep viewport mounted for the scene ref to work */}
          <div className={showViewport ? "w-full h-full" : "hidden"}>
            <JewelryViewport
              jewelry={jewelry}
              onSceneGroupRef={(group) => { sceneGroupRef.current = group; }}
            />
          </div>

          {tab === "code" && (
            <div className="absolute inset-0">
              <CodePanel ring={jewelry} />
            </div>
          )}

          {tab === "templates" && (
            <div className="w-full h-full flex items-center justify-center bg-muted/10">
              <div className="text-center space-y-3 max-w-xs px-8">
                <div className="text-5xl opacity-40">◆</div>
                <p className="text-sm font-medium text-foreground/60 tracking-wide">Pick a template</p>
                <p className="text-[11px] text-muted-foreground/40 tracking-wide leading-relaxed">
                  Browse letter pendants, name rings, birthstone charms and more in the sidebar. Applying a template loads it straight into the designer.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}