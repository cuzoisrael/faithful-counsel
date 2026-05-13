import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import logoIcon from "@/assets/logo-icon.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Counselors", path: "/counselors" },
  { label: "Bookings", path: "/bookings" },
  { label: "Resources", path: "/resources" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container-wide mx-auto flex items-center justify-between px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoIcon} alt="IACPD" className="h-10 w-10" />
          <div className="hidden sm:block">
            <span className="font-heading text-lg font-bold text-primary leading-tight block">IACPD</span>
            <span className="text-[10px] text-muted-foreground leading-tight block">Counseling & Personal Development</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <User size={18} />
                <span className="max-w-[120px] truncate">{user.user_metadata?.full_name || user.email}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg border border-border shadow-elevated py-1 z-50">
                  <Link to="/my-bookings" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                    My Bookings
                  </Link>
                  <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                    Admin Panel
                  </Link>
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary transition-colors flex items-center gap-2">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              Sign In
            </Link>
          )}
          <Link
            to="/bookings"
            className="px-5 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Book a Session
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-md hover:bg-secondary transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav with animation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border bg-card overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/my-bookings" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-md text-sm font-medium text-foreground hover:bg-secondary">
                    My Bookings
                  </Link>
                  <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 rounded-md text-sm font-medium text-destructive hover:bg-secondary">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-md text-sm font-medium text-foreground hover:bg-secondary">
                  Sign In
                </Link>
              )}
              <Link
                to="/bookings"
                onClick={() => setMobileOpen(false)}
                className="block mt-3 px-4 py-3 rounded-lg bg-accent text-accent-foreground font-semibold text-sm text-center"
              >
                Book a Session
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
