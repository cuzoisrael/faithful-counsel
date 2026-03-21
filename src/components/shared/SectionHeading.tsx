interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  centered?: boolean;
}

const SectionHeading = ({ label, title, description, centered = true }: SectionHeadingProps) => {
  return (
    <div className={`mb-12 ${centered ? "text-center" : ""}`}>
      {label && (
        <span className="inline-block px-4 py-1.5 rounded-full bg-accent/15 text-accent-foreground text-xs font-semibold uppercase tracking-widest mb-4">
          {label}
        </span>
      )}
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">{title}</h2>
      {description && (
        <p className="mt-4 text-muted-foreground max-w-2xl leading-relaxed text-base md:text-lg mx-auto">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
