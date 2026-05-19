import { useEffect, useState } from "react";
import { Trash2, Upload, Edit2, Eye, EyeOff, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  kind: "worksheet" | "reading" | "prayer-journal";
  file_path: string;
  active: boolean;
  display_order: number;
  downloads_count: number;
  created_at: string;
}

const KINDS = ["worksheet", "reading", "prayer-journal"] as const;
const CATEGORIES = [
  "Marriage & Family",
  "Trauma & Grief",
  "Anxiety & Depression",
  "Spiritual Growth",
  "Leadership",
  "General",
];

const AdminResources = () => {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    kind: "worksheet" as Resource["kind"],
    active: true,
    display_order: 0,
  });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setItems((data as Resource[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFile(null);
    setForm({ title: "", description: "", category: CATEGORIES[0], kind: "worksheet", active: true, display_order: 0 });
    setShowForm(true);
  };

  const openEdit = (r: Resource) => {
    setEditing(r);
    setFile(null);
    setForm({
      title: r.title,
      description: r.description ?? "",
      category: r.category,
      kind: r.kind,
      active: r.active,
      display_order: r.display_order,
    });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      let file_path = editing?.file_path ?? "";
      let file_size_bytes: number | null = null;
      let mime_type: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop() ?? "bin";
        const key = `${form.kind}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("resources").upload(key, file, {
          contentType: file.type,
          upsert: false,
        });
        if (upErr) throw upErr;
        file_path = key;
        file_size_bytes = file.size;
        mime_type = file.type;
      }

      if (!editing && !file) {
        toast({ title: "File required", description: "Upload a file for new resources.", variant: "destructive" });
        setBusy(false);
        return;
      }

      const payload: any = { ...form, file_path };
      if (file_size_bytes !== null) payload.file_size_bytes = file_size_bytes;
      if (mime_type) payload.mime_type = mime_type;

      if (editing) {
        const { error } = await supabase.from("resources").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Resource updated" });
      } else {
        const { error } = await supabase.from("resources").insert(payload);
        if (error) throw error;
        toast({ title: "Resource created" });
      }
      setShowForm(false);
      await load();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (r: Resource) => {
    const { error } = await supabase.from("resources").update({ active: !r.active }).eq("id", r.id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else load();
  };

  const remove = async (r: Resource) => {
    if (!confirm(`Delete "${r.title}"?`)) return;
    await supabase.storage.from("resources").remove([r.file_path]).catch(() => {});
    const { error } = await supabase.from("resources").delete().eq("id", r.id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Resources</h1>
          <p className="text-muted-foreground text-sm">Upload, categorize, and publish downloadable resources.</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90">
          + New Resource
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Downloads</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No resources yet.</td></tr>
              ) : items.map(r => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3 capitalize">{r.kind.replace("-", " ")}</td>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3">{r.downloads_count}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${r.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                      {r.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => toggleActive(r)} className="p-2 hover:bg-secondary rounded" title={r.active ? "Deactivate" : "Activate"}>
                        {r.active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => openEdit(r)} className="p-2 hover:bg-secondary rounded" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => remove(r)} className="p-2 hover:bg-secondary rounded text-destructive" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-xl border border-border max-w-lg w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">{editing ? "Edit Resource" : "New Resource"}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background" maxLength={200} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background" rows={3} maxLength={1000} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Type *</label>
                  <select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value as any })}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background">
                    {KINDS.map(k => <option key={k} value={k}>{k.replace("-", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">File {editing ? "(leave empty to keep current)" : "*"}</label>
                <div className="mt-1 flex items-center gap-2">
                  <label className="flex-1 cursor-pointer border border-dashed border-border rounded-lg px-3 py-2 text-sm flex items-center gap-2 hover:bg-secondary">
                    <Upload size={16} />
                    <span className="truncate">{file ? file.name : editing?.file_path ?? "Select file"}</span>
                    <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Display order</label>
                  <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background" />
                </div>
                <label className="flex items-end gap-2 pb-2">
                  <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                  <span className="text-sm">Active (visible publicly)</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm">Cancel</button>
                <button disabled={busy} type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
                  {busy ? "Saving…" : editing ? "Save changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResources;
