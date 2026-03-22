import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";

interface Registration {
  id: string;
  event_name: string;
  participant_name: string;
  email: string;
  phone: string;
  organization: string | null;
  ticket_category: string;
  num_seats: number;
  comments: string | null;
  created_at: string;
}

const AdminConferences = () => {
  const [items, setItems] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    const { data } = await supabase.from("conference_registrations").select("*").order("created_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Conference Registrations</h1>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              {["Participant", "Event", "Email", "Phone", "Organization", "Ticket", "Seats", "Date"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((r) => (
              <tr key={r.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 font-medium text-foreground">{r.participant_name}</td>
                <td className="px-4 py-3 text-foreground">{r.event_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.organization || "—"}</td>
                <td className="px-4 py-3 text-foreground capitalize">{r.ticket_category}</td>
                <td className="px-4 py-3 text-foreground">{r.num_seats}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-center text-muted-foreground py-8">No registrations yet.</p>}
      </div>
    </div>
  );
};

export default AdminConferences;
