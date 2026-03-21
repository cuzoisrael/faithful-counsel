import { Link } from "react-router-dom";
import { Heart, Brain, Users, BookOpen, Shield, Sparkles, GraduationCap, Briefcase, ArrowRight, ChevronDown } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/shared/SectionHeading";
import CTASection from "@/components/shared/CTASection";

const serviceCategories = [
  {
    id: "marriage",
    title: "Marriage, Family & Relationship Counseling",
    icon: Heart,
    services: [
      { title: "One-on-One Sessions", desc: "Personalized individual counseling addressing personal challenges, emotional health, and spiritual growth.", duration: "60 min", price: "$80" },
      { title: "Couples Therapy", desc: "Guided sessions for couples seeking to strengthen their relationship, resolve conflict, and deepen intimacy.", duration: "90 min", price: "$120" },
      { title: "Pre-Marital Counseling", desc: "Prepare for a strong, healthy marriage with faith-centered guidance on communication, expectations, and partnership.", duration: "60 min", price: "$90" },
    ],
  },
  {
    id: "general",
    title: "General Counseling",
    icon: Brain,
    services: [
      { title: "Career Counseling", desc: "Discover your calling and develop a purposeful career path aligned with your gifts and values.", duration: "60 min", price: "$70" },
      { title: "Faith-Based Mental Health Counseling", desc: "Address anxiety, depression, and emotional struggles through an integrated faith and psychology approach.", duration: "60 min", price: "$75" },
      { title: "Trauma & Crisis Counseling", desc: "Compassionate support for individuals dealing with trauma, grief, loss, or crisis situations.", duration: "60 min", price: "$80" },
    ],
  },
  {
    id: "training",
    title: "Training & Certification",
    icon: GraduationCap,
    services: [
      { title: "Counseling Certification Program", desc: "A comprehensive training program for aspiring faith-based counselors. Covers theory, practice, and supervised sessions.", duration: "12 weeks", price: "$500" },
      { title: "Leadership Development Program", desc: "Equip leaders with skills in strategic thinking, emotional intelligence, and purpose-driven leadership.", duration: "8 weeks", price: "$400" },
    ],
  },
  {
    id: "personal",
    title: "Personal Development & Coaching",
    icon: Sparkles,
    services: [
      { title: "Personal Coaching", desc: "One-on-one coaching to unlock your potential, set goals, and build accountability for lasting growth.", duration: "60 min", price: "$90" },
      { title: "Productivity & Life Growth Programs", desc: "Structured programs designed to help you build better habits, manage time, and achieve your personal goals.", duration: "6 weeks", price: "$350" },
      { title: "Corporate & Leadership Training", desc: "Customized training for organizations looking to develop emotionally intelligent, faith-grounded leaders.", duration: "Custom", price: "Contact us" },
    ],
  },
];

const howItWorks = [
  { step: "1", title: "Choose a Service", desc: "Browse our services and find the right fit for your needs." },
  { step: "2", title: "Book a Session", desc: "Select your preferred counselor, format, date, and time." },
  { step: "3", title: "Make Payment", desc: "Complete your payment securely via our supported methods." },
  { step: "4", title: "Begin Your Journey", desc: "Attend your session and start your transformation." },
];

const Services = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-hero-gradient section-padding text-center">
        <div className="container-narrow mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Our Services</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">Professional faith-based counseling, training, and personal development services tailored to transform every area of your life.</p>
          {/* Section Jump Nav */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {serviceCategories.map((cat) => (
              <a key={cat.id} href={`#${cat.id}`} className="px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium hover:bg-primary-foreground/20 transition-colors">
                {cat.title.split(",")[0]}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      {serviceCategories.map((cat) => (
        <section key={cat.id} id={cat.id} className="section-padding even:bg-secondary odd:bg-background">
          <div className="container-wide mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <cat.icon size={22} className="text-primary" />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">{cat.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.services.map((s) => (
                <div key={s.title} className="bg-card rounded-xl p-6 border border-border card-hover flex flex-col">
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">{s.desc}</p>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                    <div>
                      <span className="text-xs text-muted-foreground">{s.duration}</span>
                      <span className="mx-2 text-border">|</span>
                      <span className="text-sm font-semibold text-accent">{s.price}</span>
                    </div>
                    <Link to="/bookings" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                      Book Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* How It Works */}
      <section className="section-padding bg-background">
        <div className="container-narrow mx-auto">
          <SectionHeading label="Process" title="How It Works" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-secondary">
        <div className="container-narrow mx-auto">
          <SectionHeading label="FAQ" title="Service Questions" />
          <div className="space-y-4">
            {[
              { q: "What happens during the first session?", a: "Your first session is an intake meeting where we understand your background, concerns, and goals. It helps us tailor a personalized plan for you." },
              { q: "Can I switch counselors?", a: "Yes. We want you to feel completely comfortable. You can request a different counselor at any time." },
              { q: "Do you offer group sessions?", a: "Yes, we offer group workshops and training programs alongside individual sessions." },
              { q: "Is everything confidential?", a: "Absolutely. All sessions are held in strict confidence following professional ethical guidelines." },
            ].map((faq) => (
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

      <CTASection
        title="Find the Right Service for You"
        description="Not sure where to start? Contact us and we'll help you find the best path forward."
        primaryLabel="Book a Session"
        secondaryLabel="Contact Us"
        secondaryLink="/contact"
      />
    </Layout>
  );
};

export default Services;
