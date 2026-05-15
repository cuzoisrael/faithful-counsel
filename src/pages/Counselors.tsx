import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Briefcase, Loader2, Sparkles } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";
import SectionHeading from "@/components/shared/SectionHeading";
import { supabase } from "@/integrations/supabase/client";

interface Counselor {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  image_url: string | null;
  specialties: string[] | null;
  years_experience: number | null;
  credentials: string | null;
}

const Counselors = () => {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("counselors_public" as any)
        .select("id, name, title, bio, image_url, specialties, years_experience, credentials")
        .order("display_order", { ascending: true });
      setCounselors(((data as unknown) as Counselor[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <Layout>
      <SEO title="Our Counselors" description="Meet IACPD's certified counselors and coaches — view specialties, credentials, and book directly with the right fit for you." path="/counselors" />
      <section className="bg-hero-gradient section-padding text-center">
        <div className="container-narrow mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Our Counselors
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Meet the faith-rooted, clinically trained counselors walking with you toward wholeness.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <SectionHeading
            title="Meet the Team"
            description="Each counselor brings deep training, lived faith, and a heart for restoration."
          />

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : counselors.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">Counselor profiles coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {counselors.map((c) => (
                <article key={c.id} className="bg-card rounded-xl border border-border overflow-hidden card-hover flex flex-col">
                  <div className="aspect-[4/3] bg-secondary flex items-center justify-center overflow-hidden">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-heading text-5xl font-bold text-primary/30">
                        {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-heading text-xl font-bold text-foreground">{c.name}</h3>
                    <p className="text-sm text-primary font-medium mb-4">{c.title}</p>

                    {c.years_experience != null && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Briefcase size={14} className="text-accent" />
                        {c.years_experience}+ years of experience
                      </p>
                    )}
                    {c.credentials && (
                      <p className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                        <Award size={14} className="text-accent mt-0.5 shrink-0" />
                        <span>{c.credentials}</span>
                      </p>
                    )}

                    {c.specialties && c.specialties.length > 0 && (
                      <div className="mb-4">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
                          <Sparkles size={12} /> Specialties
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {c.specialties.map((s) => (
                            <span key={s} className="px-2.5 py-1 rounded-full bg-secondary text-xs text-foreground">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {c.bio && <p className="text-sm text-muted-foreground leading-relaxed flex-1">{c.bio}</p>}

                    <Link
                      to={`/bookings?counselor=${encodeURIComponent(c.name)}`}
                      className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                      Book with {c.name.split(" ")[0]}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Counselors;
