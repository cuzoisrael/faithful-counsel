import { Link } from "react-router-dom";

interface CTASectionProps {
  title: string;
  description: string;
  primaryLabel?: string;
  primaryLink?: string;
  secondaryLabel?: string;
  secondaryLink?: string;
}

const CTASection = ({
  title,
  description,
  primaryLabel = "Book a Session",
  primaryLink = "/bookings",
  secondaryLabel,
  secondaryLink,
}: CTASectionProps) => {
  return (
    <section className="bg-hero-gradient section-padding">
      <div className="container-narrow mx-auto text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">{title}</h2>
        <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">{description}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={primaryLink}
            className="px-8 py-3.5 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            {primaryLabel}
          </Link>
          {secondaryLabel && secondaryLink && (
            <Link
              to={secondaryLink}
              className="px-8 py-3.5 rounded-lg border-2 border-primary-foreground/30 text-primary-foreground font-semibold hover:bg-primary-foreground/10 transition-colors"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
