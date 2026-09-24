import { useState, useEffect, useRef } from "react";
import StudioNav from "@/components/studio/StudioNav";
import JewelryViewport from "@/components/canvas/JewelryViewport";
import PrintPanel from "@/components/canvas/PrintPanel";
import { useStudioDesign } from "@/lib/studioStore";

export default function PrintPage() {
  const { jewelry } = useStudioDesign(useState, useEffect);
  const sceneGroupRef = useRef(null);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <StudioNav jewelry={jewelry} />
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-border/60 overflow-hidden flex-shrink-0 bg-card/40 flex flex-col">
          <PrintPanel
            jewelry={jewelry}
            getSceneGroup={() => sceneGroupRef.current}
          />
        </aside>
        <main className="flex-1 relative overflow-hidden">
          <JewelryViewport
            jewelry={jewelry}
            onSceneGroupRef={(g) => { sceneGroupRef.current = g; }}
          />
        </main>
      </div>
    </div>
  );
}