import { cn } from "@/lib/utils";

const materialColors = {
  silver: "bg-slate-100 text-slate-600 border-slate-200",
  brass: "bg-amber-50 text-amber-700 border-amber-200",
  gold: "bg-yellow-50 text-yellow-700 border-yellow-200",
  bronze: "bg-orange-50 text-orange-700 border-orange-200",
  copper: "bg-orange-50 text-orange-600 border-orange-200",
  steel: "bg-zinc-100 text-zinc-600 border-zinc-200",
  titanium: "bg-blue-50 text-blue-600 border-blue-200",
  platinum: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function MaterialTag({ material, size = "sm" }) {
  const colorClass = materialColors[material?.toLowerCase()] || "bg-secondary text-secondary-foreground border-border";
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border font-medium tracking-wide lowercase",
      size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
      colorClass
    )}>
      {material}
    </span>
  );
}