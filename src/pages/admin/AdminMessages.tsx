import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MailOpen, Download, Search, X } from "lucide-react";
import { downloadCSV } from "@/lib/csv";

interface Message {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchMessages = async () => {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (data) setMessages(data);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const toggleRead = async (id: string, read: boolean) => {
    await supabase.from("contact_messages").update({ read: !read }).eq("id", id);
    fetchMessages();
  };

  const subjects = useMemo(() => Array.from(new Set(messages.map((m) => m.subject))).filter(Boolean), [messages]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return messages.filter((m) => {
      if (readFilter === "unread" && m.read) return false;
      if (readFilter === "read" && !m.read) return false;
      if (subjectFilter !== "all" && m.subject !== subjectFilter) return false;
      const d = m.created_at.split("T")[0];
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      if (q && ![m.full_name, m.email, m.subject, m.message].some((v) => v.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [messages, search, readFilter, subjectFilter, fromDate, toDate]);

  const clearFilters = () => { setSearch(""); setReadFilter("all"); setSubjectFilter("all"); setFromDate(""); setToDate(""); };

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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, body…" className="w-full pl-8 pr-2 py-2 text-sm border border-input rounded-md bg-background text-foreground" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Status</label>
          <select value={readFilter} onChange={(e) => setReadFilter(e.target.value as any)} className="w-full text-sm border border-input rounded-md px-2 py-2 bg-background text-foreground">
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Category (subject)</label>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="w-full text-sm border border-input rounded-md px-2 py-2 bg-background text-foreground">
            <option value="all">All subjects</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
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
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">{filtered.length} of {messages.length} messages</p>
      </aside>

      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="font-heading text-2xl font-bold text-foreground">Contact Messages</h1>
          <button onClick={() => downloadCSV(`messages-${new Date().toISOString().split("T")[0]}.csv`, filtered)} disabled={!filtered.length} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            <Download size={16} /> Export CSV ({filtered.length})
          </button>
        </div>
        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m.id} className={`bg-card rounded-xl border border-border p-5 cursor-pointer transition-colors ${!m.read ? "border-l-4 border-l-primary" : ""}`} onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {m.read ? <MailOpen size={16} className="text-muted-foreground" /> : <Mail size={16} className="text-primary" />}
                    <span className="font-semibold text-foreground">{m.full_name}</span>
                    <span className="text-xs text-muted-foreground">{m.email}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{m.subject}</p>
                  <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleRead(m.id, m.read); }} className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground">
                  {m.read ? "Unread" : "Read"}
                </button>
              </div>
              {expanded === m.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{m.message}</p>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No messages match your filters.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
