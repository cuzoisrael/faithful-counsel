import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MailOpen, Download } from "lucide-react";
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

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Contact Messages</h1>
      <div className="space-y-3">
        {messages.map((m) => (
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
        {messages.length === 0 && <p className="text-center text-muted-foreground py-8">No messages yet.</p>}
      </div>
    </div>
  );
};

export default AdminMessages;
