import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-wide mx-auto section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logoIcon} alt="IACPD" className="h-8 w-8" />
              <h3 className="font-heading text-xl font-bold">IACPD</h3>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
              Transforming Lives Through Faith-Based Counseling and Personal Development.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Home", path: "/" },
                { label: "About Us", path: "/about" },
                { label: "Services", path: "/services" },
                { label: "Bookings", path: "/bookings" },
                { label: "Testimonials", path: "/testimonials" },
                { label: "Blog & Resources", path: "/blog" },
                { label: "Contact Us", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>Marriage & Family Counseling</li>
              <li>Career Counseling</li>
              <li>Mental Health Counseling</li>
              <li>Trauma & Crisis Support</li>
              <li>Leadership Development</li>
              <li>Personal Coaching</li>
              <li>Counseling Certification</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-0.5 shrink-0" />
                <a href="mailto:info@iacpd.org" className="hover:text-primary-foreground transition-colors">info@iacpd.org</a>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={16} className="mt-0.5 shrink-0" />
                <a href="tel:+18000000000" className="hover:text-primary-foreground transition-colors">+1 (800) 000-0000</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link to="/bookings" className="inline-block px-5 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                Book a Session
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} International Agency for Counseling and Personal Development. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-primary-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
