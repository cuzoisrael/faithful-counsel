// Edge Function: sync-booking-to-calendar
// One-way export: pushes a confirmed booking into the workspace Google Calendar
// using the Lovable Google Calendar connector. Call from admin UI when a booking is confirmed.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GCAL_URL = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GCAL_KEY = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  if (!LOVABLE_API_KEY || !GCAL_KEY) {
    return new Response(JSON.stringify({ error: "Google Calendar connector not configured." }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: { booking_id?: string };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!payload.booking_id) {
    return new Response(JSON.stringify({ error: "booking_id required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: b, error } = await supabase
    .from("bookings")
    .select("id, full_name, email, phone, service_type, session_format, preferred_date, preferred_time, message, preferred_counselor")
    .eq("id", payload.booking_id)
    .maybeSingle();

  if (error || !b) {
    return new Response(JSON.stringify({ error: error?.message ?? "Booking not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const start = new Date(`${b.preferred_date}T${b.preferred_time}`);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1h default

  const event = {
    summary: `IACPD ${b.service_type} — ${b.full_name}`,
    description: [
      `Service: ${b.service_type}`,
      `Format: ${b.session_format}`,
      `Counselor: ${b.preferred_counselor ?? "—"}`,
      `Client email: ${b.email}`,
      `Client phone: ${b.phone}`,
      b.message ? `\nNotes: ${b.message}` : "",
    ].join("\n"),
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    attendees: [{ email: b.email, displayName: b.full_name }],
    source: { title: "IACPD", url: "https://iacpd.org/my-bookings" },
  };

  const resp = await fetch(`${GCAL_URL}/calendars/primary/events?sendUpdates=all`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GCAL_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  const body = await resp.text();
  if (!resp.ok) {
    return new Response(JSON.stringify({ error: "Google Calendar error", status: resp.status, body }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const created = JSON.parse(body);
  await supabase
    .from("bookings")
    .update({ google_event_id: created.id, google_event_link: created.htmlLink })
    .eq("id", b.id);

  return new Response(JSON.stringify({ ok: true, event_id: created.id, link: created.htmlLink }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
