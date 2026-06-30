import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    // Always show success to avoid email enumeration
    setSent(true);
    if (error) console.error(error);
    toast.success("If an account exists for that email, a reset link has been sent.");
  };

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh] flex items-center">
        <div className="container-narrow mx-auto max-w-md">
          <div className="bg-card rounded-xl border border-border p-8 shadow-card">
            <h1 className="font-heading text-2xl font-bold text-foreground text-center mb-2">Reset Password</h1>
            <p className="text-muted-foreground text-sm text-center mb-6">
              Enter your email and we'll send you a secure link to reset your password. The link expires in 1 hour.
            </p>

            {sent ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-foreground">Check your inbox for the reset link.</p>
                <Link to="/auth" className="inline-block text-sm text-primary hover:underline">
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="you@example.com"
                    maxLength={255}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
                <Link to="/auth" className="block text-center text-sm text-muted-foreground hover:text-foreground">
                  Back to sign in
                </Link>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ForgotPassword;
