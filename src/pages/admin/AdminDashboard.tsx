import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarCheck, MessageSquare, FileText, Star, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const sidebarLinks = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Bookings", path: "/admin/bookings", icon: CalendarCheck },
  { label: "Testimonials", path: "/admin/testimonials", icon: Star },
  { label: "Blog Posts", path: "/admin/blog", icon: FileText },
  { label: "Messages", path: "/admin/messages", icon: MessageSquare },
];

const AdminDashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsAdmin(false); return; }
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
    };
    if (!authLoading) checkAdmin();
  }, [user, authLoading]);

  if (authLoading || isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="font-heading text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        <Link to="/" className="text-primary font-semibold hover:underline">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-secondary/30">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-border">
          <Link to="/" className="font-heading text-lg font-bold text-primary">IACPD</Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                (link.path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(link.path))
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <button onClick={() => { signOut(); navigate("/"); }} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-secondary transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center gap-3 lg:px-8">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md hover:bg-secondary"><Menu size={20} /></button>
          <h2 className="font-heading font-semibold text-foreground">Admin Dashboard</h2>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
