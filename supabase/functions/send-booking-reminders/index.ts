// Edge Function: send-booking-reminders
// Sends WhatsApp reminders via GatewayAPI.
// Modes:
//   - default (cron): scans confirmed bookings ~24h out, not yet reminded.
//   - test mode: pass { booking_id, test: true } to send for a specific booking
//     immediately, bypassing the time window and the reminder_sent_at flag.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/gatewayapi";
const SITE_URL = "https://iacpd.org";

function toMsisdn(phone: string): number | null {
  const digits = (phone || "").replace(/[^\d]/g, "");
  if (digits.length < 8) return null;
  return Number(digits);
}

function b64url(bytes: ArrayBuffer): string {
  const b = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signBookingToken(bookingId: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(bookingId));
  return b64url(sig).slice(0, 32);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GATEWAYAPI_API_KEY = Deno.env.get("GATEWAYAPI_API_KEY");
  const LINK_SECRET = Deno.env.get("BOOKING_LINK_SECRET");
  if (!LOVABLE_API_KEY || !GATEWAYAPI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GatewayAPI connector not configured." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (!LINK_SECRET) {
    return new Response(
      JSON.stringify({ error: "BOOKING_LINK_SECRET not configured." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Parse optional body (test mode).
  let body: { booking_id?: string; test?: boolean } = {};
  try {
    if (req.method === "POST") body = await req.json();
  } catch { /* empty body is fine */ }

  let due: Array<{
    id: string; full_name: string; phone: string;
    preferred_date: string; preferred_time: string; session_format: string;
  }> = [];

  if (body.booking_id) {
    const { data, error } = await supabase
      .from("bookings")
      .select("id, full_name, phone, preferred_date, preferred_time, session_format")
      .eq("id", body.booking_id)
      .maybeSingle();
    if (error || !data) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    due = [data as typeof due[number]];
  } else {
    const now = new Date();
    const from = new Date(now.getTime() + 23 * 3600 * 1000);
    const to = new Date(now.getTime() + 25 * 3600 * 1000);
    const { data, error } = await supabase
      .from("bookings")
      .select("id, full_name, phone, preferred_date, preferred_time, session_format, reminder_sent_at")
      .eq("status", "confirmed")
      .is("reminder_sent_at", null);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    due = (data ?? []).filter((b) => {
      if (!b.preferred_date || !b.preferred_time) return false;
      const dt = new Date(`${b.preferred_date}T${b.preferred_time}`);
      return dt >= from && dt <= to;
    }) as typeof due;
  }

  const results: Array<{ id: string; ok: boolean; info?: unknown }> = [];

  for (const b of due) {
    const recipient = toMsisdn(b.phone);
    if (!recipient) {
      await supabase.from("reminder_logs").insert({
        booking_id: b.id, channel: "whatsapp", status: "failed",
        recipient: b.phone ?? null, error_message: "Invalid phone number",
      });
      results.push({ id: b.id, ok: false, info: "invalid phone" });
      continue;
    }

    const token = await signBookingToken(b.id, LINK_SECRET);
    const link = `${SITE_URL}/booking/view/${b.id}?t=${token}`;

    const prefix = body.test ? "[TEST] " : "";
    const message =
      `${prefix}Hi ${b.full_name}, this is a reminder from IACPD: your ${b.session_format} session is on ${b.preferred_date} at ${b.preferred_time}. ` +
      `View your booking securely: ${link}\nBlessings.`;

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
        reference: `booking-${b.id}${body.test ? "-test" : ""}`,
      }),
    });

    const ok = resp.ok;
    const respBody = await resp.text();
    results.push({ id: b.id, ok, info: ok ? "sent" : respBody });

    await supabase.from("reminder_logs").insert({
      booking_id: b.id,
      channel: body.test ? "whatsapp-test" : "whatsapp",
      status: ok ? "sent" : "failed",
      recipient: String(recipient),
      provider_response: respBody.slice(0, 2000),
      error_message: ok ? null : `HTTP ${resp.status}`,
    });

    if (ok && !body.test) {
      await supabase.from("bookings").update({ reminder_sent_at: new Date().toISOString() }).eq("id", b.id);
    }
  }

  return new Response(JSON.stringify({ processed: due.length, results, test: !!body.test }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
