import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Calendar, Clock, User, Mail, Phone, Loader2, ShieldCheck, AlertTriangle, MessageCircle, CheckCircle2, XCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/shared/SectionHeading";

interface ReminderEntry {
  id: string;
  channel: string;
  status: string;
  delivery_status: string | null;
  recipient: string | null;
  error_message: string | null;
  provider_response: string | null;
  delivered_at: string | null;
  status_updated_at: string | null;
  created_at: string;
}

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
  notes: string | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const BookingView = () => {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const token = params.get("t");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !token) {
      setError("This link is missing required parameters.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const url = `${SUPABASE_URL}/functions/v1/view-booking?id=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}`;
        const resp = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.error || "Could not load booking");
        setBooking(json.booking);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load booking");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh]">
        <div className="container-narrow mx-auto max-w-2xl">
          <SectionHeading title="Your Booking" description="Secure session details" />

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}

          {!loading && error && (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <AlertTriangle className="mx-auto text-destructive mb-3" size={32} />
              <h2 className="font-heading text-xl font-semibold text-foreground mb-2">Unable to load booking</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link to="/contact" className="text-primary font-semibold hover:underline">Contact us for help →</Link>
            </div>
          )}

          {!loading && booking && (
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2 text-sm text-primary">
                <ShieldCheck size={16} /> Verified secure link
              </div>

              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">{booking.service_type}</h2>
                <p className="text-muted-foreground capitalize mt-1">{booking.session_format} session · Status: <span className="font-medium text-foreground capitalize">{booking.status}</span></p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-foreground"><Calendar size={16} className="text-primary" /> {new Date(booking.preferred_date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                <div className="flex items-center gap-2 text-foreground"><Clock size={16} className="text-primary" /> {booking.preferred_time}</div>
                <div className="flex items-center gap-2 text-foreground"><User size={16} className="text-primary" /> {booking.full_name}</div>
                {booking.preferred_counselor && (
                  <div className="flex items-center gap-2 text-foreground"><User size={16} className="text-primary" /> with {booking.preferred_counselor}</div>
                )}
                <div className="flex items-center gap-2 text-foreground"><Mail size={16} className="text-primary" /> {booking.email}</div>
                <div className="flex items-center gap-2 text-foreground"><Phone size={16} className="text-primary" /> {booking.phone}</div>
              </div>

              {booking.notes && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground whitespace-pre-line">{booking.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-border text-sm text-muted-foreground">
                Need to reschedule or cancel? <Link to="/contact" className="text-primary font-semibold hover:underline">Contact us</Link>.
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BookingView;
