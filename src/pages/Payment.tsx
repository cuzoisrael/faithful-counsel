import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";
import SectionHeading from "@/components/shared/SectionHeading";
import { Copy, CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const BANK = {
  accountName: "Ogbonna Onyenweaku",
  bank: "GTB",
  accountNumber: "0436373304",
};

const PaymentDetails = ({ heading }: { heading: string }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(null), 1800);
  };
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-4">{heading}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Please make your payment via bank transfer to the account below and send proof of payment to our contact email.
      </p>
      <div className="divide-y divide-border">
        {[
          ["Account Name", BANK.accountName],
          ["Bank", BANK.bank],
          ["Account Number", BANK.accountNumber],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-3 gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium text-foreground truncate">{value}</p>
            </div>
            <button onClick={() => copy(label, value)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-secondary text-foreground hover:bg-secondary/80 flex-shrink-0">
              {copied === label ? <CheckCircle2 size={14} className="text-primary" /> : <Copy size={14} />}
              {copied === label ? "Copied" : "Copy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

interface BookingLite {
  id: string;
  status: string;
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  created_at: string;
}

const Payment = () => {
  const location = useLocation();
  const { user } = useAuth();
  const fromBooking = (location.state as any)?.fromBooking as "session" | "conference" | undefined;

  const [booking, setBooking] = useState<BookingLite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("bookings")
        .select("id, status, service_type, preferred_date, preferred_time, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setBooking(data as BookingLite | null);
      setLoading(false);
    };
    load();
  }, [user]);

  const eligible = booking && ["confirmed", "completed"].includes(booking.status);
  const showFromState = !!fromBooking; // immediately after submit, optimistic

  return (
    <Layout>
      <SEO title="Payment & Bank Details" description="Secure payment instructions for IACPD sessions and conference bookings. Bank details are revealed once your booking is confirmed." path="/payment" />
      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <SectionHeading
            label="Payment"
            title="Complete Your Payment"
            description="Track your booking status and finalize payment when your slot is confirmed."
          />

          <div className="max-w-2xl mx-auto mt-10 space-y-6">
            {!user && !showFromState && (
              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-foreground">Sign in to view your payment details.</p>
                  <p className="text-sm text-muted-foreground">
                    <Link to="/auth" className="text-primary font-semibold hover:underline">Sign in</Link> or <Link to="/bookings" className="text-primary font-semibold hover:underline">book a session</Link> to get started.
                  </p>
                </div>
              </div>
            )}

            {loading && user && <p className="text-center text-muted-foreground py-6">Loading your booking...</p>}

            {!loading && user && booking && (
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Most recent booking</p>
                    <p className="font-semibold text-foreground">{booking.service_type}</p>
                    <p className="text-sm text-muted-foreground">{booking.preferred_date} at {booking.preferred_time}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            )}

            {showFromState && (
              <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-foreground">
                    {fromBooking === "conference" ? "Conference registration received." : "Session booking received."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Our team will review and confirm your slot shortly. Payment instructions will appear here once confirmed.
                  </p>
                </div>
              </div>
            )}

            {!loading && eligible && (
              <>
                <PaymentDetails heading={fromBooking === "conference" ? "Conference Booking" : "Session Booking"} />
                <PaymentDetails heading="Conference Booking" />
              </>
            )}

            {!loading && user && booking && !eligible && !showFromState && (
              <div className="flex items-start gap-3 p-4 bg-secondary border border-border rounded-lg">
                <Clock className="text-muted-foreground flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-foreground">Bank details unlock once your booking is confirmed.</p>
                  <p className="text-sm text-muted-foreground">
                    You'll get a notification when an admin confirms. You can also <Link to="/my-bookings" className="text-primary font-semibold hover:underline">track your bookings</Link>.
                  </p>
                </div>
              </div>
            )}

            <div className="text-center">
              <Link to="/contact" className="text-sm text-primary font-semibold hover:underline">Need help? Contact us →</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string; Icon: any }> = {
    pending: { label: "Awaiting confirmation", cls: "bg-yellow-100 text-yellow-800", Icon: Clock },
    confirmed: { label: "Confirmed — pay now", cls: "bg-green-100 text-green-800", Icon: CheckCircle2 },
    completed: { label: "Completed", cls: "bg-blue-100 text-blue-800", Icon: CheckCircle2 },
    cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800", Icon: XCircle },
  };
  const cfg = map[status] || { label: status, cls: "bg-secondary text-foreground", Icon: Clock };
  const Icon = cfg.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>
      <Icon size={12} /> {cfg.label}
    </span>
  );
};

export default Payment;
