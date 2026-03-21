import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/shared/SectionHeading";
import CTASection from "@/components/shared/CTASection";

type PostType = "blog" | "resource" | "devotional" | "event";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  type: PostType;
  category: string;
  author: string;
  date: string;
  featured?: boolean;
  eventDate?: string;
  eventVenue?: string;
  image?: string;
}

const posts: Post[] = [
  { id: "1", title: "5 Biblical Principles for a Stronger Marriage", excerpt: "Discover how ancient wisdom can transform your modern relationship. These five principles have helped hundreds of couples reconnect.", type: "blog", category: "Marriage", author: "Dr. Adaeze Okafor", date: "2026-03-15", featured: true },
  { id: "2", title: "Overcoming Anxiety Through Faith and Science", excerpt: "How integrating faith practices with cognitive behavioral therapy can help you manage anxiety effectively.", type: "blog", category: "Mental Health", author: "Mrs. Chioma Eze", date: "2026-03-10" },
  { id: "3", title: "Free Guide: Starting Your Personal Development Journey", excerpt: "Download our comprehensive guide to help you set meaningful goals and build healthy habits.", type: "resource", category: "Personal Growth", author: "IACPD Team", date: "2026-03-08" },
  { id: "4", title: "Daily Devotional: Finding Peace in Uncertain Times", excerpt: "A 7-day devotional series exploring how faith provides an anchor during life's storms.", type: "devotional", category: "Devotional", author: "Pastor James Adeyemi", date: "2026-03-05" },
  { id: "5", title: "IACPD Annual Leadership Conference 2026", excerpt: "Join us for three days of powerful training, networking, and spiritual renewal at our annual conference in Lagos.", type: "event", category: "Leadership", author: "IACPD Events", date: "2026-02-28", eventDate: "June 15-17, 2026", eventVenue: "Lagos Convention Center", featured: true },
  { id: "6", title: "The Power of Forgiveness in Healing Trauma", excerpt: "Understanding how forgiveness, guided by faith, plays a crucial role in trauma recovery and emotional healing.", type: "blog", category: "Trauma Recovery", author: "Dr. Adaeze Okafor", date: "2026-02-20" },
];

const typeLabels: Record<PostType, string> = { blog: "Blog", resource: "Resource", devotional: "Devotional", event: "Event" };
const typeColors: Record<PostType, string> = { blog: "bg-primary/10 text-primary", resource: "bg-accent/15 text-accent-foreground", devotional: "bg-gold/15 text-accent-foreground", event: "bg-destructive/10 text-destructive" };

const Blog = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PostType | "all">("all");

  const filtered = posts
    .filter((p) => typeFilter === "all" || p.type === typeFilter)
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase()));

  const featured = posts.filter((p) => p.featured);

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
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "blog", "resource", "devotional", "event"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${typeFilter === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                >
                  {t === "all" ? "All" : typeLabels[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <article key={post.id} className="bg-card rounded-xl border border-border overflow-hidden card-hover flex flex-col">
                <div className="h-48 bg-secondary flex items-center justify-center">
                  <span className="text-muted-foreground text-sm font-medium">{post.category}</span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[post.type]}`}>
                      {typeLabels[post.type]}
                    </span>
                    {post.featured && <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent-foreground text-xs font-medium">Featured</span>}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">{post.excerpt}</p>
                  {post.eventDate && (
                    <div className="mt-3 p-3 rounded-lg bg-secondary text-sm">
                      <p className="font-medium text-foreground">📅 {post.eventDate}</p>
                      <p className="text-muted-foreground">📍 {post.eventVenue}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary cursor-pointer hover:text-primary/80 transition-colors">
                      Read →
                    </span>
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
