import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      if (password.length < 6) { toast.error("Password must be at least 6 characters"); setLoading(false); return; }
      const { error } = await signUp(email, password, fullName);
      if (error) toast.error(error.message);
      else toast.success("Account created! Please check your email to verify your account.");
    } else {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
      else { toast.success("Welcome back!"); navigate("/"); }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Google sign-in failed");
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh] flex items-center">
        <div className="container-narrow mx-auto max-w-md">
          <div className="bg-card rounded-xl border border-border p-8 shadow-card">
            <h1 className="font-heading text-2xl font-bold text-foreground text-center mb-2">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground text-sm text-center mb-6">
              {mode === "signin" ? "Sign in to track your bookings" : "Join IACPD to book and manage sessions"}
            </p>

            <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Your full name" maxLength={100} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" maxLength={255} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" minLength={6} />
              </div>
              <button type="submit" disabled={loading} className="w-full px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-semibold hover:underline">
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
