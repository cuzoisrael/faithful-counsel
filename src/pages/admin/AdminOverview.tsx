import { useEffect, useState } from "react";
import { CalendarCheck, MessageSquare, FileText, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminOverview = () => {
  const [stats, setStats] = useState({ bookings: 0, testimonials: 0, posts: 0, messages: 0 });

  useEffect(() => {
    const load = async () => {
      const [b, t, p, m] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      ]);
      setStats({ bookings: b.count || 0, testimonials: t.count || 0, posts: p.count || 0, messages: m.count || 0 });
    };
    load();
  }, []);

  const cards = [
    { label: "Bookings", value: stats.bookings, icon: CalendarCheck, color: "text-primary" },
    { label: "Testimonials", value: stats.testimonials, icon: Star, color: "text-accent" },
    { label: "Blog Posts", value: stats.posts, icon: FileText, color: "text-foreground" },
    { label: "Messages", value: stats.messages, icon: MessageSquare, color: "text-destructive" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
              <c.icon size={20} className={c.color} />
            </div>
            <p className="text-3xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
