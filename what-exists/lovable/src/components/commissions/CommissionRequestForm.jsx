// commission request form.
//
// adaptive: standard fields up top (name / email / budget / timeline /
// intended use / description / references) + any custom intake
// questions defined by the creator. submitted requests insert directly
// into the commission_requests table - anyone can submit (rls allows
// anon insert), the creator sees them in their dashboard.
//
// honors the creator's terms: shows allowed-use chips, the min-budget
// floor, and any free-form terms they wrote. when the creator runs in
// demo-only mode (no real backend) the parent passes an `onSubmit`
// override that stores the request to localStorage instead.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, Check, X } from "lucide-react";
import { db } from "@/lib/db";

export default function CommissionRequestForm({ creator, onSubmit, onDone }) {
  const intake = Array.isArray(creator?.commission_intake_questions)
    ? creator.commission_intake_questions
    : [];
  const minBudget = creator?.commission_min_budget;

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    budget: "",
    timeline: "",
    intended_use: "personal",
    description: "",
    reference_urls: "",
    answers: {},
    accepted_terms: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const updateAnswer = (id, value) => update("answers", { ...form.answers, [id]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.accepted_terms) {
      toast.error("please accept the terms before submitting");
      return;
    }
    if (minBudget && form.budget && parseFloat(form.budget) < parseFloat(minBudget)) {
      toast.error(`minimum budget is $${minBudget}`);
      return;
    }
    for (const q of intake) {
      if (q.required && !form.answers[q.id]) {
        toast.error(`please answer: ${q.label}`);
        return;
      }
    }

    const payload = {
      creator_handle: creator.handle || creator.username,
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim(),
      budget: form.budget ? parseFloat(form.budget) : null,
      timeline: form.timeline,
      intended_use: form.intended_use,
      description: form.description.trim(),
      reference_urls: form.reference_urls
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean),
      answers: form.answers,
      status: "new",
    };

    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        await db.entities.CommissionRequest.create(payload);
      }
      toast.success("request sent - the creator will reach out");
      onDone?.();
    } catch (err) {
      toast.error(err.message || "could not send request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* terms summary */}
      <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4 space-y-3">
        <p className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">terms preview</p>
        <div className="flex flex-wrap gap-1.5">
          <RightChip allowed={creator.commission_allow_commercial} label="commercial use" />
          <RightChip allowed={creator.commission_allow_resell} label="reselling" />
          <RightChip allowed={creator.commission_allow_modifications} label="modifications" />
        </div>
        {minBudget && (
          <p className="text-[11px] text-muted-foreground/60 tracking-wide">
            minimum budget: <span className="text-foreground">${minBudget}</span>
          </p>
        )}
        {creator.commission_terms && (
          <p className="text-[12px] text-muted-foreground/70 tracking-wide leading-relaxed whitespace-pre-line">
            {creator.commission_terms}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="your name">
          <Input required value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} />
        </Field>
        <Field label="email">
          <Input required type="email" value={form.customer_email}
            onChange={(e) => update("customer_email", e.target.value)} />
        </Field>
        <Field label={`budget (usd${minBudget ? `, min $${minBudget}` : ""})`}>
          <Input type="number" min={minBudget || 0} value={form.budget}
            onChange={(e) => update("budget", e.target.value)} />
        </Field>
        <Field label="timeline">
          <Input placeholder="e.g. by june" value={form.timeline}
            onChange={(e) => update("timeline", e.target.value)} />
        </Field>
      </div>

      <Field label="intended use">
        <div className="flex flex-wrap gap-2">
          {["personal", "gift", "commercial", "resale", "exhibition"].map((opt) => {
            const active = form.intended_use === opt;
            // disable disallowed uses based on creator terms
            const disabled =
              (opt === "commercial" && creator.commission_allow_commercial === false) ||
              (opt === "resale" && creator.commission_allow_resell === false);
            return (
              <button
                type="button"
                key={opt}
                disabled={disabled}
                onClick={() => update("intended_use", opt)}
                className={`px-3 py-1.5 rounded-full text-[11px] tracking-wider border transition-all ${
                  active
                    ? "bg-foreground text-background border-foreground"
                    : disabled
                    ? "border-border/40 text-muted-foreground/30 cursor-not-allowed line-through"
                    : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="describe what you'd like made">
        <Textarea required rows={4} value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="materials, dimensions, style, references, occasion." />
      </Field>

      <Field label="reference links (one per line)">
        <Textarea rows={2} value={form.reference_urls}
          onChange={(e) => update("reference_urls", e.target.value)}
          placeholder="https://..." />
      </Field>

      {intake.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-border/40 p-4">
          <p className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">
            from {creator.display_name || creator.handle || creator.username}
          </p>
          {intake.map((q) => (
            <Field key={q.id} label={`${q.label}${q.required ? " *" : ""}`}>
              <Input
                required={q.required}
                value={form.answers[q.id] || ""}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
              />
            </Field>
          ))}
        </div>
      )}

      <label className="flex items-start gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.accepted_terms}
          onChange={(e) => update("accepted_terms", e.target.checked)}
          className="mt-1 accent-foreground"
        />
        <span className="text-[12px] text-muted-foreground tracking-wide leading-relaxed">
          i've read and agree to the terms above.
        </span>
      </label>

      <Button type="submit" disabled={submitting}
        className="w-full rounded-full py-5 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5">
        <Send className="w-3.5 h-3.5" />
        {submitting ? "sending..." : "send commission request"}
      </Button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">{label}</Label>
      <div className="[&>input]:rounded-xl [&>input]:bg-background [&>input]:border-border/60 [&>input]:text-sm [&>input]:tracking-wide [&>textarea]:rounded-xl [&>textarea]:bg-background [&>textarea]:border-border/60 [&>textarea]:text-sm [&>textarea]:tracking-wide">
        {children}
      </div>
    </div>
  );
}

function RightChip({ allowed, label }) {
  return (
    <Badge variant="outline" className={`rounded-full text-[10px] tracking-wider gap-1 ${
      allowed ? "border-moss text-moss" : "border-clay text-clay"
    }`}>
      {allowed ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
      {label}
    </Badge>
  );
}
