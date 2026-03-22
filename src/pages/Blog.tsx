import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Search } from "lucide-react";
import Layout from "@/components/layout/Layout";
import CTASection from "@/components/shared/CTASection";
import { supabase } from "@/integrations/supabase/client";

type PostType = "blog" | "resource" | "devotional" | "event";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  post_type: string;
  category: string | null;
  author: string | null;
  created_at: string;
  featured: boolean;
  event_date: string | null;
  event_venue: string | null;
}

const typeLabels: Record<string, string> = { blog: "Blog", resource: "Resource", devotional: "Devotional", event: "Event" };
const typeColors: Record<string, string> = { blog: "bg-primary/10 text-primary", resource: "bg-accent/15 text-accent-foreground", devotional: "bg-gold/15 text-accent-foreground", event: "bg-destructive/10 text-destructive" };

const Blog = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, post_type, category, author, created_at, featured, event_date, event_venue")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (data) setPosts(data);
    };
    fetchPosts();
  }, []);

  const filtered = posts
    .filter((p) => typeFilter === "all" || p.post_type === typeFilter)
    .filter((p) => (p.title + (p.excerpt || "")).toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <section className="bg-hero-gradient section-padding text-center">
        <div className="container-narrow mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Blog, Resources & Events</h1>
          <p className="text-primary-foreground/80 text-lg">Faith-based insights, practical resources, and upcoming events to support your growth.</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "blog", "resource", "devotional", "event"].map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${typeFilter === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {t === "all" ? "All" : typeLabels[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <article key={post.id} className="bg-card rounded-xl border border-border overflow-hidden card-hover flex flex-col">
                <div className="h-48 bg-secondary flex items-center justify-center">
                  <span className="text-muted-foreground text-sm font-medium">{post.category}</span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[post.post_type] || "bg-secondary text-foreground"}`}>
                      {typeLabels[post.post_type] || post.post_type}
                    </span>
                    {post.featured && <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent-foreground text-xs font-medium">Featured</span>}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">{post.excerpt}</p>
                  {post.event_date && (
                    <div className="mt-3 p-3 rounded-lg bg-secondary text-sm">
                      <p className="font-medium text-foreground">📅 {post.event_date}</p>
                      <p className="text-muted-foreground">📍 {post.event_venue}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">Read →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No posts found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      <CTASection title="Stay Updated" description="Subscribe to our newsletter for the latest articles, resources, and event announcements." primaryLabel="Subscribe" primaryLink="/contact" />
    </Layout>
  );
};

export default Blog;
