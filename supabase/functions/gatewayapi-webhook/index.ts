// Edge Function: gatewayapi-webhook
// Receives delivery status callbacks from GatewayAPI and updates reminder_logs.
//
// Configure the webhook URL in the GatewayAPI dashboard as:
//   https://<project-ref>.functions.supabase.co/gatewayapi-webhook?key=<GATEWAYAPI_WEBHOOK_SECRET>
//
// GatewayAPI posts a JSON envelope (single or array) with at least:
//   { id, msisdn, status, time, error?, userref? }
// Status values include: DELIVERED, ACCEPTED, ENROUTE, REJECTED, EXPIRED, UNKNOWN, BUFFERED.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GatewayEvent {
  id?: number | string;
  msisdn?: number | string;
  status?: string;
  time?: number;
  error?: string | null;
  code?: number;
  userref?: string;
}

function classify(status: string): "delivered" | "failed" | "sent" | "pending" {
  const s = status.toUpperCase();
  if (s === "DELIVERED") return "delivered";
  if (["REJECTED", "EXPIRED", "UNKNOWN", "DELETED"].includes(s)) return "failed";
  if (["ACCEPTED", "ENROUTE", "BUFFERED"].includes(s)) return "sent";
  return "pending";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Shared-secret auth: GatewayAPI does not sign callbacks, so we require a
  // secret query param chosen by us and configured in the GatewayAPI dashboard.
  const expectedSecret = Deno.env.get("GATEWAYAPI_WEBHOOK_SECRET");
  const url = new URL(req.url);
  const providedSecret = url.searchParams.get("key") ?? req.headers.get("x-webhook-secret");
  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: unknown;
  try { payload = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const events: GatewayEvent[] = Array.isArray(payload)
    ? payload as GatewayEvent[]
    : [payload as GatewayEvent];

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let updated = 0;
  for (const ev of events) {
    if (!ev?.id || !ev?.status) continue;
    const messageId = String(ev.id);
    const deliveryStatus = classify(ev.status);
    const eventTime = ev.time ? new Date(ev.time * 1000).toISOString() : new Date().toISOString();

    const patch: Record<string, unknown> = {
      delivery_status: deliveryStatus,
      status_updated_at: eventTime,
      provider_response: JSON.stringify({ status: ev.status, error: ev.error ?? null, code: ev.code ?? null }),
    };
    if (deliveryStatus === "delivered") patch.delivered_at = eventTime;
    if (deliveryStatus === "failed" && ev.error) patch.error_message = String(ev.error).slice(0, 500);

    const { data, error } = await supabase
      .from("reminder_logs")
      .update(patch)
      .eq("provider_message_id", messageId)
      .select("id");
    if (!error && data && data.length) updated += data.length;
  }

  return new Response(JSON.stringify({ ok: true, events: events.length, updated }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
