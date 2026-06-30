import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

type Factor = { id: string; status: string; friendly_name?: string | null };

const AccountSecurity = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [pendingFactor, setPendingFactor] = useState<{ id: string; qrSvg: string; secret: string; uri: string } | null>(
    null
  );
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  const refresh = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp || []) as Factor[]);
  };

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  const startEnroll = async () => {
    setEnrolling(true);
    // Clean up any unverified factors first
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all || []) {
      if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
    });
    setEnrolling(false);
    if (error || !data) {
      toast.error(error?.message || "Could not start enrollment.");
      return;
    }
    setPendingFactor({
      id: data.id,
      qrSvg: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    });
  };

  const verifyEnroll = async () => {
    if (!pendingFactor) return;
    setBusy(true);
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: pendingFactor.id });
    if (chErr || !ch) {
      setBusy(false);
      toast.error("Could not start challenge.");
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: pendingFactor.id,
      challengeId: ch.id,
      code: otp.trim(),
    });
    setBusy(false);
    if (error) {
      toast.error("Invalid code. Try again.");
      return;
    }
    toast.success("Two-factor authentication enabled.");
    setPendingFactor(null);
    setOtp("");
    refresh();
  };

  const removeFactor = async (id: string) => {
    if (!confirm("Disable two-factor authentication for this device?")) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Two-factor disabled.");
    refresh();
  };

  const verifiedFactors = factors.filter((f) => f.status === "verified");

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh]">
        <div className="container-narrow mx-auto max-w-2xl">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Account Security</h1>
          <p className="text-muted-foreground mb-8">
            Add an extra layer of protection by requiring a one-time code from an authenticator app.
          </p>

          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  Two-Factor Authentication (TOTP)
                </h2>
                <p className="text-sm text-muted-foreground">
                  {verifiedFactors.length > 0 ? "Active on this account." : "Optional, but strongly recommended."}
                </p>
              </div>
            </div>

            {verifiedFactors.length > 0 && (
              <ul className="space-y-2 mb-6">
                {verifiedFactors.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/40"
                  >
                    <span className="text-sm text-foreground">{f.friendly_name || "Authenticator app"}</span>
                    <button
                      onClick={() => removeFactor(f.id)}
                      className="text-sm text-destructive hover:underline"
                    >
                      Disable
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!pendingFactor && verifiedFactors.length === 0 && (
              <button
                onClick={startEnroll}
                disabled={enrolling}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {enrolling ? "Preparing..." : "Enable Two-Factor"}
              </button>
            )}

            {pendingFactor && (
              <div className="space-y-4 mt-2">
                <p className="text-sm text-foreground">
                  Scan this QR code with Google Authenticator, 1Password, Authy, or any TOTP app, then enter the
                  6-digit code to confirm.
                </p>
                <div
                  className="bg-white p-4 rounded-lg inline-block border border-border"
                  dangerouslySetInnerHTML={{ __html: pendingFactor.qrSvg }}
                />
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer">Can't scan? Enter manually</summary>
                  <code className="block mt-2 p-2 rounded bg-secondary break-all">{pendingFactor.secret}</code>
                </details>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Code from your authenticator
                  </label>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-40 px-4 py-3 rounded-lg border border-input bg-card text-foreground text-lg tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="000000"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={verifyEnroll}
                    disabled={busy || otp.length !== 6}
                    className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {busy ? "Verifying..." : "Confirm & enable"}
                  </button>
                  <button
                    onClick={async () => {
                      await supabase.auth.mfa.unenroll({ factorId: pendingFactor.id });
                      setPendingFactor(null);
                      setOtp("");
                    }}
                    className="px-5 py-2.5 rounded-lg border border-input text-sm hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AccountSecurity;
