import { db } from '@/lib/db';
import { useState, useEffect } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, Upload, X, Box, Check, Tag as TagIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MATERIALS, REGIONS, getMfgCost, getFinalPrice, DELIVERY_ESTIMATES } from "@/lib/pricing";
import { SIZE_TYPES, presetSizes, defaultSizesFor } from "@/lib/sizing";
import { slugify } from "@/lib/slug";

const CATEGORIES = ["jewelry", "sculpture", "functional", "wearable", "decorative", "experimental"];
const ARTIFACT_TYPES = ["ring", "earring", "bracelet", "brooch", "pendant", "other"];
const STEPS = ["upload design", "metals offered", "audience", "your earnings", "submit"];

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function PublishArtifact() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    artifact_type: "",
    specs: "",
    dimensions: "",
    weight_grams: "",
    creator_handle: "",
    image_url: "",
    image_urls: [],
    model_url: "",
    materials: ["silver"],
    region: "europe",
    creator_earnings: 30,
    made_to_order: true,
    // sizing: 'unisize' (default) | 'standard' (S/M/L) | 'ring' (US ring sizes) | 'custom'
    size_type: "unisize",
    sizes: [],
    size_surcharges: {}, // map of size -> usd surcharge added to base material price
    custom_size_draft: "",
    // seo + grouping
    slug: "",
    slug_touched: false, // once edited manually we stop auto-syncing from name
    seo_title: "",
    seo_description: "",
    keywords: "", // comma-separated in the input, split on submit
    tags: [], // pill list
    tag_draft: "",
    collection_id: "",
  });

  const update = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  // pre-fill creator_handle from the verified store session if present.
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('market_handle') : null;
    if (stored) setForm((p) => (p.creator_handle ? p : { ...p, creator_handle: stored }));
  }, []);

  // pull the creator's collections + default margin once a handle is typed.
  // we look up the market_account for that handle to pre-fill the default margin.
  const handle = form.creator_handle?.trim().toLowerCase();

  const { data: marketAccount } = useQuery({
    queryKey: ['publish-market-account', handle],
    queryFn: () => db.entities.MarketAccount.filter({ handle }).then((r) => r?.[0] ?? null),
    enabled: !!handle,
  });

  const { data: collections } = useQuery({
    queryKey: ['publish-collections', handle],
    queryFn: () => db.entities.Collection.filter({ creator_handle: handle }, 'sort_order', 100),
    initialData: [],
    enabled: !!handle,
  });

  // when a market account is found and the creator hasn't manually edited
  // earnings yet, pre-fill earnings using the default margin against the
  // current material's manufacturing cost.
  useEffect(() => {
    if (!marketAccount?.default_margin_pct) return;
    const firstMat = form.materials?.[0] || "silver";
    const mfg = getMfgCost(firstMat, form.region);
    const suggested = Math.round(mfg * (Number(marketAccount.default_margin_pct) / 100));
    setForm((p) => ({ ...p, creator_earnings: suggested }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketAccount?.default_margin_pct, form.materials?.[0], form.region]);

  // auto-suggest slug from name until the creator manually edits it.
  useEffect(() => {
    if (form.slug_touched) return;
    setForm((p) => ({ ...p, slug: slugify(p.name) }));
  }, [form.name, form.slug_touched]);

  // build per-material cost + price maps. earnings is the same flat amount
  // the creator wants per piece sold, regardless of material chosen by the buyer.
  const manufacturingCosts = Object.fromEntries(form.materials.map((m) => [m, getMfgCost(m, form.region)]));
  const earningsMap = Object.fromEntries(form.materials.map((m) => [m, form.creator_earnings]));
  const pricesMap = Object.fromEntries(form.materials.map((m) => [m, getFinalPrice(m, form.region, form.creator_earnings)]));
  const primaryMaterial = form.materials[0] || "silver";
  const mfgCost = getMfgCost(primaryMaterial, form.region);
  const finalPrice = getFinalPrice(primaryMaterial, form.region, form.creator_earnings);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    update("image_url", file_url);
  };

  const handleExtraImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = [];
    for (const file of files) {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      if (file_url) uploaded.push(file_url);
    }
    setForm((p) => ({ ...p, image_urls: [...(p.image_urls || []), ...uploaded].slice(0, 8) }));
    e.target.value = "";
  };

  const removeExtraImage = (url) => setForm((p) => ({ ...p, image_urls: (p.image_urls || []).filter((u) => u !== url) }));

  const handleModelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    update("model_url", file_url);
  };

  const addTag = () => {
    const t = form.tag_draft.trim().toLowerCase();
    if (!t) return;
    if (form.tags.includes(t)) {
      setForm((p) => ({ ...p, tag_draft: '' }));
      return;
    }
    setForm((p) => ({ ...p, tags: [...p.tags, t].slice(0, 12), tag_draft: '' }));
  };

  const removeTag = (t) => setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));

  // ---- size helpers ----
  const setSizeType = (t) => setForm((p) => ({
    ...p,
    size_type: t,
    sizes: t === "unisize" ? [] : (p.sizes?.length ? p.sizes : defaultSizesFor(t)),
    size_surcharges: t === "unisize" ? {} : p.size_surcharges,
  }));
  const toggleSize = (s) => setForm((p) => ({
    ...p,
    sizes: p.sizes.includes(s) ? p.sizes.filter((x) => x !== s) : [...p.sizes, s],
  }));
  const addCustomSize = () => {
    const s = (form.custom_size_draft || "").trim();
    if (!s) return;
    setForm((p) => p.sizes.includes(s) ? { ...p, custom_size_draft: "" } : { ...p, sizes: [...p.sizes, s], custom_size_draft: "" });
  };
  const removeSize = (s) => setForm((p) => {
    const next = { ...p.size_surcharges };
    delete next[s];
    return { ...p, sizes: p.sizes.filter((x) => x !== s), size_surcharges: next };
  });
  const setSurcharge = (s, v) => setForm((p) => ({
    ...p,
    size_surcharges: { ...p.size_surcharges, [s]: Number(v) || 0 },
  }));

  const publishMutation = useMutation({
    mutationFn: async (data) => {
      const keywords = data.keywords
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);
      const payload = {
        name: data.name,
        description: data.description,
        category: data.category,
        artifact_type: data.artifact_type || null,
        specs: data.specs,
        dimensions: data.dimensions || null,
        weight_grams: data.weight_grams === "" || data.weight_grams == null ? null : Number(data.weight_grams),
        image_url: data.image_url,
        image_urls: data.image_urls || [],
        model_url: data.model_url,
        made_to_order: data.made_to_order,
        region: data.region,
        materials: data.materials,
        manufacturing_costs: manufacturingCosts,
        creator_earnings: earningsMap,
        prices: pricesMap,
        size_type: data.size_type || "unisize",
        sizes: data.size_type === "unisize" ? [] : (data.sizes || []),
        size_surcharges: data.size_type === "unisize" ? {} : (data.size_surcharges || {}),
        slug: data.slug ? slugify(data.slug) : slugify(data.name),
        seo_title: data.seo_title || null,
        seo_description: data.seo_description || null,
        keywords,
        tags: data.tags,
        collection_id: data.collection_id || null,
      };

      // stores authenticate via access key, not supabase auth, so the
      // artifacts rls insert policy blocks direct writes. route through
      // the publish-artifact edge function which verifies the store's
      // key and inserts under the service role.
      const handle = (data.creator_handle || sessionStorage.getItem('market_handle') || '').trim().toLowerCase();
      const key = sessionStorage.getItem('market_key');
      if (!handle) throw new Error('missing creator handle');
      if (!key) throw new Error('open your store dashboard first so we can verify your access key, then come back to publish');

      const { supabase } = await import('@/integrations/supabase/client');
      const { data: res, error } = await supabase.functions.invoke('publish-artifact', {
        body: { handle, key, payload },
      });
      if (error) throw error;
      if (res?.error) throw new Error(res.error);
      return res?.artifact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-artifacts"] });
      toast.success("design submitted for review");
      navigate("/dashboard");
    },
    onError: (err) => toast.error(err?.message || 'could not submit'),
  });

  const next = () => {
    if (step === 0 && !form.name.trim()) { toast.error("give your artifact a name"); return; }
    if (step === 1 && (!form.materials || form.materials.length === 0)) { toast.error("select at least one material you'd offer this in"); return; }
    if (step === 1 && form.size_type !== "unisize" && (!form.sizes || form.sizes.length === 0)) { toast.error("add at least one size, or pick one size only"); return; }
    setStep((s) => Math.min(s + 1, 4));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="px-6 py-10">
      <div className="max-w-xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 tracking-wide transition-colors">
          <ArrowLeft className="w-4 h-4" />
          back to workspace
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] tracking-wide transition-all ${
                i < step ? "bg-foreground text-background" :
                i === step ? "bg-foreground text-background" :
                "bg-secondary text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-xs tracking-wider lowercase transition-colors ${i === step ? "text-foreground" : "text-muted-foreground/50"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-border/60 ml-1" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 0 - Upload design */}
          {step === 0 && (
            <motion.div key="s0" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-7">
              <div>
                <h2 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground mb-1">upload your design</h2>
                <p className="text-sm text-muted-foreground tracking-wide font-light">add a name, description and files</p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">artifact name</Label>
                <Input placeholder="e.g. signet_01" value={form.name} onChange={(e) => update("name", e.target.value)} className="rounded-xl bg-card border-border/60 text-sm tracking-wide" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">description</Label>
                <Textarea placeholder="a short, poetic description..." value={form.description} onChange={(e) => update("description", e.target.value)} className="rounded-xl bg-card border-border/60 text-sm tracking-wide min-h-[80px]" />
              </div>

              {/* 3D Model upload */}
              <div className="space-y-2">
                <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">3D model (.glb, .stl)</Label>
                {form.model_url ? (
                  <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50">
                    <Box className="w-4 h-4 text-muted-foreground/60" />
                    <span className="text-xs tracking-wide text-muted-foreground flex-1">model uploaded</span>
                    <button onClick={() => update("model_url", "")}><X className="w-3.5 h-3.5 text-muted-foreground/50" /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 w-full py-8 rounded-[20px] border border-dashed border-border/60 bg-card cursor-pointer hover:bg-secondary/30 transition-colors">
                    <Box className="w-6 h-6 text-muted-foreground/30" />
                    <span className="text-xs tracking-wide text-muted-foreground/50">upload .glb or .stl file</span>
                    <input type="file" accept=".glb,.stl,.gltf" className="hidden" onChange={handleModelUpload} />
                  </label>
                )}
              </div>

              {/* Image upload */}
              <div className="space-y-2">
                <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">render image (fallback)</Label>
                {form.image_url ? (
                  <div className="relative w-full aspect-video rounded-[20px] overflow-hidden border border-border/50">
                    <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={() => update("image_url", "")} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 w-full aspect-video rounded-[20px] border border-dashed border-border/60 bg-card cursor-pointer hover:bg-secondary/30 transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground/30" />
                    <span className="text-xs tracking-wide text-muted-foreground/50">upload render / photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              {/* Additional images (slideshow) */}
              <div className="space-y-2">
                <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">additional images (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {(form.image_urls || []).map((url) => (
                    <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/50">
                      <img src={url} alt="extra" className="w-full h-full object-cover" />
                      <button onClick={() => removeExtraImage(url)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(form.image_urls || []).length < 8 && (
                    <label className="w-20 h-20 rounded-xl border border-dashed border-border/60 bg-card flex items-center justify-center cursor-pointer hover:bg-secondary/30">
                      <Upload className="w-4 h-4 text-muted-foreground/40" />
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleExtraImagesUpload} />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground/40 tracking-wide">collectors will see these as a slideshow on the artifact page</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">category</Label>
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="w-full rounded-xl bg-card border border-border/60 px-3 py-2 text-sm tracking-wide text-foreground focus:outline-none"
                  >
                    <option value="">select</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">specs</Label>
                  <Input placeholder="e.g. 12mm, polished" value={form.specs} onChange={(e) => update("specs", e.target.value)} className="rounded-xl bg-card border-border/60 text-sm tracking-wide" />
                </div>
              </div>

              {/* dimensions + weight (metric) - shown on the listing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">dimensions</Label>
                  <Input placeholder="e.g. 12 x 8 x 4 mm" value={form.dimensions} onChange={(e) => update("dimensions", e.target.value)} className="rounded-xl bg-card border-border/60 text-sm tracking-wide" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">weight (grams)</Label>
                  <Input type="number" min="0" step="0.1" placeholder="e.g. 4.2" value={form.weight_grams} onChange={(e) => update("weight_grams", e.target.value)} className="rounded-xl bg-card border-border/60 text-sm tracking-wide" />
                </div>
              </div>

              {/* artifact type - semantic tag used for buyer filtering */}
              <div className="space-y-2">
                <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">artifact type</Label>
                <div className="flex flex-wrap gap-2">
                  {ARTIFACT_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => update("artifact_type", t)}
                      className={`px-4 py-1.5 rounded-full text-xs tracking-wider lowercase border transition-all ${
                        form.artifact_type === t
                          ? "bg-foreground text-background border-foreground"
                          : "bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/40 tracking-wide">helps collectors filter your store and explore</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">your handle</Label>
                <Input placeholder="e.g. kai" value={form.creator_handle} onChange={(e) => update("creator_handle", e.target.value)} className="rounded-xl bg-card border-border/60 text-sm tracking-wide" />
              </div>

              {/* slug + seo + tags + collection */}
              {form.creator_handle && (
                <div className="space-y-5 pt-3 border-t border-border/40">
                  <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">discoverability</p>

                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">url slug</Label>
                    <Input
                      placeholder="auto from name"
                      value={form.slug}
                      onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value, slug_touched: true }))}
                      className="rounded-xl bg-card border-border/60 text-sm tracking-wide font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground/40 tracking-wide">
                      /shop/{form.creator_handle}/<span className="text-foreground/60">{slugify(form.slug || form.name) || 'your-slug'}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">seo title (optional)</Label>
                    <Input
                      placeholder="defaults to artifact name"
                      value={form.seo_title}
                      onChange={(e) => update('seo_title', e.target.value)}
                      maxLength={60}
                      className="rounded-xl bg-card border-border/60 text-sm tracking-wide"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">seo description (optional)</Label>
                    <Textarea
                      placeholder="up to 160 characters, shown in search engines"
                      value={form.seo_description}
                      onChange={(e) => update('seo_description', e.target.value)}
                      maxLength={160}
                      className="rounded-xl bg-card border-border/60 text-sm tracking-wide min-h-[60px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">keywords</Label>
                    <Input
                      placeholder="comma separated, e.g. silver, ring, minimal"
                      value={form.keywords}
                      onChange={(e) => update('keywords', e.target.value)}
                      className="rounded-xl bg-card border-border/60 text-sm tracking-wide"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">tags (visible pills)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="add tag and press enter"
                        value={form.tag_draft}
                        onChange={(e) => update('tag_draft', e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                        className="rounded-xl bg-card border-border/60 text-sm tracking-wide flex-1"
                      />
                      <Button type="button" variant="outline" onClick={addTag} className="rounded-full text-xs tracking-wider border-border/60">add</Button>
                    </div>
                    {form.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {form.tags.map((t) => (
                          <button key={t} type="button" onClick={() => removeTag(t)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-[11px] tracking-wider lowercase text-muted-foreground hover:text-foreground transition-colors">
                            <TagIcon className="w-2.5 h-2.5" />
                            {t}
                            <X className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {collections && collections.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">collection (optional)</Label>
                      <select
                        value={form.collection_id}
                        onChange={(e) => update('collection_id', e.target.value)}
                        className="w-full rounded-xl bg-card border border-border/60 px-3 py-2 text-sm tracking-wide text-foreground focus:outline-none"
                      >
                        <option value="">none</option>
                        {collections.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <Button onClick={next} className="w-full rounded-full py-6 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-2">
                continue <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* STEP 1 - Materials offered */}
          {step === 1 && (
            <motion.div key="s1" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-7">
              <div>
                <h2 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground mb-1">which metals do you offer this in?</h2>
                <p className="text-sm text-muted-foreground tracking-wide font-light">buyers will pick one at checkout. select every metal you're happy to see this design cast in.</p>
              </div>

              <div className="rounded-[18px] border border-border/50 bg-card/60 p-4 text-xs tracking-wide text-muted-foreground leading-relaxed">
                every piece is made to order. after a purchase, the design is sent to the platform's affiliated manufacturer, resin printed, and then cast in metal using the lost wax casting method. you don't pick the metal, the buyer does.
              </div>

              <div className="flex flex-wrap gap-2">
                {MATERIALS.map((mat) => {
                  const selected = form.materials.includes(mat);
                  return (
                    <button
                      type="button"
                      key={mat}
                      onClick={() => setForm((p) => ({
                        ...p,
                        materials: selected
                          ? p.materials.filter((m) => m !== mat)
                          : [...p.materials, mat],
                      }))}
                      className={`px-4 py-2 rounded-full text-xs tracking-wider lowercase border transition-all ${
                        selected
                          ? "bg-foreground text-background border-foreground"
                          : "bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
                      }`}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>

              {form.materials.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">indicative manufacturing cost</p>
                  <div className="rounded-[18px] border border-border/50 bg-card divide-y divide-border/40">
                    {form.materials.map((m) => (
                      <div key={m} className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm tracking-wide lowercase text-foreground">{m}</span>
                        <span className="text-sm tracking-wide text-muted-foreground">${getMfgCost(m, form.region)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground/40 tracking-wide">your earnings are added on top of the metal the buyer chooses.</p>
                </div>
              )}

              {/* sizing - unisize, generic apparel sizes, ring sizes, or custom */}
              <div className="space-y-4 pt-2 border-t border-border/40">
                <div>
                  <p className="text-[11px] tracking-widest text-muted-foreground/50 uppercase mb-1">sizing</p>
                  <p className="text-xs text-muted-foreground/60 tracking-wide font-light">offer this design in one size, or let buyers pick from a list. add an optional surcharge per size if larger sizes use more metal.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SIZE_TYPES.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setSizeType(opt.value)}
                      className={`px-4 py-2 rounded-full text-xs tracking-wider lowercase border transition-all ${
                        form.size_type === opt.value
                          ? "bg-foreground text-background border-foreground"
                          : "bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {form.size_type !== "unisize" && (
                  <div className="space-y-3">
                    {presetSizes(form.size_type).length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">offered sizes</p>
                        <div className="flex flex-wrap gap-1.5">
                          {presetSizes(form.size_type).map((s) => {
                            const sel = form.sizes.includes(s);
                            return (
                              <button
                                type="button"
                                key={s}
                                onClick={() => toggleSize(s)}
                                className={`px-3 py-1.5 rounded-full text-[11px] tracking-wider border transition-all ${
                                  sel ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
                                }`}
                              >
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {form.size_type === "custom" && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="add a size, e.g. 38mm"
                          value={form.custom_size_draft}
                          onChange={(e) => update("custom_size_draft", e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSize(); } }}
                          className="rounded-xl bg-card border-border/60 text-sm tracking-wide flex-1"
                        />
                        <Button type="button" variant="outline" onClick={addCustomSize} className="rounded-full text-xs tracking-wider border-border/60">add</Button>
                      </div>
                    )}

                    {form.sizes.length > 0 && (
                      <div className="rounded-[18px] border border-border/50 bg-card divide-y divide-border/40">
                        {form.sizes.map((s) => (
                          <div key={s} className="flex items-center gap-3 px-4 py-2.5">
                            <span className="text-sm tracking-wide text-foreground flex-1 lowercase">{s}</span>
                            <span className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">surcharge</span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">$</span>
                              <Input
                                type="number"
                                min="0"
                                value={form.size_surcharges[s] ?? 0}
                                onChange={(e) => setSurcharge(s, e.target.value)}
                                className="w-16 h-8 rounded-lg bg-background border-border/60 text-xs"
                              />
                            </div>
                            <button type="button" onClick={() => removeSize(s)} className="text-muted-foreground/50 hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground/40 tracking-wide">final price = material price + size surcharge. leave at 0 if all sizes cost the same.</p>
                  </div>
                )}
              </div>


              <div className="flex gap-3">
                <Button variant="ghost" onClick={back} className="rounded-full text-sm tracking-wider text-muted-foreground">back</Button>
                <Button onClick={next} className="flex-1 rounded-full text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-2">
                  continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 - Region */}
          {step === 2 && (
            <motion.div key="s2" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-7">
              <div>
                <h2 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground mb-1">where are your customers?</h2>
                <p className="text-sm text-muted-foreground tracking-wide font-light">affects manufacturing routing and delivery</p>
              </div>

              <div className="space-y-3">
                {REGIONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => update("region", r.value)}
                    className={`w-full flex items-center justify-between p-5 rounded-[18px] border text-left transition-all ${
                      form.region === r.value
                        ? "border-foreground bg-foreground/5 shadow-paper"
                        : "border-border/50 bg-card hover:border-foreground/20"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium tracking-wide text-foreground">{r.label}</p>
                      <p className="text-xs text-muted-foreground/60 tracking-wide mt-0.5">{DELIVERY_ESTIMATES[r.value]}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      form.region === r.value ? "border-foreground" : "border-border"
                    }`}>
                      {form.region === r.value && <div className="w-2.5 h-2.5 rounded-full bg-foreground" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={back} className="rounded-full text-sm tracking-wider text-muted-foreground">back</Button>
                <Button onClick={next} className="flex-1 rounded-full text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-2">
                  continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 - Creator earnings */}
          {step === 3 && (
            <motion.div key="s3" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-7">
              <div>
                <h2 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground mb-1">how much do you want to earn?</h2>
                <p className="text-sm text-muted-foreground tracking-wide font-light">per piece sold, in USD</p>
              </div>

              <div className="space-y-3">
                <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">your earnings per piece</Label>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    min="0"
                    value={form.creator_earnings}
                    onChange={(e) => update("creator_earnings", parseFloat(e.target.value) || 0)}
                    className="rounded-xl bg-card border-border/60 text-lg tracking-wide font-light w-32"
                  />
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-card rounded-[20px] border border-border/50 shadow-paper p-6 space-y-4">
                <p className="text-xs tracking-wider text-muted-foreground/60 uppercase">price breakdown</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground tracking-wide">manufacturing cost</span>
                    <span className="text-sm font-medium tracking-wide text-foreground">${mfgCost}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground tracking-wide">your earnings</span>
                    <span className="text-sm font-medium tracking-wide text-foreground">+${form.creator_earnings}</span>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium tracking-wide text-foreground">final price</span>
                    <span className="text-xl font-light tracking-wide text-foreground">${finalPrice}</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/40 tracking-wide">
                  {form.materials.join(", ")}, {form.region.replace("_", " ")}, {DELIVERY_ESTIMATES[form.region]}
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={back} className="rounded-full text-sm tracking-wider text-muted-foreground">back</Button>
                <Button onClick={next} className="flex-1 rounded-full text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-2">
                  review <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4 - Review */}
          {step === 4 && (
            <motion.div key="s4" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-7">
              <div>
                <h2 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground mb-1">submit for review</h2>
                <p className="text-sm text-muted-foreground tracking-wide font-light">the sculptura team will review your design, provide a manufacturing quote, and publish it to the marketplace.</p>
              </div>

              {/* manufacturer caveat - approved listings can still be flagged later */}
              <div className="rounded-[18px] border border-amber-200/70 bg-amber-50/60 p-4 text-xs tracking-wide text-amber-900/80 leading-relaxed">
                heads up: even after approval, an order may not be processed if our manufacturer deems the piece unprintable or structurally unsound. if that happens, we'll reach out so you can adjust the design. a full guide on engineering pieces and design rules is coming soon in the sculptura docs and knowledge base, see the roadmap.
              </div>

              <div className="bg-card rounded-[20px] border border-border/50 shadow-paper overflow-hidden">
                {form.image_url && (
                  <div className="aspect-video overflow-hidden bg-secondary/30">
                    <img src={form.image_url} alt={form.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium tracking-wide lowercase text-foreground">{form.name}</h3>
                    {form.creator_handle && <p className="text-xs text-muted-foreground/60 tracking-wide mt-0.5">by {form.creator_handle}</p>}
                  </div>
                  {form.description && <p className="text-sm text-muted-foreground tracking-wide font-light leading-relaxed">{form.description}</p>}
                  {form.model_url && (
                    <div className="flex items-center gap-2 text-xs tracking-wide text-muted-foreground/60">
                      <Box className="w-3.5 h-3.5" />
                      3d model attached
                    </div>
                  )}
                  <div className="pt-2 border-t border-border/30 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground tracking-wide">
                      <span>offered in</span><span>{form.materials.join(", ")}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground tracking-wide">
                      <span>sizing</span>
                      <span>{form.size_type === "unisize" ? "one size only" : `${form.sizes.length} ${form.size_type === "ring" ? "ring " : ""}sizes (${form.sizes.join(", ")})`}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground tracking-wide">
                      <span>your earnings</span><span>${form.creator_earnings}</span>
                    </div>
                    <div className="pt-2 space-y-1">
                      {form.materials.map((m) => (
                        <div key={m} className="flex justify-between text-xs text-muted-foreground tracking-wide">
                          <span className="lowercase">{m}</span>
                          <span>${getFinalPrice(m, form.region, form.creator_earnings)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50">
                <div>
                  <p className="text-sm tracking-wide text-foreground">made to order</p>
                  <p className="text-[11px] text-muted-foreground/50 tracking-wide">crafted after each request</p>
                </div>
                <Switch checked={form.made_to_order} onCheckedChange={(v) => update("made_to_order", v)} />
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={back} className="rounded-full text-sm tracking-wider text-muted-foreground">back</Button>
                <Button
                  onClick={() => publishMutation.mutate(form)}
                  disabled={publishMutation.isPending}
                  className="flex-1 rounded-full py-6 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 shadow-paper"
                >
                  {publishMutation.isPending ? "submitting..." : "submit for review"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}