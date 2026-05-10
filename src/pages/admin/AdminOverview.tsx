import { useEffect, useState } from "react";
import { CalendarCheck, MessageSquare, FileText, Star, TrendingUp, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

interface BookingRow { status: string; service_type: string; created_at: string; }
interface MessageRow { created_at: string; }

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))", "hsl(var(--destructive))"];

const AdminOverview = () => {
  const [stats, setStats] = useState({ bookings: 0, testimonials: 0, posts: 0, messages: 0, subscribers: 0, conferences: 0 });
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const [b, t, p, m, n, c, bAll, mAll] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
        supabase.from("conference_registrations").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("status, service_type, created_at"),
        supabase.from("contact_messages").select("created_at"),
      ]);
      setStats({
        bookings: b.count || 0, testimonials: t.count || 0, posts: p.count || 0,
        messages: m.count || 0, subscribers: n.count || 0, conferences: c.count || 0,
      });
      setBookings((bAll.data as BookingRow[]) || []);
      setMessages((mAll.data as MessageRow[]) || []);
    };
    load();
  }, []);

  const cards = [
    { label: "Bookings", value: stats.bookings, icon: CalendarCheck },
    { label: "Conferences", value: stats.conferences, icon: TrendingUp },
    { label: "Testimonials", value: stats.testimonials, icon: Star },
    { label: "Blog Posts", value: stats.posts, icon: FileText },
    { label: "Messages", value: stats.messages, icon: MessageSquare },
    { label: "Subscribers", value: stats.subscribers, icon: Mail },
  ];

  // Bookings by status (pie)
  const statusData = Object.entries(
    bookings.reduce<Record<string, number>>((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Bookings by service (bar)
  const serviceData = Object.entries(
    bookings.reduce<Record<string, number>>((acc, b) => { acc[b.service_type] = (acc[b.service_type] || 0) + 1; return acc; }, {})
  ).map(([name, count]) => ({ name, count }));

  // Last 14 days trend (line)
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });
  const trendData = days.map((day) => ({
    day: day.slice(5),
    bookings: bookings.filter((b) => b.created_at.slice(0, 10) === day).length,
    messages: messages.filter((m) => m.created_at.slice(0, 10) === day).length,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard Overview</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
              <c.icon size={16} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Activity (last 14 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="messages" stroke="hsl(var(--accent))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Bookings by Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={80} label>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">Bookings by Service Type</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={serviceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
