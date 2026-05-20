import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLOT_MINUTES = 60;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const counselorId = url.searchParams.get("counselor_id");
    const date = url.searchParams.get("date"); // YYYY-MM-DD
    if (!counselorId || !date) {
      return new Response(JSON.stringify({ error: "counselor_id and date required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const d = new Date(date + "T00:00:00Z");
    const weekday = d.getUTCDay();

    const [{ data: avail }, { data: timeOff }, { data: bookings }] = await Promise.all([
      supabase.from("counselor_availability").select("start_time, end_time")
        .eq("counselor_id", counselorId).eq("weekday", weekday).eq("active", true),
      supabase.from("counselor_time_off").select("start_at, end_at")
        .eq("counselor_id", counselorId)
        .lte("start_at", `${date}T23:59:59Z`).gte("end_at", `${date}T00:00:00Z`),
      supabase.from("bookings").select("preferred_time, status")
        .eq("counselor_id", counselorId).eq("preferred_date", date)
        .neq("status", "cancelled"),
    ]);

    const takenSet = new Set((bookings || []).map((b: any) => (b.preferred_time as string).slice(0, 5)));
    const slots: string[] = [];

    for (const a of avail || []) {
      const [sh, sm] = (a.start_time as string).split(":").map(Number);
      const [eh, em] = (a.end_time as string).split(":").map(Number);
      let cur = sh * 60 + sm;
      const end = eh * 60 + em;
      while (cur + SLOT_MINUTES <= end) {
        const hh = String(Math.floor(cur / 60)).padStart(2, "0");
        const mm = String(cur % 60).padStart(2, "0");
        const time = `${hh}:${mm}`;
        const slotStart = new Date(`${date}T${time}:00Z`).getTime();
        const slotEnd = slotStart + SLOT_MINUTES * 60_000;
        const blocked = (timeOff || []).some((t: any) => {
          const s = new Date(t.start_at).getTime();
          const e = new Date(t.end_at).getTime();
          return slotStart < e && slotEnd > s;
        });
        if (!blocked && !takenSet.has(time)) slots.push(time);
        cur += SLOT_MINUTES;
      }
    }

    return new Response(JSON.stringify({ slots }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
