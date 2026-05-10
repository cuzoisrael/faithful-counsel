import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, Search, X } from "lucide-react";
import { downloadCSV } from "@/lib/csv";

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
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [ticketFilter, setTicketFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("conference_registrations").select("*").order("created_at", { ascending: false });
      if (data) setItems(data);
      setLoading(false);
    })();
  }, []);

  const events = useMemo(() => Array.from(new Set(items.map((i) => i.event_name))).filter(Boolean), [items]);
  const tickets = useMemo(() => Array.from(new Set(items.map((i) => i.ticket_category))).filter(Boolean), [items]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((r) => {
      if (eventFilter !== "all" && r.event_name !== eventFilter) return false;
      if (ticketFilter !== "all" && r.ticket_category !== ticketFilter) return false;
      const d = r.created_at.split("T")[0];
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      if (q && ![r.participant_name, r.email, r.phone, r.organization ?? "", r.event_name].some((v) => v.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [items, search, eventFilter, ticketFilter, fromDate, toDate]);

  const clearFilters = () => { setSearch(""); setEventFilter("all"); setTicketFilter("all"); setFromDate(""); setToDate(""); };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
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
          <label className="text-xs text-muted-foreground block mb-1">Event</label>
          <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="w-full text-sm border border-input rounded-md px-2 py-2 bg-background text-foreground">
            <option value="all">All events</option>
            {events.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Ticket</label>
          <select value={ticketFilter} onChange={(e) => setTicketFilter(e.target.value)} className="w-full text-sm border border-input rounded-md px-2 py-2 bg-background text-foreground">
            <option value="all">All tickets</option>
            {tickets.map((s) => <option key={s} value={s}>{s}</option>)}
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
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">{filtered.length} of {items.length} registrations</p>
      </aside>

      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="font-heading text-2xl font-bold text-foreground">Conference Registrations</h1>
          <button onClick={() => downloadCSV(`conferences-${new Date().toISOString().split("T")[0]}.csv`, filtered)} disabled={!filtered.length} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            <Download size={16} /> Export CSV ({filtered.length})
          </button>
        </div>
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
              {filtered.map((r) => (
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
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No registrations match your filters.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminConferences;
