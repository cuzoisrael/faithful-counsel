import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { downloadCSV } from "@/lib/csv";

interface Booking {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_type: string;
  session_format: string;
  preferred_date: string;
  preferred_time: string;
  preferred_counselor: string | null;
  status: string;
  message: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (data) setBookings(data);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success(`Booking ${status}`);
    fetchBookings();
  };

  if (loading) return <p className="text-muted-foreground">Loading bookings...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Manage Bookings</h1>
        <button onClick={() => downloadCSV(`bookings-${new Date().toISOString().split("T")[0]}.csv`, bookings)} disabled={!bookings.length} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
          <Download size={16} /> Export CSV
        </button>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              {["Name", "Service", "Date", "Time", "Format", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{b.full_name}</p>
                  <p className="text-xs text-muted-foreground">{b.email}</p>
                </td>
                <td className="px-4 py-3 text-foreground">{b.service_type}</td>
                <td className="px-4 py-3 text-foreground">{b.preferred_date}</td>
                <td className="px-4 py-3 text-foreground">{b.preferred_time}</td>
                <td className="px-4 py-3 text-foreground">{b.session_format}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[b.status] || "bg-secondary text-foreground"}`}>{b.status}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={b.status}
                    onChange={(e) => updateStatus(b.id, e.target.value)}
                    className="text-xs border border-input rounded px-2 py-1 bg-card text-foreground"
                  >
                    {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && <p className="text-center text-muted-foreground py-8">No bookings yet.</p>}
      </div>
    </div>
  );
};

export default AdminBookings;
