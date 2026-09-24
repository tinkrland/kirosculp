// commission settings editor.
//
// extends the simple commissions toggle with:
//   - long-form intro text shown on the public commission page
//   - terms (commercial use / reselling / modifications) shown to buyers
//   - a min-budget gate so creators can avoid lowball requests
//   - a customizable list of intake questions appended to the request form
//
// works for both market_account creators (writes via the store-update
// edge function) and live creator_profiles (writes directly to the
// creator_profiles row via supabase). the parent component picks which
// save handler to pass in.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Plus, Trash2 } from "lucide-react";

export default function CommissionTermsEditor({ initial = {}, onSave, hasMarketAccount = true }) {
  const [form, setForm] = useState({
    commission_open: initial.commission_open ?? false,
    hourly_rate: initial.hourly_rate ?? "",
    turnaround_time: initial.turnaround_time ?? "",
    rush_available: initial.rush_available ?? false,
    commission_min_budget: initial.commission_min_budget ?? "",
    commission_intro: initial.commission_intro ?? "",
    commission_terms: initial.commission_terms ?? "",
    commission_allow_commercial: initial.commission_allow_commercial ?? false,
    commission_allow_resell: initial.commission_allow_resell ?? false,
    commission_allow_modifications: initial.commission_allow_modifications ?? true,
    commission_intake_questions: Array.isArray(initial.commission_intake_questions)
      ? initial.commission_intake_questions
      : [],
  });
  const [saving, setSaving] = useState(false);

  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const addQuestion = () => {
    update("commission_intake_questions", [
      ...form.commission_intake_questions,
      { id: crypto.randomUUID(), label: "", required: false },
    ]);
  };
  const updateQuestion = (idx, patch) => {
    const next = form.commission_intake_questions.map((q, i) => (i === idx ? { ...q, ...patch } : q));
    update("commission_intake_questions", next);
  };
  const removeQuestion = (idx) => {
    update("commission_intake_questions", form.commission_intake_questions.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // strip empty question labels - those are noise
      const cleaned = {
        ...form,
        hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
        commission_min_budget: form.commission_min_budget ? parseFloat(form.commission_min_budget) : null,
        commission_intake_questions: form.commission_intake_questions
          .filter((q) => q.label && q.label.trim().length > 0)
          .map((q) => ({ id: q.id, label: q.label.trim(), required: !!q.required })),
      };
      await onSave(cleaned);
      toast.success("commission settings saved");
    } catch (e) {
      toast.error(e.message || "could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">commissions</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm tracking-wide text-foreground">accept commissions</p>
            <p className="text-[11px] text-muted-foreground/40 tracking-wide">
              show a request form on your shop page
            </p>
          </div>
          <Switch checked={form.commission_open} onCheckedChange={(v) => update("commission_open", v)} />
        </div>

        {form.commission_open && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="hourly rate (usd)">
                <Input type="number" placeholder="e.g. 80" value={form.hourly_rate}
                  onChange={(e) => update("hourly_rate", e.target.value)} />
              </Field>
              <Field label="turnaround">
                <Input placeholder="e.g. 2-3 weeks" value={form.turnaround_time}
                  onChange={(e) => update("turnaround_time", e.target.value)} />
              </Field>
              <Field label="minimum budget (usd)">
                <Input type="number" placeholder="e.g. 250" value={form.commission_min_budget}
                  onChange={(e) => update("commission_min_budget", e.target.value)} />
              </Field>
              <div className="flex items-end">
                <label className="flex items-center justify-between w-full">
                  <span className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">rush available</span>
                  <Switch checked={form.rush_available} onCheckedChange={(v) => update("rush_available", v)} />
                </label>
              </div>
            </div>

            <Field label="intro shown on commission page">
              <Textarea
                placeholder="a short paragraph about what kind of work you take on."
                value={form.commission_intro}
                onChange={(e) => update("commission_intro", e.target.value)}
                className="min-h-[80px]"
              />
            </Field>
          </>
        )}
      </div>

      {form.commission_open && (
        <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
          <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">terms & rights</p>

          <ToggleRow
            label="commercial use allowed"
            hint="buyer can use the work for commercial projects"
            value={form.commission_allow_commercial}
            onChange={(v) => update("commission_allow_commercial", v)}
          />
          <ToggleRow
            label="reselling allowed"
            hint="buyer can resell physical or digital copies"
            value={form.commission_allow_resell}
            onChange={(v) => update("commission_allow_resell", v)}
          />
          <ToggleRow
            label="modifications allowed"
            hint="buyer can modify the work after delivery"
            value={form.commission_allow_modifications}
            onChange={(v) => update("commission_allow_modifications", v)}
          />

          <Field label="additional terms (optional)">
            <Textarea
              placeholder="payment terms, revision rounds, anything else collectors should agree to."
              value={form.commission_terms}
              onChange={(e) => update("commission_terms", e.target.value)}
              className="min-h-[100px]"
            />
          </Field>
        </div>
      )}

      {form.commission_open && (
        <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">intake questions</p>
            <Button onClick={addQuestion} size="sm" variant="ghost"
              className="text-[11px] tracking-wider gap-1.5 rounded-full">
              <Plus className="w-3 h-3" /> add question
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground/40 tracking-wide">
            these are added to the standard request form. ask whatever helps you scope the job.
          </p>

          {form.commission_intake_questions.length === 0 && (
            <p className="text-[12px] text-muted-foreground/40 tracking-wide italic">
              no custom questions yet.
            </p>
          )}

          <div className="space-y-2">
            {form.commission_intake_questions.map((q, idx) => (
              <div key={q.id} className="flex items-center gap-2">
                <Input
                  value={q.label}
                  placeholder="e.g. preferred material?"
                  onChange={(e) => updateQuestion(idx, { label: e.target.value })}
                  className="rounded-xl bg-background border-border/60 text-sm tracking-wide flex-1"
                />
                <label className="flex items-center gap-1.5 px-2">
                  <Switch checked={!!q.required} onCheckedChange={(v) => updateQuestion(idx, { required: v })} />
                  <span className="text-[10px] tracking-widest uppercase text-muted-foreground/50">required</span>
                </label>
                <button onClick={() => removeQuestion(idx)} className="p-2 text-muted-foreground/40 hover:text-foreground">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={handleSave} disabled={saving}
        className="rounded-full px-5 py-5 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5">
        <Save className="w-3.5 h-3.5" />
        {saving ? "saving..." : "save commission settings"}
      </Button>

      {!hasMarketAccount && (
        <p className="text-[11px] text-muted-foreground/40 tracking-wide">
          saved to your creator profile.
        </p>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">{label}</Label>
      <div className="[&>input]:rounded-xl [&>input]:bg-background [&>input]:border-border/60 [&>input]:text-sm [&>input]:tracking-wide [&>textarea]:rounded-xl [&>textarea]:bg-background [&>textarea]:border-border/60 [&>textarea]:text-sm [&>textarea]:tracking-wide">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ label, hint, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm tracking-wide text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground/40 tracking-wide">{hint}</p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
