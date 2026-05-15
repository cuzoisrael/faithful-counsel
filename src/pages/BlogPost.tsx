import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User } from "lucide-react";
import Layout from "@/components/layout/Layout";
import CTASection from "@/components/shared/CTASection";
import SEO from "@/components/shared/SEO";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  post_type: string;
  category: string | null;
  author: string | null;
  created_at: string;
  featured: boolean;
  event_date: string | null;
  event_venue: string | null;
  featured_image: string | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      setPost(data);
      setLoading(false);
    };
    if (slug) fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="section-padding bg-background min-h-[60vh] flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="section-padding bg-background min-h-[60vh] flex flex-col items-center justify-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-primary font-semibold hover:underline">← Back to Blog</Link>
        </div>
      </Layout>
    );
  }

  const description = (post.excerpt || post.content || "").slice(0, 155);
  return (
    <Layout>
      <SEO
        title={post.title}
        description={description || `Read ${post.title} on the IACPD blog.`}
        path={`/blog/${post.slug}`}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          author: { "@type": "Person", name: post.author || "IACPD" },
          datePublished: post.created_at,
          image: post.featured_image || undefined,
          mainEntityOfPage: `https://iacpd.lovable.app/blog/${post.slug}`,
        }}
      />
      <section className="bg-hero-gradient section-padding text-center">
        <div className="container-narrow mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-sm mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">{post.title}</h1>
          <div className="flex items-center justify-center gap-4 text-primary-foreground/70 text-sm">
            {post.author && <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>}
            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-narrow mx-auto max-w-3xl">
          {post.event_date && (
            <div className="mb-8 p-4 rounded-xl bg-secondary border border-border">
              <p className="font-medium text-foreground">📅 Event Date: {post.event_date}</p>
              {post.event_venue && <p className="text-muted-foreground">📍 Venue: {post.event_venue}</p>}
            </div>
          )}
          <div className="prose prose-lg max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
            {post.content || post.excerpt || "No content available."}
          </div>
        </div>
      </section>

      <CTASection title="Ready to Transform Your Life?" description="Book a session with one of our professional counselors today." primaryLabel="Book a Session" primaryLink="/bookings" />
    </Layout>
  );
};

export default BlogPost;
