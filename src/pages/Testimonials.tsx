import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/shared/SectionHeading";
import TestimonialCard from "@/components/shared/TestimonialCard";
import CTASection from "@/components/shared/CTASection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = ["All", "Individual", "Couple", "Trainee", "Leader"];

// Fallback testimonials for when DB is empty
const fallbackTestimonials = [
  { id: "f1", full_name: "Grace Okonkwo", role: "Couple", testimonial_text: "IACPD saved our marriage. The faith-based approach helped us find healing we never thought possible.", rating: 5, featured: true, image_url: null },
  { id: "f2", full_name: "David Mensah", role: "Leader", testimonial_text: "The leadership development program transformed my approach to leading my team.", rating: 5, featured: false, image_url: null },
  { id: "f3", full_name: "Amara Nwosu", role: "Individual", testimonial_text: "After years of struggling with anxiety, the counseling sessions gave me tools grounded in faith and psychology to finally find peace.", rating: 5, featured: true, image_url: null },
  { id: "f4", full_name: "Samuel Adekunle", role: "Trainee", testimonial_text: "The counseling certification program was rigorous, practical, and deeply transformative.", rating: 5, featured: false, image_url: null },
  { id: "f5", full_name: "Blessing Eze", role: "Individual", testimonial_text: "I walked in broken and walked out renewed. The care and professionalism made all the difference.", rating: 4, featured: false, image_url: null },
  { id: "f6", full_name: "Chidinma Obi", role: "Couple", testimonial_text: "Pre-marital counseling with IACPD prepared us for marriage in ways we didn't even know we needed.", rating: 5, featured: false, image_url: null },
];

const Testimonials = () => {
  const [filter, setFilter] = useState("All");
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase.from("testimonials").select("*").eq("status", "approved").order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setTestimonials(data.map((t) => ({ ...t, id: t.id })));
      }
    };
    fetchTestimonials();
  }, []);

  const filtered = filter === "All" ? testimonials : testimonials.filter((t) => t.role === filter);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const { error } = await supabase.from("testimonials").insert({
      full_name: fd.get("full_name") as string,
      role: fd.get("role") as string,
      testimonial_text: fd.get("testimonial_text") as string,
      rating: parseInt(fd.get("rating") as string) || 5,
    });

    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
    } else {
      toast.success("Thank you! Your testimonial has been submitted for review.");
      form.reset();
    }
  };

  return (
    <Layout>
      <section className="bg-hero-gradient section-padding text-center">
        <div className="container-narrow mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Testimonials</h1>
          <p className="text-primary-foreground/80 text-lg">Real stories of transformation and hope from the IACPD community.</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${filter === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <TestimonialCard key={t.id} name={t.full_name} role={t.role} text={t.testimonial_text} rating={t.rating} image={t.image_url || undefined} featured={t.featured} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="container-narrow mx-auto">
          <SectionHeading label="Share Your Story" title="Submit a Testimonial" description="Your experience can inspire others. Share how IACPD has impacted your life." />
          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 md:p-10 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                <input required name="full_name" type="text" maxLength={100} className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Category *</label>
                <select required name="role" className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select category</option>
                  <option value="Individual">Individual</option>
                  <option value="Couple">Couple</option>
                  <option value="Trainee">Trainee</option>
                  <option value="Leader">Leader</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Rating *</label>
                <select required name="rating" className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
                  <option value="4">⭐⭐⭐⭐ (4 stars)</option>
                  <option value="3">⭐⭐⭐ (3 stars)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Your Testimonial *</label>
                <textarea required name="testimonial_text" rows={4} maxLength={1000} className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Share your experience with IACPD..." />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-start gap-2 text-sm text-muted-foreground">
                  <input required type="checkbox" className="mt-1" />
                  <span>I consent to IACPD displaying my testimonial on their website after approval. *</span>
                </label>
              </div>
            </div>
            <button type="submit" disabled={loading} className="mt-6 w-full px-8 py-4 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Submitting..." : "Submit Testimonial"}
            </button>
          </form>
        </div>
      </section>

      <CTASection title="Inspired by These Stories?" description="Start your own transformation journey today." />
    </Layout>
  );
};

export default Testimonials;
