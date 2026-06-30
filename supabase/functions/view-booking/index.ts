// Edge Function: view-booking
// Returns booking details for a signed token. Public (no auth) — relies on
// HMAC(BOOKING_LINK_SECRET, booking_id) verification of the supplied token.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function b64url(bytes: ArrayBuffer): string {
  const b = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(bookingId: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(bookingId));
  return b64url(sig).slice(0, 32);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const bookingId = url.searchParams.get("id");
  const token = url.searchParams.get("t");
  const secret = Deno.env.get("BOOKING_LINK_SECRET");

  if (!bookingId || !token || !secret) {
    return new Response(JSON.stringify({ error: "Missing parameters" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const expected = await sign(bookingId, secret);
  if (!constantTimeEqual(expected, token)) {
    return new Response(JSON.stringify({ error: "Invalid or expired link" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("bookings")
    .select("id, full_name, email, phone, service_type, session_format, preferred_date, preferred_time, preferred_counselor, status, notes")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !data) {
    return new Response(JSON.stringify({ error: "Booking not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ booking: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
