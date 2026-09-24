import { useState, useRef } from "react";
import { AlertTriangle, CheckCircle, ExternalLink, Printer, RefreshCw, Package } from "lucide-react";
import {
  SCULPTEO_MATERIALS,
  getSculpteoMaterial,
  getPrintabilityWarnings,
  estimateVolumeRoughMM3,
  estimatePriceUSD,
} from "@/lib/sculpteoMaterials";
import { base44 } from "@/api/base44Client";

export default function PrintPanel({ jewelry, getSceneGroup }) {
  const [selectedMat, setSelectedMat] = useState(() => getSculpteoMaterial(jewelry.material));
  const [exporting, setExporting] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [qty, setQty] = useState(1);
  const formRef = useRef(null);

  const mat = SCULPTEO_MATERIALS.find((m) => m.id === selectedMat);
  const warnings = getPrintabilityWarnings(jewelry, selectedMat);
  const volumeMM3 = estimateVolumeRoughMM3(jewelry);
  const estimatedPrice = estimatePriceUSD(volumeMM3, selectedMat);
  const hasBlockingWarning = warnings.some((w) => w.includes("below minimum"));

  const handleExportAndUpload = async () => {
    setExporting(true);
    setUploadError(null);
    setUploadedUrl(null);

    try {
      // Dynamically import STL exporter to keep bundle lean
      const { exportSTL } = await import("@/lib/stlExport");
      const group = getSceneGroup?.();
      if (!group) throw new Error("3D scene not ready. Switch to 3D view first.");

      const stlBlob = exportSTL(group);
      if (!stlBlob) throw new Error("Failed to generate STL geometry.");

      // Convert Blob to File for upload
      const fileName = `sculptura_${jewelry.type}_${jewelry.material}.stl`;
      const file = new File([stlBlob], fileName, { type: "application/octet-stream" });

      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrl(file_url);
    } catch (err) {
      setUploadError(err.message || "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleSendToSculpteo = () => {
    if (!uploadedUrl) return;
    // Build the Sculpteo web2web form and auto-submit it
    // This opens Sculpteo in a new tab and redirects the user to place their order.
    // The web2web API allows browser-level POSTs without requiring a provider account
    // by constructing an HTML form and submitting it programmatically.
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://www.sculpteo.com/en/backend/webapi/post_design/";
    form.target = "_blank";

    const fields = {
      version: "1",
      name: `sculptura-${jewelry.type}-${jewelry.material}-${Date.now()}`,
      urlfile1: uploadedUrl,
      unit: "mm",
      scale: "1.0",
      description: `${jewelry.type} · ${jewelry.material} · ${jewelry.finish}${jewelry.engraving ? ` · "${jewelry.engraving}"` : ""}`,
      material: mat?.sculpteoId || "silver",
    };

    Object.entries(fields).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const suitableMats = SCULPTEO_MATERIALS.filter((m) => m.suitable.includes(jewelry.type));

  return (
    <div className="h-full overflow-y-auto divide-y divide-border/40">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-1">
          <Printer className="w-4 h-4 text-muted-foreground/60" />
          <p className="text-[11px] tracking-widest font-mono text-muted-foreground/60 uppercase">send to sculpteo</p>
        </div>
        <p className="text-[11px] text-muted-foreground/50 tracking-wide leading-relaxed">
          Export your design as STL and send directly to Sculpteo for professional 3D printing in metal.
        </p>
      </div>

      {/* Material selector */}
      <div className="px-4 py-4 space-y-3">
        <p className="text-[9px] tracking-widest font-mono text-muted-foreground/50 uppercase">print material</p>
        {suitableMats.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMat(m.id)}
            className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
              selectedMat === m.id
                ? "bg-foreground/5 border-foreground/30"
                : "border-border/40 hover:border-border"
            }`}
          >
            <span
              className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0 mt-0.5"
              style={{ background: m.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium tracking-wide text-foreground/90">{m.label}</span>
                {m.isPrototype && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-muted/80 text-muted-foreground/50 uppercase">proto</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5 leading-relaxed">{m.description}</p>
              <div className="flex gap-3 mt-1">
                <span className="text-[9px] font-mono text-muted-foreground/40">min wall: {m.minThicknessMm}mm</span>
                <span className="text-[9px] font-mono text-muted-foreground/40">max: {m.maxSizeMm.x}×{m.maxSizeMm.y}mm</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Print specs */}
      <div className="px-4 py-4 space-y-2">
        <p className="text-[9px] tracking-widest font-mono text-muted-foreground/50 uppercase">print specs</p>
        <div className="space-y-1.5">
          {[
            ["Volume (est.)", `${volumeMM3.toFixed(0)} mm³`],
            ["Material", mat?.label || "—"],
            ["Min wall", `${mat?.minThicknessMm || "—"} mm`],
            ["Est. price", estimatedPrice ? `~$${estimatedPrice}` : "—"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-[11px]">
              <span className="text-muted-foreground/50">{k}</span>
              <span className="font-mono text-foreground/70">{v}</span>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground/30 tracking-wide mt-2">
          Estimates only. Final price calculated by Sculpteo after upload.
        </p>
      </div>

      {/* Printability warnings */}
      {warnings.length > 0 && (
        <div className="px-4 py-4 space-y-2">
          <p className="text-[9px] tracking-widest font-mono text-muted-foreground/50 uppercase">printability check</p>
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-orange-50/60 border border-orange-200/60 dark:bg-orange-900/20 dark:border-orange-700/30">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-500/80 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-orange-700/80 dark:text-orange-300/70 leading-relaxed">{w}</p>
            </div>
          ))}
        </div>
      )}

      {warnings.length === 0 && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50/60 border border-green-200/60 dark:bg-green-900/20 dark:border-green-700/30">
            <CheckCircle className="w-3.5 h-3.5 text-green-600/80 flex-shrink-0" />
            <p className="text-[10px] text-green-700/80 dark:text-green-300/70 tracking-wide">Design looks printable in {mat?.label}.</p>
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="px-4 py-4 space-y-2">
        <p className="text-[9px] tracking-widest font-mono text-muted-foreground/50 uppercase">quantity</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground/70 text-sm hover:border-foreground/30 transition-colors">−</button>
          <span className="flex-1 text-center text-sm font-mono text-foreground/80">{qty}</span>
          <button onClick={() => setQty(Math.min(99, qty + 1))} className="w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground/70 text-sm hover:border-foreground/30 transition-colors">+</button>
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="px-4 py-3">
          <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-[10px] text-destructive/80 leading-relaxed">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="px-4 py-4 space-y-2.5">
        {!uploadedUrl ? (
          <button
            onClick={handleExportAndUpload}
            disabled={exporting || hasBlockingWarning}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-foreground text-background text-[11px] font-mono tracking-wider transition-all disabled:opacity-40 hover:bg-foreground/90"
          >
            {exporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                exporting STL…
              </>
            ) : (
              <>
                <Package className="w-3.5 h-3.5" />
                export STL & upload
              </>
            )}
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50/60 border border-green-200/50 dark:bg-green-900/20 dark:border-green-700/30">
              <CheckCircle className="w-3.5 h-3.5 text-green-600/80 flex-shrink-0" />
              <span className="text-[10px] text-green-700/80 dark:text-green-400/70 tracking-wide">STL uploaded — ready to send</span>
            </div>
            <button
              onClick={handleSendToSculpteo}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-foreground text-background text-[11px] font-mono tracking-wider hover:bg-foreground/90 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              send to sculpteo →
            </button>
            <button
              onClick={() => { setUploadedUrl(null); setUploadError(null); }}
              className="w-full py-2 rounded-xl border border-border/50 text-[11px] font-mono tracking-wider text-muted-foreground hover:border-foreground/30 transition-colors"
            >
              re-export
            </button>
          </>
        )}

        <p className="text-[9px] text-muted-foreground/30 tracking-wide text-center leading-relaxed pt-1">
          Sends your STL file to Sculpteo's web2web API.<br />
          You'll complete payment on Sculpteo's website.
        </p>
      </div>

      {/* Sculpteo link */}
      <div className="px-4 py-4">
        <a
          href="https://www.sculpteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-[11px] text-muted-foreground/50 hover:text-muted-foreground/80 tracking-wide transition-colors"
        >
          <span>sculpteo.com</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}