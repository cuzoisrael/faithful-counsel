import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, GripVertical } from "lucide-react";

interface Field {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "date";
  required?: boolean;
  options?: string[];
  placeholder?: string;
}
interface Template {
  id: string;
  counselor_id: string | null;
  name: string;
  description: string | null;
  schema: Field[];
  active: boolean;
}

const blank: Partial<Template> = { name: "", description: "", schema: [], active: true, counselor_id: null };

const AdminIntakeForms = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [counselors, setCounselors] = useState<{ id: string; name: string }[]>([]);
  const [editing, setEditing] = useState<Partial<Template> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("intake_form_templates").select("*").order("created_at", { ascending: false });
    setTemplates((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    supabase.from("counselors").select("id, name").eq("active", true).then(({ data }) => setCounselors(data || []));
  }, []);

  const save = async () => {
    if (!editing?.name) return toast.error("Name required");
    const payload = {
      name: editing.name,
      description: editing.description || null,
      counselor_id: editing.counselor_id || null,
      schema: editing.schema || [],
      active: editing.active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("intake_form_templates").update(payload).eq("id", editing.id)
      : await supabase.from("intake_form_templates").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this form?")) return;
    await supabase.from("intake_form_templates").delete().eq("id", id);
    load();
  };

  const addField = () => {
    const schema = [...(editing?.schema || []), { key: `field_${Date.now()}`, label: "New Field", type: "text" as const, required: false }];
    setEditing({ ...editing, schema });
  };
  const updateField = (i: number, patch: Partial<Field>) => {
    const schema = [...(editing?.schema || [])];
    schema[i] = { ...schema[i], ...patch };
    setEditing({ ...editing, schema });
  };
  const removeField = (i: number) => {
    const schema = [...(editing?.schema || [])];
    schema.splice(i, 1);
    setEditing({ ...editing, schema });
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Custom Intake Forms</h1>
        <button onClick={() => setEditing({ ...blank })} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
          <Plus size={16} /> New Form
        </button>
      </div>

      <div className="grid gap-3">
        {templates.map((t) => (
          <div key={t.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{t.name} {!t.active && <span className="text-xs text-muted-foreground">(inactive)</span>}</p>
              <p className="text-xs text-muted-foreground">{(t.schema || []).length} fields {t.counselor_id ? "· assigned to counselor" : "· shared"}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(t)} className="text-xs px-3 py-1.5 rounded bg-secondary"><Pencil size={12} /></button>
              <button onClick={() => remove(t.id)} className="text-xs px-3 py-1.5 rounded bg-destructive/10 text-destructive"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
        {templates.length === 0 && <p className="text-muted-foreground text-center py-8">No custom forms yet.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-heading font-semibold">{editing.id ? "Edit" : "New"} Form</h2>
              <button onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Name *</label>
                <input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Assign to Counselor (optional)</label>
                <select value={editing.counselor_id || ""} onChange={(e) => setEditing({ ...editing, counselor_id: e.target.value || null })} className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-sm">
                  <option value="">— Shared (all counselors) —</option>
                  {counselors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold">Fields</label>
                  <button onClick={addField} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={12} /> Add field</button>
                </div>
                <div className="space-y-2">
                  {(editing.schema || []).map((f, i) => (
                    <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <GripVertical size={14} className="text-muted-foreground" />
                        <input value={f.label} onChange={(e) => updateField(i, { label: e.target.value })} placeholder="Label" className="flex-1 px-2 py-1 border border-input rounded text-sm bg-background" />
                        <select value={f.type} onChange={(e) => updateField(i, { type: e.target.value as Field["type"] })} className="px-2 py-1 border border-input rounded text-sm bg-background">
                          <option value="text">Text</option>
                          <option value="textarea">Long text</option>
                          <option value="number">Number</option>
                          <option value="select">Select</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="date">Date</option>
                        </select>
                        <button onClick={() => removeField(i)} className="text-destructive p-1"><Trash2 size={14} /></button>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <label className="flex items-center gap-1"><input type="checkbox" checked={!!f.required} onChange={(e) => updateField(i, { required: e.target.checked })} /> Required</label>
                        {f.type === "select" && (
                          <input value={(f.options || []).join(", ")} onChange={(e) => updateField(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Options (comma separated)" className="flex-1 px-2 py-1 border border-input rounded text-xs bg-background" />
                        )}
                      </div>
                    </div>
                  ))}
                  {(editing.schema || []).length === 0 && <p className="text-xs text-muted-foreground">No fields yet. Click "Add field".</p>}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.active ?? true} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
                Active
              </label>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-border">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm bg-secondary">Cancel</button>
              <button onClick={save} className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminIntakeForms;
