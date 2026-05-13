import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/shared/SectionHeading";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Booking {
  id: string;
  status: string;
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  user_id: string | null;
}

const inputClass =
  "w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelClass = "block text-sm font-medium text-foreground mb-1.5";

const IntakeForm = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [existing, setExisting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading || !user || !bookingId) return;
    (async () => {
      const { data: b } = await supabase
        .from("bookings")
        .select("id, status, service_type, preferred_date, preferred_time, user_id")
        .eq("id", bookingId)
        .maybeSingle();
      setBooking(b as Booking | null);
      const { data: f } = await supabase
        .from("intake_forms")
        .select("*")
        .eq("booking_id", bookingId)
        .maybeSingle();
      setExisting(f);
      setLoading(false);
    })();
  }, [authLoading, user, bookingId]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="section-padding flex justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <section className="section-padding bg-background min-h-[50vh] flex items-center">
          <div className="container-narrow mx-auto text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Sign in to access your intake form</h1>
            <Link to="/auth" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold">
              Sign In
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  if (!booking || booking.user_id !== user.id) {
    return (
      <Layout>
        <section className="section-padding bg-background min-h-[50vh] flex items-center">
          <div className="container-narrow mx-auto text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Booking not found</h1>
            <p className="text-muted-foreground mb-6">We couldn't find this booking on your account.</p>
            <Link to="/my-bookings" className="text-primary font-semibold hover:underline">← Back to My Bookings</Link>
          </div>
        </section>
      </Layout>
    );
  }

  const eligible = ["confirmed", "completed"].includes(booking.status);

  if (!eligible) {
    return (
      <Layout>
        <section className="section-padding bg-background min-h-[50vh] flex items-center">
          <div className="container-narrow mx-auto text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Intake form will unlock soon</h1>
            <p className="text-muted-foreground mb-6">
              Your intake form will be available once your booking is confirmed by our team. Current status:{" "}
              <span className="font-semibold capitalize">{booking.status}</span>.
            </p>
            <Link to="/my-bookings" className="text-primary font-semibold hover:underline">← Back to My Bookings</Link>
          </div>
        </section>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      booking_id: booking.id,
      user_id: user.id,
      medical_history: (fd.get("medical_history") as string) || null,
      current_medications: (fd.get("current_medications") as string) || null,
      allergies: (fd.get("allergies") as string) || null,
      emotional_history: (fd.get("emotional_history") as string) || null,
      presenting_concerns: (fd.get("presenting_concerns") as string) || null,
      family_history: (fd.get("family_history") as string) || null,
      prior_therapy: (fd.get("prior_therapy") as string) || null,
      emergency_contact_name: (fd.get("emergency_contact_name") as string) || null,
      emergency_contact_phone: (fd.get("emergency_contact_phone") as string) || null,
      consent: fd.get("consent") === "on",
    };

    const { error } = existing
      ? await supabase.from("intake_forms").update(payload).eq("booking_id", booking.id)
      : await supabase.from("intake_forms").insert(payload);

    setSubmitting(false);
    if (error) {
      toast.error("Could not save your intake form. Please try again.");
    } else {
      toast.success("Intake form submitted securely. Thank you.");
      navigate("/my-bookings");
    }
  };

  return (
    <Layout>
      <section className="section-padding bg-background">
        <div className="container-narrow mx-auto">
          <SectionHeading
            title="Pre-Session Intake Form"
            description={`For your upcoming ${booking.service_type} session on ${new Date(booking.preferred_date).toLocaleDateString()}.`}
          />

          <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-foreground">
              Your responses are private and protected. Only you and your assigned counselor can view them.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 md:p-10 shadow-card space-y-5">
            <div>
              <label className={labelClass}>Presenting Concerns *</label>
              <textarea
                required
                name="presenting_concerns"
                rows={3}
                maxLength={2000}
                defaultValue={existing?.presenting_concerns || ""}
                className={inputClass}
                placeholder="What brings you to counseling at this time?"
              />
            </div>
            <div>
              <label className={labelClass}>Medical History</label>
              <textarea
                name="medical_history"
                rows={3}
                maxLength={2000}
                defaultValue={existing?.medical_history || ""}
                className={inputClass}
                placeholder="Significant diagnoses, surgeries, or ongoing conditions."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Current Medications</label>
                <textarea
                  name="current_medications"
                  rows={2}
                  maxLength={1000}
                  defaultValue={existing?.current_medications || ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Allergies</label>
                <textarea
                  name="allergies"
                  rows={2}
                  maxLength={500}
                  defaultValue={existing?.allergies || ""}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Emotional & Mental Health History</label>
              <textarea
                name="emotional_history"
                rows={3}
                maxLength={2000}
                defaultValue={existing?.emotional_history || ""}
                className={inputClass}
                placeholder="Past or present anxiety, depression, trauma, etc."
              />
            </div>
            <div>
              <label className={labelClass}>Family History</label>
              <textarea
                name="family_history"
                rows={3}
                maxLength={2000}
                defaultValue={existing?.family_history || ""}
                className={inputClass}
                placeholder="Relevant family mental-health or relational history."
              />
            </div>
            <div>
              <label className={labelClass}>Prior Therapy or Counseling</label>
              <textarea
                name="prior_therapy"
                rows={2}
                maxLength={1000}
                defaultValue={existing?.prior_therapy || ""}
                className={inputClass}
                placeholder="Have you worked with a counselor before? What helped or didn't?"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Emergency Contact Name *</label>
                <input
                  required
                  name="emergency_contact_name"
                  maxLength={100}
                  defaultValue={existing?.emergency_contact_name || ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Emergency Contact Phone *</label>
                <input
                  required
                  name="emergency_contact_phone"
                  type="tel"
                  maxLength={30}
                  defaultValue={existing?.emergency_contact_phone || ""}
                  className={inputClass}
                />
              </div>
            </div>
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input required type="checkbox" name="consent" defaultChecked={!!existing?.consent} className="mt-1" />
              <span>
                I consent to IACPD securely storing this information for the purpose of providing safe, informed care. *
              </span>
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-8 py-4 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Saving..." : existing ? "Update Intake Form" : "Submit Intake Form"}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default IntakeForm;
