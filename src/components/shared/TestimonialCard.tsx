import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  text: string;
  rating: number;
  image?: string;
  featured?: boolean;
}

const TestimonialCard = ({ name, role, text, rating, image, featured }: TestimonialCardProps) => {
  return (
    <div className={`card-hover rounded-xl p-6 md:p-8 border ${featured ? "border-accent bg-accent/5" : "border-border bg-card"}`}>
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={16} className={i < rating ? "fill-accent text-accent" : "text-border"} />
        ))}
      </div>
      <p className="text-foreground/90 text-sm leading-relaxed italic mb-6">"{text}"</p>
      <div className="flex items-center gap-3">
        {image ? (
          <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {name.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-sm text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
