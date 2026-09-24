import { useState, useEffect } from "react";
import StudioNav from "@/components/studio/StudioNav";
import CodePanel from "@/components/canvas/CodePanel";
import { useStudioDesign } from "@/lib/studioStore";

export default function CodePage() {
  const { jewelry } = useStudioDesign(useState, useEffect);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <StudioNav jewelry={jewelry} />
      <div className="flex-1 overflow-hidden">
        <CodePanel ring={jewelry} />
      </div>
    </div>
  );
}