import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, CheckCircle2, XCircle, Send, Download, Search, X } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";

interface ReminderLog {
  id: string;
  booking_id: string;
  channel: string;
  status: string;
  recipient: string | null;
  provider_response: string | null;
  error_message: string | null;
  created_at: string;
}

interface BookingLite {
  id: string;
  full_name: string;
  email: string;
  preferred_date: string;
  preferred_time: string;
}

const AdminReminders = () => {
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [bookings, setBookings] = useState<Record<string, BookingLite>>({});
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reminder_logs" as never)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    const items = (data ?? []) as ReminderLog[];
    setLogs(items);

    const ids = Array.from(new Set(items.map((l) => l.booking_id)));
    if (ids.length) {
      const { data: bk } = await supabase
        .from("bookings")
        .select("id, full_name, email, preferred_date, preferred_time")
        .in("id", ids);
      const map: Record<string, BookingLite> = {};
      (bk ?? []).forEach((b) => (map[b.id] = b as BookingLite));
      setBookings(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const triggerRun = async () => {
    setTriggering(true);
    const { data, error } = await supabase.functions.invoke("send-booking-reminders");
    setTriggering(false);
    if (error) { toast.error("Run failed: " + error.message); return; }
    toast.success(`Processed ${(data as { processed?: number })?.processed ?? 0} bookings`);
    fetchLogs();
  };

  const channels = useMemo(() => Array.from(new Set(logs.map((l) => l.channel))).filter(Boolean), [logs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return logs.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (channelFilter !== "all" && l.channel !== channelFilter) return false;
      const d = l.created_at.slice(0, 10);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      if (q) {
        const b = bookings[l.booking_id];
        const haystack = [
          l.booking_id, l.recipient ?? "", l.error_message ?? "", l.provider_response ?? "",
          b?.full_name ?? "", b?.email ?? "",
        ].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [logs, bookings, search, statusFilter, channelFilter, fromDate, toDate]);

  const clearFilters = () => {
    setSearch(""); setStatusFilter("all"); setChannelFilter("all"); setFromDate(""); setToDate("");
  };

  const exportCsv = () => {
    const rows = filtered.map((l) => {
      const b = bookings[l.booking_id];
      return {
        when: l.created_at,
        status: l.status,
        channel: l.channel,
        recipient: l.recipient ?? "",
        client_name: b?.full_name ?? "",
        client_email: b?.email ?? "",
        session_date: b?.preferred_date ?? "",
        session_time: b?.preferred_time ?? "",
        booking_id: l.booking_id,
        error: l.error_message ?? "",
        provider_response: l.provider_response ?? "",
      };
    });
    downloadCSV(`reminder-logs-${new Date().toISOString().split("T")[0]}.csv`, rows);
  };

  const sent = filtered.filter((l) => l.status === "sent").length;
  const failed = filtered.filter((l) => l.status === "failed").length;

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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Client, email, error, booking ID…" className="w-full pl-8 pr-2 py-2 text-sm border border-input rounded-md bg-background text-foreground" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full text-sm border border-input rounded-md px-2 py-2 bg-background text-foreground">
            <option value="all">All statuses</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Channel</label>
          <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} className="w-full text-sm border border-input rounded-md px-2 py-2 bg-background text-foreground">
            <option value="all">All channels</option>
            {channels.map((c) => <option key={c} value={c}>{c}</option>)}
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
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">{filtered.length} of {logs.length} attempts</p>
      </aside>

      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Reminder Delivery</h1>
            <p className="text-sm text-muted-foreground">24-hour WhatsApp reminders sent via GatewayAPI</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportCsv} disabled={!filtered.length} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
              <Download size={16} /> Export CSV ({filtered.length})
            </button>
            <button onClick={triggerRun} disabled={triggering} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
              <Send size={16} /> {triggering ? "Running..." : "Run Now"}
            </button>
            <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Attempts (filtered)</p>
            <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{sent}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Failed</p>
            <p className="text-2xl font-bold text-red-600">{failed}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          {loading ? (
            <p className="p-8 text-center text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">
              {logs.length === 0
                ? "No reminder attempts yet. Reminders run automatically; click \"Run Now\" to trigger immediately."
                : "No attempts match your filters."}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  {["Status", "Client", "Session", "Channel", "Recipient", "Details", "When"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((l) => {
                  const b = bookings[l.booking_id];
                  return (
                    <tr key={l.id} className="hover:bg-secondary/50 align-top">
                      <td className="px-4 py-3">
                        {l.status === "sent" ? (
                          <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 size={14} /> Sent</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700"><XCircle size={14} /> Failed</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{b?.full_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{b?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {b ? `${b.preferred_date} ${b.preferred_time}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground capitalize">{l.channel}</td>
                      <td className="px-4 py-3 text-foreground">{l.recipient ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-sm truncate" title={l.error_message ?? l.provider_response ?? ""}>
                        {l.error_message ?? l.provider_response ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(l.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReminders;
