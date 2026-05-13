import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/shared/SectionHeading";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const SUPER_ADMINS = ["cuzoisrael@gmail.com", "softtech2care@gmail.com"];

const AdminAccess = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      setRoles((data || []).map((r: any) => r.role));
      setLoading(false);
    })();
  }, [authLoading, user]);

  const isSuperAdmin = !!user?.email && SUPER_ADMINS.includes(user.email.toLowerCase());
  const hasAdminRole = roles.includes("admin");

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh]">
        <div className="container-narrow mx-auto">
          <SectionHeading title="Admin Access Verification" description="Quickly verify your account roles and admin privileges." />

          {!user ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <ShieldAlert className="mx-auto mb-3 text-accent" size={36} />
              <p className="text-foreground font-medium mb-4">You are not signed in.</p>
              <Link to="/auth" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold">
                Sign In
              </Link>
            </div>
          ) : loading ? (
            <p className="text-center text-muted-foreground">Checking your access…</p>
          ) : (
            <div className="bg-card rounded-xl border border-border p-8 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Signed in as</p>
                <p className="font-heading text-lg font-semibold text-foreground">{user.email}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Assigned Roles</p>
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No roles assigned.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {roles.map((r) => (
                      <span
                        key={r}
                        className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold capitalize"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`rounded-lg p-4 border ${hasAdminRole ? "bg-primary/5 border-primary/30" : "bg-secondary border-border"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {hasAdminRole ? (
                      <CheckCircle2 className="text-primary" size={18} />
                    ) : (
                      <XCircle className="text-muted-foreground" size={18} />
                    )}
                    <p className="font-semibold text-foreground text-sm">Admin Role</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {hasAdminRole ? "You can access the admin dashboard." : "No admin role on this account."}
                  </p>
                </div>
                <div className={`rounded-lg p-4 border ${isSuperAdmin ? "bg-accent/10 border-accent/40" : "bg-secondary border-border"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {isSuperAdmin ? (
                      <ShieldCheck className="text-accent" size={18} />
                    ) : (
                      <ShieldAlert className="text-muted-foreground" size={18} />
                    )}
                    <p className="font-semibold text-foreground text-sm">Super Admin</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isSuperAdmin
                      ? "This email is recognized as a super-admin."
                      : "Super-admin status is reserved for designated emails."}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-secondary/60 p-4 text-xs text-muted-foreground">
                <p className="mb-1 font-semibold text-foreground">Designated super-admins</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {SUPER_ADMINS.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>

              {hasAdminRole && (
                <Link
                  to="/admin"
                  className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold"
                >
                  Open Admin Dashboard
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default AdminAccess;
