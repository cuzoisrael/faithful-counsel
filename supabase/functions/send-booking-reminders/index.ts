// Edge Function: send-booking-reminders
// Sends WhatsApp reminders via GatewayAPI.
// Modes:
//   - default (cron, anonymous): scans confirmed bookings ~24h out, not yet reminded.
//   - test mode: POST { booking_id, test: true } with an admin user JWT in the
//     Authorization header. The function verifies the caller is an admin and
//     applies strict per-admin + per-booking rate limits before sending.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { signBookingToken, getCurrentSecretVersion } from "../_shared/booking-token.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/gatewayapi";
const SITE_URL = "https://iacpd.org";

// Strict rate limits for admin-triggered test sends.
const TEST_PER_ADMIN_PER_MINUTE = 3;
const TEST_PER_ADMIN_PER_HOUR = 20;
const TEST_PER_BOOKING_PER_5MIN = 1;

function toMsisdn(phone: string): number | null {
  const digits = (phone || "").replace(/[^\d]/g, "");
  if (digits.length < 8) return null;
  return Number(digits);
}

function isUuid(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GATEWAYAPI_API_KEY = Deno.env.get("GATEWAYAPI_API_KEY");
  if (!LOVABLE_API_KEY || !GATEWAYAPI_API_KEY) {
    return jsonResponse({ error: "GatewayAPI connector not configured." }, 503);
  }
  if (!Deno.env.get("BOOKING_LINK_SECRET")) {
    return jsonResponse({ error: "BOOKING_LINK_SECRET not configured." }, 503);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Parse & validate body.
  let body: { booking_id?: unknown; test?: unknown } = {};
  if (req.method === "POST") {
    try { body = await req.json(); } catch { /* allow empty */ }
  }
  const isTest = body.test === true;
  let triggeredBy: string | null = null;

  // --- Authorization & rate limits (test mode only) ---
  if (isTest) {
    if (!isUuid(body.booking_id)) {
      return jsonResponse({ error: "booking_id must be a valid UUID" }, 400);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!jwt) return jsonResponse({ error: "Authentication required for test mode" }, 401);

    const authedClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${jwt}` } } },
    );
    const { data: userData, error: userErr } = await authedClient.auth.getUser();
    if (userErr || !userData?.user) return jsonResponse({ error: "Invalid session" }, 401);
    triggeredBy = userData.user.id;

    const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
      _user_id: triggeredBy, _role: "admin",
    });
    if (roleErr || !isAdmin) return jsonResponse({ error: "Admin role required" }, 403);

    // Rate limit: per admin / minute and per admin / hour.
    const now = Date.now();
    const sinceMin = new Date(now - 60_000).toISOString();
    const sinceHour = new Date(now - 3_600_000).toISOString();
    const since5 = new Date(now - 5 * 60_000).toISOString();

    const [{ count: perMin }, { count: perHour }, { count: perBooking }] = await Promise.all([
      admin.from("reminder_logs").select("id", { count: "exact", head: true })
        .eq("triggered_by", triggeredBy).gte("created_at", sinceMin),
      admin.from("reminder_logs").select("id", { count: "exact", head: true })
        .eq("triggered_by", triggeredBy).gte("created_at", sinceHour),
      admin.from("reminder_logs").select("id", { count: "exact", head: true })
        .eq("booking_id", body.booking_id as string).eq("channel", "whatsapp-test")
        .gte("created_at", since5),
    ]);

    if ((perMin ?? 0) >= TEST_PER_ADMIN_PER_MINUTE) {
      return jsonResponse({ error: `Rate limit: max ${TEST_PER_ADMIN_PER_MINUTE} test sends per minute.` }, 429);
    }
    if ((perHour ?? 0) >= TEST_PER_ADMIN_PER_HOUR) {
      return jsonResponse({ error: `Rate limit: max ${TEST_PER_ADMIN_PER_HOUR} test sends per hour.` }, 429);
    }
    if ((perBooking ?? 0) >= TEST_PER_BOOKING_PER_5MIN) {
      return jsonResponse({ error: "This booking already received a test reminder in the last 5 minutes." }, 429);
    }
  }

  // --- Load due bookings ---
  let due: Array<{
    id: string; full_name: string; phone: string;
    preferred_date: string; preferred_time: string; session_format: string;
  }> = [];

  if (isTest) {
    const { data, error } = await admin
      .from("bookings")
      .select("id, full_name, phone, preferred_date, preferred_time, session_format")
      .eq("id", body.booking_id as string)
      .maybeSingle();
    if (error || !data) return jsonResponse({ error: "Booking not found" }, 404);
    due = [data as typeof due[number]];
  } else {
    const now = new Date();
    const from = new Date(now.getTime() + 23 * 3600 * 1000);
    const to = new Date(now.getTime() + 25 * 3600 * 1000);
    const { data, error } = await admin
      .from("bookings")
      .select("id, full_name, phone, preferred_date, preferred_time, session_format, reminder_sent_at")
      .eq("status", "confirmed")
      .is("reminder_sent_at", null);
    if (error) return jsonResponse({ error: error.message }, 500);
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
      await admin.from("reminder_logs").insert({
        booking_id: b.id, channel: isTest ? "whatsapp-test" : "whatsapp",
        status: "failed", delivery_status: "failed",
        recipient: b.phone ?? null, error_message: "Invalid phone number",
        triggered_by: triggeredBy, secret_version: getCurrentSecretVersion(),
      });
      results.push({ id: b.id, ok: false, info: "invalid phone" });
      continue;
    }

    const { token, expiresAt, version } = await signBookingToken(b.id);
    const link = `${SITE_URL}/booking/view/${b.id}?t=${token}`;
    const expiresOn = new Date(expiresAt * 1000).toISOString().slice(0, 10);

    const prefix = isTest ? "[TEST] " : "";
    const message =
      `${prefix}Hi ${b.full_name}, this is a reminder from IACPD: your ${b.session_format} session is on ${b.preferred_date} at ${b.preferred_time}. ` +
      `View your booking securely (link expires ${expiresOn}): ${link}\nBlessings.`;

    const reference = `booking-${b.id}${isTest ? "-test" : ""}-${Date.now()}`;
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
        userref: reference,
      }),
    });

    const ok = resp.ok;
    const respBody = await resp.text();
    let providerMessageId: string | null = null;
    try {
      const parsed = JSON.parse(respBody);
      providerMessageId = parsed?.ids?.[0] ? String(parsed.ids[0]) : parsed?.id ? String(parsed.id) : null;
    } catch { /* not JSON */ }

    results.push({ id: b.id, ok, info: ok ? "sent" : respBody });

    await admin.from("reminder_logs").insert({
      booking_id: b.id,
      channel: isTest ? "whatsapp-test" : "whatsapp",
      status: ok ? "sent" : "failed",
      delivery_status: ok ? "sent" : "failed",
      recipient: String(recipient),
      provider_response: respBody.slice(0, 2000),
      provider_message_id: providerMessageId,
      error_message: ok ? null : `HTTP ${resp.status}`,
      triggered_by: triggeredBy,
      secret_version: version,
      status_updated_at: new Date().toISOString(),
    });

    if (ok && !isTest) {
      await admin.from("bookings").update({ reminder_sent_at: new Date().toISOString() }).eq("id", b.id);
    }
  }

  return jsonResponse({ processed: due.length, results, test: isTest });
});
