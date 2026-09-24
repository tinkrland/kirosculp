import { db } from '@/lib/db';
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { hashKey, generateAccessKey } from "@/lib/crypto";

const STEP_LABELS = ["identity", "contact", "your key"];

const stepVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export default function CreateAccount() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [keyCopied, setKeyCopied] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");

  const [form, setForm] = useState({
    handle: "",
    display_name: "",
    bio: "",
    email: "",
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const createAccountMutation = useMutation({
    mutationFn: async () => {
      // check handle uniqueness before creating
      const existing = await db.entities.MarketAccount.filter({ handle: form.handle });
      if (existing?.length > 0) {
        throw new Error("handle_taken");
      }

      const rawKey = generateAccessKey();
      setGeneratedKey(rawKey);

      const keyHash = await hashKey(rawKey);

      return db.entities.MarketAccount.create({
        handle: form.handle,
        slug: form.handle,
        display_name: form.display_name,
        bio: form.bio,
        email: form.email,
        access_key_hash: keyHash,
        status: "draft",
      });
    },
    onSuccess: () => {
      setStep(2);
    },
    onError: (error) => {
      if (error.message === "handle_taken") {
        toast.error("that handle is already taken");
        setStep(0);
      } else {
        toast.error("something went wrong. try again.");
      }
    },
  });

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const goToStep1 = () => {
    if (!form.handle) { toast.error("choose a handle"); return; }
    setStep(1);
  };

  const goToCreate = () => {
    if (!form.email) { toast.error("enter your email"); return; }
    createAccountMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p className="font-wordmark text-lg text-muted-foreground/40 mb-12 text-center">sculptura</p>

        {/* step indicator */}
        <div className="flex items-center gap-3 mb-10">
          {STEP_LABELS.map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center transition-all ${
                index <= step ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
              }`}>
                {index < step ? <Check className="w-2.5 h-2.5" /> : index + 1}
              </div>
              <span className={`text-[11px] tracking-wider lowercase ${index === step ? "text-foreground" : "text-muted-foreground/40"}`}>
                {label}
              </span>
              {index < STEP_LABELS.length - 1 && <div className="w-6 h-px bg-border/40" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* step 0 - identity */}
          {step === 0 && (
            <motion.div key="identity" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-7">
              <div>
                <h1 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground mb-1">create your account</h1>
                <p className="text-sm text-muted-foreground tracking-wide font-light">your public identity on sculptura</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">handle</Label>
                  <div className="flex items-center rounded-xl border border-border/60 bg-card overflow-hidden">
                    <span className="px-3 py-2 text-xs text-muted-foreground/40 tracking-wide bg-secondary/40 border-r border-border/40 whitespace-nowrap">sculptura.shop/</span>
                    <input
                      className="flex-1 px-3 py-2 text-sm tracking-wide bg-transparent focus:outline-none text-foreground"
                      placeholder="yourname"
                      value={form.handle}
                      onChange={(e) => update("handle", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">display name</Label>
                  <Input
                    placeholder="e.g. kai"
                    value={form.display_name}
                    onChange={(e) => update("display_name", e.target.value)}
                    className="rounded-xl bg-card border-border/60 text-sm tracking-wide"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">bio</Label>
                  <Textarea
                    placeholder="a few words about your work..."
                    value={form.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    className="rounded-xl bg-card border-border/60 text-sm tracking-wide min-h-[80px]"
                  />
                </div>
              </div>

              <Button onClick={goToStep1} className="w-full rounded-full py-6 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-2">
                continue <ArrowRight className="w-4 h-4" />
              </Button>

              <p className="text-center text-xs text-muted-foreground/40 tracking-wide">
                already have an account?{" "}
                <Link to="/store/access" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  sign in with your key
                </Link>
              </p>
            </motion.div>
          )}

          {/* step 1 - contact */}
          {step === 1 && (
            <motion.div key="contact" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-7">
              <div>
                <h1 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground mb-1">contact details</h1>
                <p className="text-sm text-muted-foreground tracking-wide font-light">used for order notifications only</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">email</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="rounded-xl bg-card border-border/60 text-sm tracking-wide"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(0)} className="rounded-full text-sm tracking-wider text-muted-foreground">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={goToCreate}
                  disabled={createAccountMutation.isPending}
                  className="flex-1 rounded-full py-5 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-2"
                >
                  {createAccountMutation.isPending ? "creating..." : "create account"}
                  {!createAccountMutation.isPending && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </motion.div>
          )}

          {/* step 2 - key reveal */}
          {step === 2 && (
            <motion.div key="key" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-7">
              <div>
                <h1 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground mb-1">save your access key</h1>
                <p className="text-sm text-muted-foreground tracking-wide font-light leading-relaxed">
                  this is the only time you will see this key. copy it and keep it somewhere safe. it cannot be recovered.
                </p>
              </div>

              <div className="bg-card rounded-[18px] border border-border/60 p-5 space-y-4">
                <p className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">your key</p>
                <p className="font-mono text-sm tracking-wider text-foreground break-all">{generatedKey}</p>
                <button
                  onClick={copyKey}
                  className="flex items-center gap-2 text-xs tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  {keyCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {keyCopied ? "copied" : "copy key"}
                </button>
              </div>

              <div className="bg-secondary/40 rounded-xl border border-border/40 p-4">
                <p className="text-xs text-muted-foreground/60 tracking-wide leading-relaxed">
                  your account is in draft mode. when you are ready, go to your dashboard and submit it for review. accounts go through a manual review before going live.
                </p>
              </div>

              <Button
                onClick={() => navigate(`/store/dashboard?handle=${form.handle}&key=${generatedKey}`)}
                className="w-full rounded-full py-6 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90"
              >
                go to my dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}