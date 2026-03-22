import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

const AdminNewsletter = () => {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
      if (data) setItems(data);
      setLoading(false);
    };
    fetchItems();
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Newsletter Subscribers</h1>
        <span className="text-sm text-muted-foreground">{items.length} subscriber{items.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subscribed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((s) => (
              <tr key={s.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 font-medium text-foreground">{s.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-center text-muted-foreground py-8">No subscribers yet.</p>}
      </div>
    </div>
  );
};

export default AdminNewsletter;
