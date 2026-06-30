// Edge Function: send-booking-reminders
// Sends a WhatsApp reminder via GatewayAPI for every confirmed booking ~24h out.
// Trigger: scheduled cron (every 15 min recommended).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/gatewayapi";

function toMsisdn(phone: string): number | null {
  const digits = (phone || "").replace(/[^\d]/g, "");
  if (digits.length < 8) return null;
  return Number(digits);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GATEWAYAPI_API_KEY = Deno.env.get("GATEWAYAPI_API_KEY");
  if (!LOVABLE_API_KEY || !GATEWAYAPI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GatewayAPI connector not configured. Connect GatewayAPI in Lovable to enable WhatsApp reminders." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Window: bookings 23h–25h ahead, confirmed, not yet reminded.
  const now = new Date();
  const from = new Date(now.getTime() + 23 * 3600 * 1000);
  const to = new Date(now.getTime() + 25 * 3600 * 1000);

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, full_name, phone, preferred_date, preferred_time, session_format, reminder_sent_at")
    .eq("status", "confirmed")
    .is("reminder_sent_at", null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const due = (bookings ?? []).filter((b) => {
    if (!b.preferred_date || !b.preferred_time) return false;
    const dt = new Date(`${b.preferred_date}T${b.preferred_time}`);
    return dt >= from && dt <= to;
  });

  const results: Array<{ id: string; ok: boolean; info?: unknown }> = [];

  for (const b of due) {
    const recipient = toMsisdn(b.phone);
    if (!recipient) {
      results.push({ id: b.id, ok: false, info: "invalid phone" });
      continue;
    }

    const message =
      `Hi ${b.full_name}, this is a reminder from IACPD: your ${b.session_format} session is tomorrow at ${b.preferred_time}. ` +
      `Reply here or visit https://iacpd.org/my-bookings to manage. Blessings.`;

    const resp = await fetch(`${GATEWAY_URL}/mobile/single`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GATEWAYAPI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: "IACPD",
        recipient,
        message,
        reference: `booking-${b.id}`,
      }),
    });

    const ok = resp.ok;
    const body = await resp.text();
    results.push({ id: b.id, ok, info: ok ? "sent" : body });

    await supabase.from("reminder_logs").insert({
      booking_id: b.id,
      channel: "whatsapp",
      status: ok ? "sent" : "failed",
      recipient: String(recipient),
      provider_response: body.slice(0, 2000),
      error_message: ok ? null : `HTTP ${resp.status}`,
    });

    if (ok) {
      await supabase.from("bookings").update({ reminder_sent_at: new Date().toISOString() }).eq("id", b.id);
    }
  }

  return new Response(JSON.stringify({ processed: due.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
