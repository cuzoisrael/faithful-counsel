import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/shared/SectionHeading";
import CTASection from "@/components/shared/CTASection";
import { toast } from "sonner";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Your message has been sent! We'll get back to you within 24 hours.");
    (e.target as HTMLFormElement).reset();
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Layout>
      <section className="bg-hero-gradient section-padding text-center">
        <div className="container-narrow mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Contact Us</h1>
          <p className="text-primary-foreground/80 text-lg">We'd love to hear from you. Reach out to us through any of the channels below.</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="font-heading text-2xl font-bold text-foreground">Get in Touch</h2>
              <p className="text-muted-foreground leading-relaxed">Whether you have questions about our services, want to book a session, or need more information, we're here to help.</p>

              <div className="space-y-5">
                {[
                  { icon: Mail, label: "Email", value: "info@iacpd.org" },
                  { icon: Phone, label: "Phone", value: "+1 (800) 000-0000" },
                  { icon: MapPin, label: "Address", value: "Lagos, Nigeria" },
                  { icon: Clock, label: "Office Hours", value: "Mon–Fri: 9:00 AM – 5:00 PM\nSat: 10:00 AM – 2:00 PM" },
                  { icon: MessageCircle, label: "WhatsApp", value: "+234 000 000 0000" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="w-full h-48 rounded-xl bg-secondary border border-border flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Google Maps Embed</span>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 md:p-10 shadow-card">
                <SectionHeading title="Send Us a Message" centered={false} />
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                      <input required type="text" className={inputClass} placeholder="Your name" maxLength={100} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                      <input required type="email" className={inputClass} placeholder="you@example.com" maxLength={255} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Subject *</label>
                    <input required type="text" className={inputClass} placeholder="How can we help?" maxLength={200} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Message *</label>
                    <textarea required rows={5} className={inputClass} placeholder="Write your message here..." maxLength={2000} />
                  </div>
                  <button type="submit" className="w-full px-8 py-4 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Start Your Journey?"
        description="Don't wait. Book a session today and take the first step toward transformation."
        secondaryLabel="View Services"
        secondaryLink="/services"
      />
    </Layout>
  );
};

export default Contact;
