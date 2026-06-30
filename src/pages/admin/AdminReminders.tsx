import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, CheckCircle2, XCircle, Send } from "lucide-react";
import { toast } from "sonner";

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

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reminder_logs" as never)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
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

  const sent = logs.filter((l) => l.status === "sent").length;
  const failed = logs.filter((l) => l.status === "failed").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Reminder Delivery</h1>
          <p className="text-sm text-muted-foreground">24-hour WhatsApp reminders sent via GatewayAPI</p>
        </div>
        <div className="flex gap-2">
          <button onClick={triggerRun} disabled={triggering} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            <Send size={16} /> {triggering ? "Running..." : "Run Now"}
          </button>
          <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Total attempts</p>
          <p className="text-2xl font-bold text-foreground">{logs.length}</p>
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
        ) : logs.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">
            No reminder attempts yet. Reminders run automatically; click "Run Now" to trigger immediately.
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
              {logs.map((l) => {
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
  );
};

export default AdminReminders;
