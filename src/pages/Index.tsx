import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Users, Brain, BookOpen, Shield, Sparkles, ArrowRight, ChevronDown, Mail } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/shared/SectionHeading";
import ServiceCard from "@/components/shared/ServiceCard";
import TestimonialCard from "@/components/shared/TestimonialCard";
import CTASection from "@/components/shared/CTASection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import HeroSlideshow from "@/components/shared/HeroSlideshow";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const services = [
  { icon: Heart, title: "Marriage & Family Counseling", description: "Strengthen your relationships through faith-guided couples therapy, pre-marital counseling, and family support.", price: "$80/session" },
  { icon: Brain, title: "Mental Health Counseling", description: "Faith-based mental health support integrating biblical principles with evidence-informed psychological practices.", price: "$70/session" },
  { icon: Users, title: "Leadership Development", description: "Equip yourself with leadership skills rooted in purpose, character, and strategic thinking.", price: "$120/session" },
  { icon: BookOpen, title: "Counseling Certification", description: "Professional training programs for aspiring counselors combining faith and clinical excellence.", price: "$500/program" },
  { icon: Shield, title: "Trauma & Crisis Support", description: "Compassionate, faith-centered crisis intervention and trauma recovery support.", price: "$75/session" },
  { icon: Sparkles, title: "Personal Coaching", description: "Unlock your potential with personalized coaching for productivity, purpose, and life growth.", price: "$90/session" },
];

const testimonials = [
  { name: "Grace Okonkwo", role: "Marriage Counseling Client", text: "IACPD saved our marriage. The faith-based approach helped us find healing we never thought possible. Our counselor truly listened and guided us with wisdom.", rating: 5, featured: true },
  { name: "David Mensah", role: "Leadership Training Participant", text: "The leadership development program transformed my approach to leading my team. I now lead with purpose and conviction.", rating: 5 },
  { name: "Amara Nwosu", role: "Individual Counseling Client", text: "After years of struggling with anxiety, the counseling sessions gave me tools grounded in faith and psychology to finally find peace.", rating: 5 },
];

const faqs = [
  { q: "What is faith-based counseling?", a: "Faith-based counseling integrates biblical principles with professional psychological methods to address emotional, relational, and spiritual needs holistically." },
  { q: "Are your counselors certified?", a: "Yes, all our counselors hold recognized certifications and have extensive experience in both clinical and faith-based counseling." },
  { q: "Can I book sessions online?", a: "Absolutely. We offer both online and in-person sessions for your convenience." },
  { q: "How much do sessions cost?", a: "Our pricing varies by service. Individual sessions start from $70. Visit our Services page for detailed pricing." },
];

const NewsletterForm = () => {
  const [nlEmail, setNlEmail] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail) return;
    setNlLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: nlEmail });
    setNlLoading(false);
    if (error) {
      if (error.code === "23505") toast.info("You're already subscribed!");
      else toast.error("Something went wrong.");
    } else {
      toast.success("You're subscribed! Welcome to the IACPD community.");
      setNlEmail("");
    }
  };
  return (
    <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleNewsletter}>
      <input type="email" required value={nlEmail} onChange={(e) => setNlEmail(e.target.value)} placeholder="Your email address" className="flex-1 px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      <button type="submit" disabled={nlLoading} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
        {nlLoading ? "..." : "Subscribe"}
      </button>
    </form>
  );
};

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <HeroSlideshow />
        <div className="relative z-10 container-wide mx-auto px-4 md:px-8 py-20">
          <motion.div initial="hidden" animate="visible" className="max-w-2xl">
            <motion.span variants={fadeUp} custom={0} className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-widest mb-6">
              Faith-Based Counseling
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-cream leading-tight mb-6">
              Transform Your Life Through Faith & Professional Guidance
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-cream/80 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              At IACPD, we combine divine wisdom and psychological science to help individuals, couples, and leaders thrive.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4">
              <Link to="/bookings" className="px-8 py-4 rounded-lg bg-accent text-accent-foreground font-semibold text-base hover:opacity-90 transition-opacity text-center">
                Book a Session Now
              </Link>
              <Link to="/services" className="px-8 py-4 rounded-lg border-2 border-cream/30 text-cream font-semibold text-base hover:bg-cream/10 transition-colors text-center">
                Explore Services
              </Link>
            </motion.div>
          </motion.div>
        </div>
        <a href="#intro" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cream/60 animate-bounce">
          <ChevronDown size={28} />
        </a>
      </section>

      {/* Introduction */}
      <section id="intro" className="section-padding bg-background">
        <div className="container-narrow mx-auto text-center">
          <SectionHeading
            label="Who We Are"
            title="International Agency for Counseling & Personal Development"
            description="Founded with a passion for empowering individuals, strengthening marriages, and equipping leaders, IACPD provides professional counseling services and practical training programs designed for real-life impact."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {[
              { num: "500+", label: "Lives Transformed" },
              { num: "15+", label: "Expert Counselors" },
              { num: "98%", label: "Client Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-4xl font-bold text-primary">{stat.num}</p>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding bg-secondary">
        <div className="container-wide mx-auto">
          <SectionHeading
            label="What We Offer"
            title="Our Core Services"
            description="Professional faith-based counseling and personal development services tailored to your unique needs."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <ServiceCard key={s.title} {...s} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/services" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              View All Services <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <SectionHeading label="Why IACPD" title="Why Choose Us" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Faith & Science", desc: "We integrate biblical principles with evidence-based psychology for holistic healing." },
              { title: "Certified Professionals", desc: "Our counselors are trained, certified, and experienced in their respective fields." },
              { title: "Confidential & Safe", desc: "We provide a secure, non-judgmental environment for every session." },
              { title: "Flexible Sessions", desc: "Choose between online and in-person sessions at times that work for you." },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-secondary">
        <div className="container-wide mx-auto">
          <SectionHeading label="Testimonials" title="What Our Clients Say" description="Real stories of transformation and hope from the IACPD community." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/testimonials" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              Read More Testimonials <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-background">
        <div className="container-narrow mx-auto">
          <SectionHeading label="FAQ" title="Frequently Asked Questions" />
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-card rounded-xl border border-border p-5">
                <summary className="font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <ChevronDown size={18} className="text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding bg-secondary">
        <div className="container-narrow mx-auto text-center">
          <Mail size={32} className="mx-auto text-primary mb-4" />
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">Stay Connected</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Get faith-based counseling tips, event updates, and resources delivered to your inbox.</p>
          <NewsletterForm />
        </div>
      </section>

      {/* Final CTA */}
      <CTASection
        title="Ready to Begin Your Transformation?"
        description="Take the first step toward healing, growth, and purpose. Our counselors are ready to walk this journey with you."
        primaryLabel="Book a Session Now"
        secondaryLabel="Learn About Us"
        secondaryLink="/about"
      />
    </Layout>
  );
};

export default Index;
