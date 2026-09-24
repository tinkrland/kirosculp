import { useState } from "react";
import { Artifacts, MarketAccounts } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import ArtifactGrid from "../components/artifacts/ArtifactGrid";
import StoreGrid from "../components/explore/StoreGrid";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_ARTIFACTS, DEMO_STORES } from "@/lib/demoData";

const categories = ["all", "jewelry", "sculpture", "functional", "wearable", "decorative", "experimental"];
const materials = ["all", "silver", "brass", "gold", "bronze", "copper", "steel", "titanium"];

export default function Explore() {
  const urlParams = new URLSearchParams(window.location.search);
  const [tab, setTab] = useState(urlParams.get("tab") === "stores" ? "stores" : "artifacts");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");

  const { data: liveArtifacts, isLoading: artifactsLoading } = useQuery({
    queryKey: ["explore-artifacts"],
    queryFn: () => Artifacts.listPublished(50),
    initialData: [],
  });

  const { data: liveAccounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["explore-stores"],
    queryFn: () => MarketAccounts.listActive(50),
    initialData: [],
    enabled: tab === "stores",
  });

  // Merge live + demo data (demo fills in if no live data)
  const artifacts = liveArtifacts.length > 0 ? liveArtifacts : DEMO_ARTIFACTS;
  const accounts = (liveAccounts?.length > 0) ? liveAccounts : DEMO_STORES;

  const filteredArtifacts = artifacts.filter((a) => {
    const matchSearch = !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.creator_handle?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "all" || a.category === selectedCategory;
    const matchMaterial = selectedMaterial === "all" || a.materials?.includes(selectedMaterial);
    return matchSearch && matchCategory && matchMaterial;
  });

  const filteredStores = accounts.filter((s) => {
    return !search || s.handle?.toLowerCase().includes(search.toLowerCase()) || s.display_name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header + tabs */}
        <div className="mb-10">
          <h1 className="font-serif text-2xl md:text-4xl font-light tracking-tight lowercase text-foreground mb-2">
            explore
          </h1>
          <p className="text-sm text-muted-foreground tracking-wide font-light mb-6">
            discover objects and creators from around the world
          </p>
          <div className="flex gap-2">
            {["artifacts", "stores"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-xs tracking-wider lowercase border transition-all duration-200 ${
                  tab === t
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={tab === "artifacts" ? "search by name or creator..." : "search stores..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-full bg-card border-border/60 text-sm tracking-wide"
            />
          </div>

          {tab === "artifacts" && (
            <>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs tracking-wider lowercase border transition-all duration-200 ${
                      selectedCategory === cat
                        ? "bg-foreground text-background border-foreground"
                        : "bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground/40" />
                {materials.map((mat) => (
                  <button
                    key={mat}
                    onClick={() => setSelectedMaterial(mat)}
                    className={`px-3 py-1 rounded-full text-[11px] tracking-wider lowercase border transition-all duration-200 ${
                      selectedMaterial === mat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border/50 hover:border-primary/30"
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Results */}
        {tab === "artifacts" ? (
          artifactsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="rounded-[20px] overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredArtifacts.length > 0 ? (
            <ArtifactGrid artifacts={filteredArtifacts} />
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground tracking-wide text-sm">no artifacts found</p>
              <p className="text-muted-foreground/50 tracking-wide text-xs mt-2">try adjusting your filters</p>
            </div>
          )
        ) : (
          accountsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-[20px]" />
              ))}
            </div>
          ) : filteredStores.length > 0 ? (
            <StoreGrid stores={filteredStores} />
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground tracking-wide text-sm">no stores found</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}