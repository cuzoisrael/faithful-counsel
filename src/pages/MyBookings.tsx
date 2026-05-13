import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SectionHeading from "@/components/shared/SectionHeading";

interface Booking {
  id: string;
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  session_format: string;
  status: string;
  created_at: string;
  preferred_counselor: string | null;
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-accent", label: "Pending" },
  confirmed: { icon: CheckCircle, color: "text-primary", label: "Confirmed" },
  completed: { icon: CheckCircle, color: "text-teal-light", label: "Completed" },
  cancelled: { icon: XCircle, color: "text-destructive", label: "Cancelled" },
};

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, service_type, preferred_date, preferred_time, session_format, status, created_at, preferred_counselor")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setBookings((data as Booking[]) || []);
      setLoading(false);
    };
    fetchBookings();
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <section className="section-padding bg-background min-h-[50vh] flex items-center">
          <div className="container-narrow mx-auto text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Sign in to view your bookings</h1>
            <Link to="/auth" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold">Sign In</Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[50vh]">
        <div className="container-narrow mx-auto">
          <SectionHeading title="My Bookings" description="Track and manage your counseling sessions." />
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground mb-4">You haven't booked any sessions yet.</p>
              <Link to="/bookings" className="px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold">Book Your First Session</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const statusInfo = statusConfig[booking.status] || statusConfig.pending;
                const StatusIcon = statusInfo.icon;
                const intakeReady = ["confirmed", "completed"].includes(booking.status);
                return (
                  <div key={booking.id} className="bg-card rounded-xl border border-border p-5 card-hover">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-heading text-lg font-semibold text-foreground">{booking.service_type}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(booking.preferred_date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> {booking.preferred_time}</span>
                          <span className="capitalize">{booking.session_format}</span>
                          {booking.preferred_counselor && <span>with {booking.preferred_counselor}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`flex items-center gap-1.5 text-sm font-semibold ${statusInfo.color}`}>
                          <StatusIcon size={16} />
                          {statusInfo.label}
                        </div>
                        {intakeReady && (
                          <Link
                            to={`/intake/${booking.id}`}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Complete intake form →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default MyBookings;
