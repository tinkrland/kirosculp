import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublishArtifact() {
  return (
    <div className="px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 tracking-wide transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          back to workspace
        </Link>

        <div className="rounded-[24px] border border-border/50 bg-card p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/40 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-muted-foreground/60" />
            </div>
            <div className="space-y-3">
              <h2 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground">
                publish artifact
              </h2>
              <p className="text-sm text-muted-foreground tracking-wide leading-relaxed">
                this page is disabled pending the real studio architecture. commerce
                has been separated to the platform leg. the studio snapshot calls{" "}
                <code className="px-1.5 py-0.5 rounded bg-secondary/60 text-xs font-mono">
                  getMfgCost
                </code>{" "}
                and{" "}
                <code className="px-1.5 py-0.5 rounded bg-secondary/60 text-xs font-mono">
                  getFinalPrice
                </code>{" "}
                which now throw errors under the zero client amounts contract.
              </p>
              <p className="text-sm text-muted-foreground tracking-wide leading-relaxed">
                the replacement publish flow will use MATERIALS and REGIONS vocabulary
                only, with no computed prices in the creator interface. all pricing
                happens server-side in the platform leg after design validation.
              </p>
              <div className="pt-4">
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    className="rounded-full px-6 py-3 text-sm tracking-wider border-border/80"
                  >
                    return to dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
