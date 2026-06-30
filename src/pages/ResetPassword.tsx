import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase places a recovery session via URL hash; onAuthStateChange fires PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Also accept if already in a recovery session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. Please sign in.");
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh] flex items-center">
        <div className="container-narrow mx-auto max-w-md">
          <div className="bg-card rounded-xl border border-border p-8 shadow-card">
            <h1 className="font-heading text-2xl font-bold text-foreground text-center mb-2">Set New Password</h1>
            <p className="text-muted-foreground text-sm text-center mb-6">
              {ready ? "Choose a new password for your account." : "Validating reset link..."}
            </p>
            {ready && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">New password</label>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirm password</label>
                  <input
                    required
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    minLength={8}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ResetPassword;
