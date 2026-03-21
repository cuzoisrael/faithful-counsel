import { motion } from "framer-motion";
import { Eye, Target, Heart, BookOpen, Shield, Users } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/shared/SectionHeading";
import CTASection from "@/components/shared/CTASection";
import aboutHero from "@/assets/about-hero.jpg";
import counselor1 from "@/assets/counselor-1.jpg";
import counselor2 from "@/assets/counselor-2.jpg";
import counselor3 from "@/assets/counselor-3.jpg";

const values = [
  { icon: Heart, title: "Compassion", desc: "We approach every individual with empathy, love, and understanding." },
  { icon: BookOpen, title: "Biblical Foundation", desc: "Our work is rooted in scripture and guided by divine principles." },
  { icon: Shield, title: "Integrity", desc: "We uphold the highest ethical and professional standards." },
  { icon: Users, title: "Community", desc: "We believe in the power of supportive, faith-centered community." },
];

const counselors = [
  { name: "Dr. Adaeze Okafor", title: "Lead Counselor & Founder", specialization: "Marriage & Family Therapy", bio: "Over 15 years of experience in faith-based counseling. PhD in Clinical Psychology with a focus on family dynamics.", image: counselor1 },
  { name: "Pastor James Adeyemi", title: "Senior Counselor & Life Coach", specialization: "Leadership & Career Development", bio: "Certified life coach and pastoral counselor with 20+ years of experience in leadership training and mentorship.", image: counselor2 },
  { name: "Mrs. Chioma Eze", title: "Marriage & Relationship Counselor", specialization: "Couples Therapy & Pre-Marital Counseling", bio: "Passionate about helping couples build strong, lasting relationships grounded in faith and mutual respect.", image: counselor3 },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center">
        <div className="absolute inset-0">
          <img src={aboutHero} alt="About IACPD" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="relative z-10 container-wide mx-auto px-4 md:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-cream">About Us</h1>
          <p className="text-cream/80 mt-3 text-lg">Learn about our mission, vision, and the people behind IACPD</p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="section-padding bg-background">
        <div className="container-narrow mx-auto">
          <SectionHeading label="Our Story" title="Who We Are" />
          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-4 text-center">
            <p>The International Agency for Counseling and Personal Development is a faith-based organization committed to transforming lives through the integration of biblical principles and psychological insight.</p>
            <p>Founded with a passion for empowering individuals, strengthening marriages, and equipping leaders, the Agency provides professional counseling services and practical training programs designed for real-life impact.</p>
            <p>We believe that true transformation occurs when spiritual truth meets emotional healing and personal growth. Our approach combines Christian faith with evidence-informed counseling practices to address the complexities of human behavior, relationships, and purpose.</p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section-padding bg-secondary">
        <div className="container-wide mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card rounded-xl p-8 border border-border card-hover">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Eye size={24} className="text-primary" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-foreground mb-3">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">To become a globally recognized center for faith-based counseling and personal development, equipping people across nations to live whole, lead effectively, and build strong relationships.</p>
          </div>
          <div className="bg-card rounded-xl p-8 border border-border card-hover">
            <div className="w-12 h-12 rounded-lg bg-accent/15 flex items-center justify-center mb-4">
              <Target size={24} className="text-accent" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-foreground mb-3">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">Through our counseling services, training programs, and personal development initiatives, we are raising individuals who are emotionally healthy, spiritually grounded, and purpose-driven.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <SectionHeading label="What Drives Us" title="Our Core Values" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="text-center p-6 bg-card rounded-xl border border-border card-hover">
                <v.icon size={28} className="mx-auto text-primary mb-4" />
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Counselors */}
      <section className="section-padding bg-secondary">
        <div className="container-wide mx-auto">
          <SectionHeading label="Our Team" title="Meet Our Counselors & Coaches" description="Experienced, certified professionals dedicated to your transformation." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {counselors.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card rounded-xl overflow-hidden border border-border card-hover"
              >
                <img src={c.image} alt={c.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h3 className="font-heading text-xl font-bold text-foreground">{c.name}</h3>
                  <p className="text-accent text-sm font-semibold mt-1">{c.title}</p>
                  <p className="text-primary text-xs font-medium mt-1">{c.specialization}</p>
                  <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{c.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Start Your Journey?"
        description="Connect with our team of experienced counselors and begin your path to transformation."
        secondaryLabel="View Services"
        secondaryLink="/services"
      />
    </Layout>
  );
};

export default About;
