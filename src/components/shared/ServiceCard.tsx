import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price?: string;
  link?: string;
}

const ServiceCard = ({ icon: Icon, title, description, price, link = "/bookings" }: ServiceCardProps) => {
  return (
    <div className="card-hover bg-card rounded-xl p-6 md:p-8 border border-border flex flex-col">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
        <Icon size={24} className="text-primary" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed flex-1">{description}</p>
      {price && <p className="mt-4 text-accent font-semibold text-sm">Starting from {price}</p>}
      <Link
        to={link}
        className="mt-5 inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        Book Now →
      </Link>
    </div>
  );
};

export default ServiceCard;
