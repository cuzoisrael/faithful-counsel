import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/shared/SectionHeading";
import { toast } from "sonner";

const serviceTypes = [
  "Marriage & Family Counseling",
  "Career Counseling",
  "Mental Health Counseling",
  "Trauma & Crisis Counseling",
  "Leadership Development",
  "Counseling Certification",
  "Personal Coaching",
  "Corporate Training",
];

const counselors = [
  "Dr. Adaeze Okafor",
  "Pastor James Adeyemi",
  "Mrs. Chioma Eze",
  "No Preference",
];

const Bookings = () => {
  const [activeTab, setActiveTab] = useState<"session" | "conference">("session");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const { error } = await supabase.from("bookings").insert({
      user_id: user?.id || null,
      full_name: fd.get("full_name") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      service_type: fd.get("service_type") as string,
      preferred_counselor: (fd.get("preferred_counselor") as string) || null,
      session_format: fd.get("session_format") as string,
      preferred_date: fd.get("preferred_date") as string,
      preferred_time: fd.get("preferred_time") as string,
      message: (fd.get("message") as string) || null,
    });

    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
    } else {
      toast.success("Your booking has been submitted! Continue to payment.");
      form.reset();
      navigate("/payment", { state: { fromBooking: "session" } });
    }
  };

  const handleConferenceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const { error } = await supabase.from("conference_registrations").insert({
      event_name: fd.get("event_name") as string,
      participant_name: fd.get("participant_name") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      organization: (fd.get("organization") as string) || null,
      ticket_category: fd.get("ticket_category") as string,
      num_seats: parseInt(fd.get("num_seats") as string) || 1,
      comments: (fd.get("comments") as string) || null,
    });

    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
    } else {
      toast.success("Registration submitted successfully! Continue to payment.");
      form.reset();
      navigate("/payment", { state: { fromBooking: "conference" } });
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <Layout>
      <section className="bg-hero-gradient section-padding text-center">
        <div className="container-narrow mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Bookings & Registration</h1>
          <p className="text-primary-foreground/80 text-lg">Take the first step towards transformation. Schedule a session or register for an event today.</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-narrow mx-auto">
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-lg bg-secondary p-1 border border-border">
              <button onClick={() => setActiveTab("session")} className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-colors ${activeTab === "session" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                Book a Session
              </button>
              <button onClick={() => setActiveTab("conference")} className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-colors ${activeTab === "conference" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                Conference Registration
              </button>
            </div>
          </div>

          {activeTab === "session" && (
            <form onSubmit={handleBookingSubmit} className="bg-card rounded-xl border border-border p-6 md:p-10 shadow-card">
              <SectionHeading title="Book a Session" description="Fill out the form below and we'll get back to you within 24 hours." />
              {!user && (
                <div className="mb-6 p-4 rounded-lg bg-accent/10 border border-accent/20 text-sm text-foreground">
                  <a href="/auth" className="text-primary font-semibold hover:underline">Sign in</a> to track your bookings in your account.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input required name="full_name" type="text" className={inputClass} placeholder="Your full name" maxLength={100} defaultValue={user?.user_metadata?.full_name || ""} />
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input required name="email" type="email" className={inputClass} placeholder="you@example.com" maxLength={255} defaultValue={user?.email || ""} />
                </div>
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input required name="phone" type="tel" className={inputClass} placeholder="+234 000 000 0000" maxLength={20} />
                </div>
                <div>
                  <label className={labelClass}>Service Type *</label>
                  <select required name="service_type" className={inputClass}>
                    <option value="">Select a service</option>
                    {serviceTypes.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Preferred Counselor</label>
                  <select name="preferred_counselor" className={inputClass}>
                    <option value="">Select counselor</option>
                    {counselors.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Session Format *</label>
                  <select required name="session_format" className={inputClass}>
                    <option value="">Select format</option>
                    <option value="online">Online</option>
                    <option value="physical">In-Person</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Preferred Date *</label>
                  <input required name="preferred_date" type="date" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Preferred Time *</label>
                  <input required name="preferred_time" type="time" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Message (optional)</label>
                  <textarea name="message" className={inputClass} rows={3} placeholder="Tell us about your needs or concerns..." maxLength={1000} />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-start gap-2 text-sm text-muted-foreground">
                    <input required type="checkbox" className="mt-1" />
                    <span>I consent to IACPD collecting and processing my personal information for the purpose of scheduling a counseling session. *</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 p-5 rounded-lg bg-secondary border border-border">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">Payment Information</h3>
                <p className="text-muted-foreground text-sm">Payment details will be shared upon booking confirmation. We accept bank transfers, and will soon support Paystack, Flutterwave, and Stripe.</p>
              </div>

              <button type="submit" disabled={loading} className="mt-8 w-full px-8 py-4 rounded-lg bg-accent text-accent-foreground font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? "Submitting..." : "Submit Booking Request"}
              </button>
            </form>
          )}

          {activeTab === "conference" && (
            <form onSubmit={handleConferenceSubmit} className="bg-card rounded-xl border border-border p-6 md:p-10 shadow-card">
              <SectionHeading title="Conference / Event Registration" description="Register for our upcoming conferences, workshops, and events." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>Conference / Event Name *</label>
                  <input required name="event_name" type="text" className={inputClass} placeholder="Event name" maxLength={200} />
                </div>
                <div>
                  <label className={labelClass}>Participant Name *</label>
                  <input required name="participant_name" type="text" className={inputClass} placeholder="Your full name" maxLength={100} />
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input required name="email" type="email" className={inputClass} placeholder="you@example.com" maxLength={255} />
                </div>
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input required name="phone" type="tel" className={inputClass} placeholder="+234 000 000 0000" maxLength={20} />
                </div>
                <div>
                  <label className={labelClass}>Organization</label>
                  <input name="organization" type="text" className={inputClass} placeholder="Your organization" maxLength={200} />
                </div>
                <div>
                  <label className={labelClass}>Ticket Category</label>
                  <select name="ticket_category" className={inputClass}>
                    <option value="standard">Standard</option>
                    <option value="vip">VIP</option>
                    <option value="group">Group</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Number of Seats *</label>
                  <input required name="num_seats" type="number" min="1" max="50" className={inputClass} placeholder="1" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Comments (optional)</label>
                  <textarea name="comments" className={inputClass} rows={3} placeholder="Any special requirements or questions..." maxLength={1000} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="mt-8 w-full px-8 py-4 rounded-lg bg-accent text-accent-foreground font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? "Submitting..." : "Register Now"}
              </button>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Bookings;
