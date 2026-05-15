import { useMemo, useState } from "react";
import { Download, BookOpen, FileText, Sparkles } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";
import SectionHeading from "@/components/shared/SectionHeading";
import { resources, therapyCategories, downloadResource, type ResourceKind } from "@/data/resources";

const kindMeta: Record<ResourceKind, { icon: any; label: string }> = {
  worksheet: { icon: FileText, label: "Worksheet" },
  reading: { icon: BookOpen, label: "Reading" },
  "prayer-journal": { icon: Sparkles, label: "Prayer Journal" },
};

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeKind, setActiveKind] = useState<ResourceKind | "All">("All");

  const filtered = useMemo(
    () =>
      resources.filter(
        (r) =>
          (activeCategory === "All" || r.category === activeCategory) &&
          (activeKind === "All" || r.kind === activeKind),
      ),
    [activeCategory, activeKind],
  );

  return (
    <Layout>
      <SEO title="Faith-Based Resources" description="Free downloadable worksheets, reading guides, and prayer journals organized by therapy type to support your growth between sessions." path="/resources" />
      <section className="bg-hero-gradient section-padding text-center">
        <div className="container-narrow mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Faith-Based Resources
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Downloadable worksheets, readings, and guided prayer journals to support your journey between sessions.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <div className="flex flex-col gap-6 mb-10">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">By Therapy Type</p>
              <div className="flex flex-wrap gap-2">
                {(["All", ...therapyCategories] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      activeCategory === c
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">By Format</p>
              <div className="flex flex-wrap gap-2">
                {(["All", "worksheet", "reading", "prayer-journal"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setActiveKind(k as any)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      activeKind === k
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-card text-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    {k === "All" ? "All" : kindMeta[k as ResourceKind].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No resources match your filters.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((r) => {
                const Icon = kindMeta[r.kind].icon;
                return (
                  <article key={r.id} className="bg-card rounded-xl border border-border p-6 card-hover flex flex-col">
                    <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
                      <Icon size={14} />
                      <span>{kindMeta[r.kind].label}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{r.category}</span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{r.title}</h3>
                    <p className="text-sm text-muted-foreground flex-1">{r.description}</p>
                    <button
                      onClick={() => downloadResource(r)}
                      className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                      <Download size={16} /> Download
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
