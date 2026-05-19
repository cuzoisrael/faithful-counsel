import { useEffect, useMemo, useState } from "react";
import { Download, BookOpen, FileText, Sparkles, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Kind = "worksheet" | "reading" | "prayer-journal";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  kind: Kind;
}

const kindMeta: Record<Kind, { icon: any; label: string }> = {
  worksheet: { icon: FileText, label: "Worksheet" },
  reading: { icon: BookOpen, label: "Reading" },
  "prayer-journal": { icon: Sparkles, label: "Prayer Journal" },
};

const Resources = () => {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeKind, setActiveKind] = useState<Kind | "All">("All");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("id, title, description, category, kind")
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (error) toast({ title: "Failed to load resources", description: error.message, variant: "destructive" });
      setItems((data as Resource[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(items.map((r) => r.category))).sort(),
    [items],
  );

  const filtered = useMemo(
    () =>
      items.filter(
        (r) =>
          (activeCategory === "All" || r.category === activeCategory) &&
          (activeKind === "All" || r.kind === activeKind),
      ),
    [items, activeCategory, activeKind],
  );

  const download = async (r: Resource) => {
    setDownloadingId(r.id);
    try {
      const { data, error } = await supabase.functions.invoke("resource-download", {
        body: { resourceId: r.id },
      });
      if (error) throw error;
      const url = (data as { url?: string })?.url;
      if (!url) throw new Error("No download URL returned");
      window.open(url, "_blank", "noopener");
    } catch (e: any) {
      toast({ title: "Download failed", description: e.message, variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };

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
                {(["All", ...categories]).map((c) => (
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
                    {k === "All" ? "All" : kindMeta[k as Kind].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-16">Loading resources…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No resources match your filters.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((r) => {
                const Icon = kindMeta[r.kind].icon;
                const isDownloading = downloadingId === r.id;
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
                      onClick={() => download(r)}
                      disabled={isDownloading}
                      className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      {isDownloading ? "Preparing…" : "Download"}
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
