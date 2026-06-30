// Edge Function: view-booking
// Public endpoint. Returns booking details + reminder timeline when the request
// presents a valid signed token. Tokens are versioned and expire — see
// supabase/functions/_shared/booking-token.ts.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { verifyBookingToken } from "../_shared/booking-token.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const bookingId = url.searchParams.get("id");
  const token = url.searchParams.get("t");

  if (!bookingId || !token) return json({ error: "Missing parameters" }, 400);
  if (!/^[0-9a-f-]{36}$/i.test(bookingId)) return json({ error: "Malformed booking id" }, 400);

  const verdict = await verifyBookingToken(bookingId, token);
  if (!verdict.ok) {
    const status = verdict.reason === "expired" ? 410 : 403;
    return json({ error: verdict.reason === "expired" ? "This link has expired." : "Invalid link." }, status);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id, full_name, email, phone, service_type, session_format, preferred_date, preferred_time, preferred_counselor, status, notes")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !booking) return json({ error: "Booking not found" }, 404);

  const { data: reminders } = await supabase
    .from("reminder_logs")
    .select("id, channel, status, delivery_status, recipient, error_message, provider_response, delivered_at, status_updated_at, created_at")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false })
    .limit(50);

  return json({
    booking,
    reminders: reminders ?? [],
    token: { version: verdict.version, expires_at: verdict.expiresAt },
  });
});
