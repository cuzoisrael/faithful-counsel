import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Testimonial {
  id: string;
  full_name: string;
  role: string;
  testimonial_text: string;
  rating: number;
  status: string;
  featured: boolean;
  created_at: string;
}

const AdminTestimonials = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("testimonials").update({ status }).eq("id", id);
    if (error) { toast.error("Update failed"); return; }
    toast.success(`Testimonial ${status}`);
    fetch();
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    await supabase.from("testimonials").update({ featured: !featured }).eq("id", id);
    fetch();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    toast.success("Deleted");
    fetch();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Manage Testimonials</h1>
      <div className="space-y-4">
        {items.map((t) => (
          <div key={t.id} className="bg-card rounded-xl border border-border p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">{t.full_name}</span>
                  <span className="text-xs text-muted-foreground">({t.role})</span>
                  <span className="text-yellow-500 text-sm">{"★".repeat(t.rating)}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{t.testimonial_text}</p>
                <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value)} className="text-xs border border-input rounded px-2 py-1 bg-card text-foreground">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={() => toggleFeatured(t.id, t.featured)} className={`text-xs px-2 py-1 rounded ${t.featured ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {t.featured ? "Featured" : "Feature"}
                </button>
                <button onClick={() => remove(t.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-8">No testimonials yet.</p>}
      </div>
    </div>
  );
};

export default AdminTestimonials;
