import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Search, X } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

  const services = useMemo(() => Array.from(new Set(bookings.map((b) => b.service_type))).filter(Boolean), [bookings]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (serviceFilter !== "all" && b.service_type !== serviceFilter) return false;
      if (fromDate && b.preferred_date < fromDate) return false;
      if (toDate && b.preferred_date > toDate) return false;
      if (q && ![b.full_name, b.email, b.phone, b.message ?? "", b.preferred_counselor ?? ""]
        .some((v) => v.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [bookings, search, statusFilter, serviceFilter, fromDate, toDate]);

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); setServiceFilter("all"); setFromDate(""); setToDate(""); };

  if (loading) return <p className="text-muted-foreground">Loading bookings...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      {/* Filter sidebar */}
      <aside className="bg-card rounded-xl border border-border p-4 h-fit lg:sticky lg:top-20 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm">Filters</h3>
          <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><X size={12}/> Clear</button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email…" className="w-full pl-8 pr-2 py-2 text-sm border border-input rounded-md bg-background text-foreground" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full text-sm border border-input rounded-md px-2 py-2 bg-background text-foreground">
            <option value="all">All statuses</option>
            {["pending","confirmed","completed","cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Service</label>
          <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="w-full text-sm border border-input rounded-md px-2 py-2 bg-background text-foreground">
            <option value="all">All services</option>
            {services.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">From date</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full text-sm border border-input rounded-md px-2 py-2 bg-background text-foreground" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">To date</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full text-sm border border-input rounded-md px-2 py-2 bg-background text-foreground" />
        </div>
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">{filtered.length} of {bookings.length} bookings</p>
      </aside>

      {/* Table */}
      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="font-heading text-2xl font-bold text-foreground">Manage Bookings</h1>
          <button onClick={() => downloadCSV(`bookings-${new Date().toISOString().split("T")[0]}.csv`, filtered)} disabled={!filtered.length} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            <Download size={16} /> Export CSV ({filtered.length})
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
              {filtered.map((b) => (
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
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No bookings match your filters.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
