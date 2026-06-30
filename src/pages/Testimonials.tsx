import { useState, useEffect, useRef } from "react";
import { Play, ExternalLink } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";
import SectionHeading from "@/components/shared/SectionHeading";
import TestimonialCard from "@/components/shared/TestimonialCard";
import CTASection from "@/components/shared/CTASection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = ["All", "Individual", "Couple", "Trainee", "Leader"];

const VIDEO_FILE_ID = "1OveWOpDHJbpA-P09zwgKYrWeR1D_uvkI";
const VIDEO_EMBED_URL = `https://drive.google.com/file/d/${VIDEO_FILE_ID}/preview`;
const VIDEO_WATCH_URL = `https://drive.google.com/file/d/${VIDEO_FILE_ID}/view`;
const VIDEO_THUMBNAIL_URL = `https://drive.google.com/thumbnail?id=${VIDEO_FILE_ID}&sz=w1600`;

// Fallback testimonials for when DB is empty
const fallbackTestimonials = [
  { id: "f1", full_name: "Grace Okonkwo", role: "Couple", testimonial_text: "IACPD saved our marriage. The faith-based approach helped us find healing we never thought possible.", rating: 5, featured: true, image_url: null },
  { id: "f2", full_name: "David Mensah", role: "Leader", testimonial_text: "The leadership development program transformed my approach to leading my team.", rating: 5, featured: false, image_url: null },
  { id: "f3", full_name: "Amara Nwosu", role: "Individual", testimonial_text: "After years of struggling with anxiety, the counseling sessions gave me tools grounded in faith and psychology to finally find peace.", rating: 5, featured: true, image_url: null },
  { id: "f4", full_name: "Samuel Adekunle", role: "Trainee", testimonial_text: "The counseling certification program was rigorous, practical, and deeply transformative.", rating: 5, featured: false, image_url: null },
  { id: "f5", full_name: "Blessing Eze", role: "Individual", testimonial_text: "I walked in broken and walked out renewed. The care and professionalism made all the difference.", rating: 4, featured: false, image_url: null },
  { id: "f6", full_name: "Chidinma Obi", role: "Couple", testimonial_text: "Pre-marital counseling with IACPD prepared us for marriage in ways we didn't even know we needed.", rating: 5, featured: false, image_url: null },
];

const Testimonials = () => {
  const [filter, setFilter] = useState("All");
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [loading, setLoading] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const iframeLoadedRef = useRef(false);

  // If the iframe never fires onLoad within 8s, treat it as failed.
  useEffect(() => {
    if (!videoPlaying || videoFailed) return;
    const t = window.setTimeout(() => {
      if (!iframeLoadedRef.current) setVideoFailed(true);
    }, 8000);
    return () => window.clearTimeout(t);
  }, [videoPlaying, videoFailed]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase.from("testimonials").select("*").eq("status", "approved").order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setTestimonials(data.map((t) => ({ ...t, id: t.id })));
      }
    };
    fetchTestimonials();
  }, []);

  const filtered = filter === "All" ? testimonials : testimonials.filter((t) => t.role === filter);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const { error } = await supabase.from("testimonials").insert({
      full_name: fd.get("full_name") as string,
      role: fd.get("role") as string,
      testimonial_text: fd.get("testimonial_text") as string,
      rating: parseInt(fd.get("rating") as string) || 5,
    });

    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
    } else {
      toast.success("Thank you! Your testimonial has been submitted for review.");
      form.reset();
    }
  };

  return (
    <Layout>
      <SEO
        title="Client Testimonials"
        description="Hear from individuals, couples, and leaders whose lives have been transformed through IACPD's faith-based counseling and coaching — including Michael & Joy Inusa's story with Pastor Steve."
        path="/testimonials"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: "Michael & Joy Inusa — Personal Development with Pastor Steve",
          description:
            "Michael and Joy Inusa share their personal development journey with Pastor Steve Onyenweaku at IACPD.",
          thumbnailUrl: [VIDEO_THUMBNAIL_URL],
          uploadDate: "2025-01-01",
          contentUrl: VIDEO_WATCH_URL,
          embedUrl: VIDEO_EMBED_URL,
          publisher: {
            "@type": "Organization",
            name: "IACPD",
            url: "https://iacpd.org",
          },
        }}
      />
      <section className="bg-hero-gradient section-padding text-center">
        <div className="container-narrow mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Testimonials</h1>
          <p className="text-primary-foreground/80 text-lg">Real stories of transformation and hope from the IACPD community.</p>
        </div>
      </section>

      {/* Featured video testimony */}
      <section className="section-padding bg-background" aria-labelledby="featured-video-heading">
        <div className="container-narrow mx-auto">
          <SectionHeading
            label="Featured Video Testimony"
            title="Michael & Joy Inusa's Story"
            description="Hear Michael and Joy Inusa share their personal development journey with Pastor Steve Onyenweaku."
          />
          <figure className="mx-auto">
            <h2 id="featured-video-heading" className="sr-only">
              Michael & Joy Inusa — Personal Development with Pastor Steve
            </h2>
            <div
              className="relative w-full overflow-hidden rounded-xl border border-border shadow-card bg-black"
              style={{ aspectRatio: "16 / 9" }}
            >
              {!videoFailed && videoPlaying && (
                <iframe
                  src={`${VIDEO_EMBED_URL}?autoplay=1&mute=1`}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  title="Michael & Joy Inusa — Personal Development with Pastor Steve"
                  className="absolute inset-0 w-full h-full"
                  onLoad={() => {
                    iframeLoadedRef.current = true;
                  }}
                  onError={() => setVideoFailed(true)}
                />
              )}

              {!videoFailed && !videoPlaying && (
                <button
                  type="button"
                  onClick={() => setVideoPlaying(true)}
                  className="absolute inset-0 w-full h-full group focus:outline-none focus-visible:ring-4 focus-visible:ring-accent"
                  aria-label="Play Michael & Joy Inusa's video testimony"
                >
                  {!thumbFailed ? (
                    <img
                      src={VIDEO_THUMBNAIL_URL}
                      alt="Michael & Joy Inusa preparing to share their testimony"
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                      onError={() => setThumbFailed(true)}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70" aria-hidden="true" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent text-accent-foreground shadow-lg group-hover:scale-110 transition-transform">
                      <Play size={32} aria-hidden="true" className="ml-1" />
                    </span>
                  </span>
                </button>
              )}

              {videoFailed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-card">
                  {!thumbFailed && (
                    <img
                      src={VIDEO_THUMBNAIL_URL}
                      alt="Michael & Joy Inusa video preview"
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                      onError={() => setThumbFailed(true)}
                    />
                  )}
                  <div className="relative z-10 max-w-md">
                    <p className="font-heading text-lg font-semibold text-foreground mb-2">
                      Video can't be embedded here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      You can watch Michael & Joy Inusa's testimony directly on Google Drive.
                    </p>
                    <a
                      href={VIDEO_WATCH_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
                    >
                      Watch on Google Drive <ExternalLink size={16} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              )}
            </div>
            <figcaption className="mt-4 text-center">
              <p className="text-sm md:text-base text-foreground font-medium">
                Michael &amp; Joy Inusa — on their personal development journey with Pastor Steve
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Video plays muted by default. Tap the speaker icon in the player to enable sound,
                or{" "}
                <a
                  href={VIDEO_WATCH_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  open it on Google Drive
                </a>
                .
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${filter === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <TestimonialCard key={t.id} name={t.full_name} role={t.role} text={t.testimonial_text} rating={t.rating} image={t.image_url || undefined} featured={t.featured} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="container-narrow mx-auto">
          <SectionHeading label="Share Your Story" title="Submit a Testimonial" description="Your experience can inspire others. Share how IACPD has impacted your life." />
          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 md:p-10 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                <input required name="full_name" type="text" maxLength={100} className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Category *</label>
                <select required name="role" className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select category</option>
                  <option value="Individual">Individual</option>
                  <option value="Couple">Couple</option>
                  <option value="Trainee">Trainee</option>
                  <option value="Leader">Leader</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Rating *</label>
                <select required name="rating" className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
                  <option value="4">⭐⭐⭐⭐ (4 stars)</option>
                  <option value="3">⭐⭐⭐ (3 stars)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Your Testimonial *</label>
                <textarea required name="testimonial_text" rows={4} maxLength={1000} className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Share your experience with IACPD..." />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-start gap-2 text-sm text-muted-foreground">
                  <input required type="checkbox" className="mt-1" />
                  <span>I consent to IACPD displaying my testimonial on their website after approval. *</span>
                </label>
              </div>
            </div>
            <button type="submit" disabled={loading} className="mt-6 w-full px-8 py-4 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Submitting..." : "Submit Testimonial"}
            </button>
          </form>
        </div>
      </section>

      <CTASection title="Inspired by These Stories?" description="Start your own transformation journey today." />
    </Layout>
  );
};

export default Testimonials;
