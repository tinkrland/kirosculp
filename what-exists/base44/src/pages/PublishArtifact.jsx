import { useState } from "react";
import { Artifacts } from "@/api/db";
import { uploadFile } from "@/api/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, Upload, X, Box, Check } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MATERIALS, REGIONS, getMfgCost, getFinalPrice, DELIVERY_ESTIMATES } from "@/lib/pricing";

const CATEGORIES = ["jewelry", "sculpture", "functional", "wearable", "decorative", "experimental"];
const STEPS = ["upload design", "material", "audience", "your earnings", "submit"];

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
    specs: "",
    creator_handle: "",
    image_url: "",
    model_url: "",
    material: "silver",
    region: "europe",
    creator_earnings: 30,
    made_to_order: true,
  });

  const update = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const mfgCost = getMfgCost(form.material, form.region);
  const finalPrice = getFinalPrice(form.material, form.region, form.creator_earnings);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileUrl = await uploadFile(file);
    update("image_url", fileUrl);
  };

  const handleModelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileUrl = await uploadFile(file);
    update("model_url", fileUrl);
  };

  const publishMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        name: data.name,
        description: data.description,
        category: data.category,
        specs: data.specs,
        creator_handle: data.creator_handle,
        image_url: data.image_url,
        model_url: data.model_url,
        made_to_order: data.made_to_order,
        region: data.region,
        materials: [data.material],
        manufacturing_costs: { [data.material]: mfgCost },
        creator_earnings: { [data.material]: data.creator_earnings },
        prices: { [data.material]: finalPrice },
        status: "pending_review",
      };
      return Artifacts.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-artifacts"] });
      toast.success("design submitted for review");
      navigate("/dashboard");
    },
  });

  const next = () => {
    if (step === 0 && !form.name.trim()) { toast.error("give your artifact a name"); return; }
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
          {/* STEP 0 — Upload design */}
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

              {/* Category & specs */}
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

              <div className="space-y-2">
                <Label className="text-xs tracking-wider text-muted-foreground/60 uppercase">your handle</Label>
                <Input placeholder="e.g. kai" value={form.creator_handle} onChange={(e) => update("creator_handle", e.target.value)} className="rounded-xl bg-card border-border/60 text-sm tracking-wide" />
              </div>

              <Button onClick={next} className="w-full rounded-full py-6 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-2">
                continue <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* STEP 1 — Material */}
          {step === 1 && (
            <motion.div key="s1" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-7">
              <div>
                <h2 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground mb-1">choose material</h2>
                <p className="text-sm text-muted-foreground tracking-wide font-light">this determines manufacturing cost and character</p>
              </div>

              <div className="space-y-3">
                {MATERIALS.map((mat) => (
                  <button
                    key={mat}
                    onClick={() => update("material", mat)}
                    className={`w-full flex items-center justify-between p-5 rounded-[18px] border text-left transition-all ${
                      form.material === mat
                        ? "border-foreground bg-foreground/5 shadow-paper"
                        : "border-border/50 bg-card hover:border-foreground/20"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium tracking-wide lowercase text-foreground">{mat}</p>
                      <p className="text-xs text-muted-foreground/60 tracking-wide mt-0.5">
                        {mat === "silver" && "cool, versatile. most popular"}
                        {mat === "brass" && "warm, architectural feel"}
                        {mat === "gold" && "precious, statement pieces"}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      form.material === mat ? "border-foreground" : "border-border"
                    }`}>
                      {form.material === mat && <div className="w-2.5 h-2.5 rounded-full bg-foreground" />}
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

          {/* STEP 2 — Region */}
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

          {/* STEP 3 — Creator earnings */}
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
                  {form.material}, {form.region.replace("_", " ")}, {DELIVERY_ESTIMATES[form.region]}
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

          {/* STEP 4 — Review */}
          {step === 4 && (
            <motion.div key="s4" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-7">
              <div>
                <h2 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground mb-1">submit for review</h2>
                <p className="text-sm text-muted-foreground tracking-wide font-light">the sculptura team will review your design, provide a manufacturing quote, and publish it to the marketplace.</p>
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
                      <span>material</span><span>{form.material}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground tracking-wide">
                      <span>manufacturing cost</span><span>${mfgCost}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground tracking-wide">
                      <span>your earnings</span><span>${form.creator_earnings}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium tracking-wide text-foreground">
                      <span>final price</span><span>${finalPrice}</span>
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