import { useState } from "react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/shared/SectionHeading";
import TestimonialCard from "@/components/shared/TestimonialCard";
import CTASection from "@/components/shared/CTASection";
import { toast } from "sonner";

const categories = ["All", "Individual", "Couple", "Trainee", "Leader"];

const testimonials = [
  { name: "Grace Okonkwo", role: "Couple", text: "IACPD saved our marriage. The faith-based approach helped us find healing we never thought possible. Our counselor truly listened and guided us with wisdom and patience.", rating: 5, featured: true },
  { name: "David Mensah", role: "Leader", text: "The leadership development program transformed my approach to leading my team. I now lead with purpose, clarity, and conviction.", rating: 5 },
  { name: "Amara Nwosu", role: "Individual", text: "After years of struggling with anxiety, the counseling sessions gave me tools grounded in faith and psychology to finally find peace and direction.", rating: 5, featured: true },
  { name: "Samuel Adekunle", role: "Trainee", text: "The counseling certification program was rigorous, practical, and deeply transformative. I now feel equipped to serve others with excellence.", rating: 5 },
  { name: "Blessing Eze", role: "Individual", text: "I walked in broken and walked out renewed. The care and professionalism of the counselors made all the difference in my healing journey.", rating: 4 },
  { name: "Chidinma Obi", role: "Couple", text: "Pre-marital counseling with IACPD prepared us for marriage in ways we didn't even know we needed. We're stronger for it.", rating: 5 },
  { name: "Francis Nwankwo", role: "Leader", text: "As a pastor, the leadership coaching helped me understand my blind spots and grow into a more effective, compassionate leader.", rating: 5 },
  { name: "Yetunde Bakare", role: "Individual", text: "The faith-based approach to mental health counseling changed my perspective. I found hope again through this incredible team.", rating: 5 },
];

const Testimonials = () => {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? testimonials : testimonials.filter((t) => t.role === filter);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Thank you! Your testimonial has been submitted for review.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      <section className="bg-hero-gradient section-padding text-center">
        <div className="container-narrow mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Testimonials</h1>
          <p className="text-primary-foreground/80 text-lg">Real stories of transformation and hope from the IACPD community.</p>
        </div>
      </section>

      {/* Filter */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${filter === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* Submit Testimonial */}
      <section className="section-padding bg-secondary">
        <div className="container-narrow mx-auto">
          <SectionHeading label="Share Your Story" title="Submit a Testimonial" description="Your experience can inspire others. Share how IACPD has impacted your life." />
          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 md:p-10 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                <input required type="text" maxLength={100} className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Category *</label>
                <select required className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select category</option>
                  <option value="Individual">Individual</option>
                  <option value="Couple">Couple</option>
                  <option value="Trainee">Trainee</option>
                  <option value="Leader">Leader</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Rating *</label>
                <select required className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
                  <option value="4">⭐⭐⭐⭐ (4 stars)</option>
                  <option value="3">⭐⭐⭐ (3 stars)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Photo (optional)</label>
                <input type="file" accept="image/*" className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Your Testimonial *</label>
                <textarea required rows={4} maxLength={1000} className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Share your experience with IACPD..." />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-start gap-2 text-sm text-muted-foreground">
                  <input required type="checkbox" className="mt-1" />
                  <span>I consent to IACPD displaying my testimonial on their website after approval. *</span>
                </label>
              </div>
            </div>
            <button type="submit" className="mt-6 w-full px-8 py-4 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity">
              Submit Testimonial
            </button>
          </form>
        </div>
      </section>

      <CTASection title="Inspired by These Stories?" description="Start your own transformation journey today." />
    </Layout>
  );
};

export default Testimonials;
