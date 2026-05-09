import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface Counselor {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  image_url: string | null;
  email: string | null;
  phone: string | null;
  specialties: string[] | null;
  display_order: number;
  active: boolean;
}

const empty: Partial<Counselor> = { name: "", title: "", bio: "", image_url: "", email: "", phone: "", specialties: [], display_order: 0, active: true };

const AdminCounselors = () => {
  const [items, setItems] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Counselor> | null>(null);
  const [specialtiesText, setSpecialtiesText] = useState("");

  const fetchItems = async () => {
    const { data } = await supabase.from("counselors").select("*").order("display_order");
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openNew = () => { setEditing({ ...empty }); setSpecialtiesText(""); };
  const openEdit = (c: Counselor) => { setEditing(c); setSpecialtiesText((c.specialties || []).join(", ")); };

  const save = async () => {
    if (!editing?.name || !editing?.title) { toast.error("Name and title are required"); return; }
    const payload = {
      name: editing.name!,
      title: editing.title!,
      bio: editing.bio || null,
      image_url: editing.image_url || null,
      email: editing.email || null,
      phone: editing.phone || null,
      specialties: specialtiesText.split(",").map((s) => s.trim()).filter(Boolean),
      display_order: Number(editing.display_order) || 0,
      active: editing.active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("counselors").update(payload).eq("id", editing.id)
      : await supabase.from("counselors").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setEditing(null);
    fetchItems();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this counselor?")) return;
    const { error } = await supabase.from("counselors").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    fetchItems();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Counselors / Coaches</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Add Counselor
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <div key={c.id} className="bg-card rounded-xl border border-border p-5">
            <div className="flex gap-3">
              {c.image_url ? (
                <img src={c.image_url} alt={c.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-lg font-semibold text-muted-foreground">{c.name.charAt(0)}</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.title}</p>
                {!c.active && <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">Inactive</span>}
              </div>
            </div>
            {c.bio && <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{c.bio}</p>}
            {c.specialties && c.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {c.specialties.map((s) => <span key={s} className="text-xs px-2 py-0.5 rounded bg-secondary text-foreground">{s}</span>)}
              </div>
            )}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <button onClick={() => openEdit(c)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-secondary text-foreground hover:bg-secondary/80">
                <Pencil size={12} /> Edit
              </button>
              <button onClick={() => remove(c.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No counselors yet. Add one to get started.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-heading font-semibold text-foreground">{editing.id ? "Edit" : "Add"} Counselor</h2>
              <button onClick={() => setEditing(null)} className="p-1 rounded hover:bg-secondary"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              {[
                ["name", "Full Name *", "text"],
                ["title", "Title / Role *", "text"],
                ["email", "Email", "email"],
                ["phone", "Phone", "tel"],
                ["image_url", "Image URL", "url"],
                ["display_order", "Display Order", "number"],
              ].map(([key, label, type]) => (
                <div key={key}>
                  <label className="text-xs font-medium text-muted-foreground">{label}</label>
                  <input type={type} value={(editing as any)[key] ?? ""} onChange={(e) => setEditing({ ...editing, [key]: type === "number" ? Number(e.target.value) : e.target.value })} className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-sm" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Bio</label>
                <textarea value={editing.bio || ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} rows={4} className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Specialties (comma separated)</label>
                <input value={specialtiesText} onChange={(e) => setSpecialtiesText(e.target.value)} className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.active ?? true} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
                <span className="text-foreground">Active (visible publicly)</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-border">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm bg-secondary text-foreground">Cancel</button>
              <button onClick={save} className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCounselors;
