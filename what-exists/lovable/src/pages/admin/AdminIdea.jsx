// /admin/idea. an obsidian-style markdown notebook for working through
// manufacturing decisions. left rail lists every note, right pane is a
// split editor + live preview. notes persist in `admin_ideas`.
//
// the page seeds itself with the current production plan (lost wax casting
// from castable resin / wax 3d prints, with sand-cast fallback) so an admin
// always lands on real context instead of an empty surface.

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, FileText, Save, Eye, Pencil } from "lucide-react";

const SEED_NOTE = {
  title: "current plan: lost wax metal casting",
  tags: ["manufacturing", "core-plan"],
  content: `# current production plan

we cast every artifact using **lost wax casting**, the same technique
goldsmiths and sculptors have used for thousands of years. modernised with
3d printing on the front end.

## pipeline

1. **creator submits cad model** (stl / step / obj)
2. **review queue** validates printability and sets a manufacturing cost
3. **3d print the pattern** in one of:
   - castable wax resin (best surface, best detail)
   - castable photopolymer resin (cheaper, slightly more cleanup)
4. **invest the pattern** in plaster or sand depending on piece size
5. **burn out the wax/resin** in a kiln, leaving a hollow cavity
6. **pour molten metal** (silver, brass, bronze, gold) into the cavity
7. **break out, cut sprues, file, polish, finish**
8. **qc, package, ship**

## why lost wax over direct metal printing

| factor | lost wax (our choice) | direct metal printing (dmls/sla metal) |
|---|---|---|
| surface quality | excellent after polish | grainy, needs heavy post-processing |
| metal options | almost any alloy | limited (mostly steel, ti, some precious) |
| unit cost at low volume | low | very high |
| detail at jewelry scale | excellent | good but costly |
| precious metals (au, ag) | trivial | rare and expensive |

direct metal makes sense for industrial parts. for wearable artifacts at
indie volumes lost wax wins on price, finish, and metal selection.

## sand casting fallback

for larger sculptural pieces where investment casting becomes expensive
(over ~250g of metal) we fall back to **sand casting** from the same 3d
printed pattern. the pattern is pressed into bonded sand, removed, and
metal is poured in. lower detail, much cheaper for big pieces.

## things to figure out next

- per-manufacturer capability matrix (which alloys, which sizes, which
  finishes) lives in /admin/manufacturers
- routing logic: small jewelry → investment partner, large pieces →
  sand-cast partner
- bring-your-own-stone flow: ship un-set piece + setting prep notes to
  buyer's local jeweler (see creator-docs)
`,
};

function NoteListItem({ note, active, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
        active ? "bg-foreground text-background" : "hover:bg-secondary text-foreground"
      }`}
    >
      <div className="flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 shrink-0 opacity-60" />
        <div className="text-xs lowercase truncate">{note.title || "untitled"}</div>
      </div>
      {note.tags?.length > 0 && (
        <div className="mt-1 ml-5 flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((t) => (
            <span key={t} className={`text-[9px] tracking-wider px-1.5 py-0.5 rounded ${active ? "bg-background/10" : "bg-secondary"}`}>{t}</span>
          ))}
        </div>
      )}
    </button>
  );
}

export default function AdminIdea() {
  const { toast } = useToast();
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState({ title: "", content: "", tags: [] });
  const [tagInput, setTagInput] = useState("");
  const [mode, setMode] = useState("split"); // edit | preview | split
  const [saving, setSaving] = useState(false);

  // initial fetch + seed if empty
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("admin_ideas")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) {
        toast({ title: "could not load notes", description: error.message, variant: "destructive" });
        return;
      }
      if (!data || data.length === 0) {
        const { data: inserted } = await supabase
          .from("admin_ideas")
          .insert(SEED_NOTE)
          .select()
          .single();
        if (inserted) {
          setNotes([inserted]);
          setActiveId(inserted.id);
          setDraft({ title: inserted.title, content: inserted.content, tags: inserted.tags || [] });
        }
      } else {
        setNotes(data);
        setActiveId(data[0].id);
        setDraft({ title: data[0].title, content: data[0].content, tags: data[0].tags || [] });
      }
    })();
  }, [toast]);

  const activeNote = useMemo(() => notes.find((n) => n.id === activeId), [notes, activeId]);

  const selectNote = (id) => {
    const n = notes.find((x) => x.id === id);
    if (!n) return;
    setActiveId(id);
    setDraft({ title: n.title, content: n.content, tags: n.tags || [] });
  };

  const createNote = async () => {
    const { data, error } = await supabase
      .from("admin_ideas")
      .insert({ title: "untitled", content: "", tags: [] })
      .select()
      .single();
    if (error) {
      toast({ title: "could not create note", description: error.message, variant: "destructive" });
      return;
    }
    setNotes((prev) => [data, ...prev]);
    setActiveId(data.id);
    setDraft({ title: data.title, content: data.content, tags: [] });
  };

  const saveNote = async () => {
    if (!activeId) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("admin_ideas")
      .update({ title: draft.title, content: draft.content, tags: draft.tags })
      .eq("id", activeId)
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast({ title: "save failed", description: error.message, variant: "destructive" });
      return;
    }
    setNotes((prev) => prev.map((n) => (n.id === activeId ? data : n)));
    toast({ title: "saved" });
  };

  const deleteNote = async () => {
    if (!activeId) return;
    if (!confirm("delete this note?")) return;
    const { error } = await supabase.from("admin_ideas").delete().eq("id", activeId);
    if (error) {
      toast({ title: "delete failed", description: error.message, variant: "destructive" });
      return;
    }
    const remaining = notes.filter((n) => n.id !== activeId);
    setNotes(remaining);
    if (remaining.length > 0) {
      setActiveId(remaining[0].id);
      setDraft({ title: remaining[0].title, content: remaining[0].content, tags: remaining[0].tags || [] });
    } else {
      setActiveId(null);
      setDraft({ title: "", content: "", tags: [] });
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || draft.tags.includes(t)) return;
    setDraft((d) => ({ ...d, tags: [...d.tags, t] }));
    setTagInput("");
  };

  const removeTag = (t) => setDraft((d) => ({ ...d, tags: d.tags.filter((x) => x !== t) }));

  return (
    <AdminLayout title="idea notebook" subtitle="markdown scratchpad for manufacturing, routing, and product thinking">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
        {/* sidebar */}
        <aside className="bg-card border border-border/50 rounded-[16px] p-3 h-fit md:sticky md:top-6">
          <Button onClick={createNote} className="w-full rounded-full mb-3 text-xs" size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> new note
          </Button>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
            {notes.map((n) => (
              <NoteListItem key={n.id} note={n} active={n.id === activeId} onSelect={() => selectNote(n.id)} />
            ))}
            {notes.length === 0 && (
              <p className="text-xs text-muted-foreground px-2 py-4">no notes yet</p>
            )}
          </div>
        </aside>

        {/* editor */}
        <section className="bg-card border border-border/50 rounded-[16px] p-5 min-w-0">
          {!activeNote ? (
            <p className="text-sm text-muted-foreground">select or create a note.</p>
          ) : (
            <>
              <Input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="note title"
                className="text-lg font-serif border-0 px-0 focus-visible:ring-0 mb-3"
              />

              {/* tags */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {draft.tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => removeTag(t)}
                    className="text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-secondary hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    {t} ×
                  </button>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="add tag..."
                  className="text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-transparent border border-border/40 outline-none focus:border-foreground/30 w-24"
                />
              </div>

              {/* mode toggle + actions */}
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="inline-flex rounded-full border border-border/60 p-0.5 text-[10px] tracking-wider lowercase">
                  {[
                    { id: "edit", icon: Pencil, label: "edit" },
                    { id: "split", icon: null, label: "split" },
                    { id: "preview", icon: Eye, label: "preview" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`px-3 py-1 rounded-full transition-colors ${mode === m.id ? "bg-foreground text-background" : "text-muted-foreground"}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={deleteNote} className="text-xs text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> delete
                  </Button>
                  <Button onClick={saveNote} disabled={saving} size="sm" className="rounded-full text-xs">
                    <Save className="w-3.5 h-3.5 mr-1" /> {saving ? "saving..." : "save"}
                  </Button>
                </div>
              </div>

              <div className={`grid gap-4 ${mode === "split" ? "md:grid-cols-2" : "grid-cols-1"}`}>
                {mode !== "preview" && (
                  <Textarea
                    value={draft.content}
                    onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                    placeholder="write markdown..."
                    className="min-h-[60vh] font-mono text-xs leading-relaxed"
                  />
                )}
                {mode !== "edit" && (
                  <div className="prose prose-sm dark:prose-invert max-w-none min-h-[60vh] p-4 rounded-lg bg-background/40 border border-border/40 overflow-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {draft.content || "*nothing here yet*"}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
