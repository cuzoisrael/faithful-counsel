// Public download endpoint for resources: returns a signed URL for the file
// and logs the download. Only serves resources marked active.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { resourceId } = await req.json();
    if (!resourceId || typeof resourceId !== "string") {
      return new Response(JSON.stringify({ error: "resourceId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Optionally read user (if logged in) from JWT
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await anonClient.auth.getUser();
      userId = user?.id ?? null;
    }

    const { data: resource, error: resErr } = await admin
      .from("resources")
      .select("id, file_path, active, title, mime_type")
      .eq("id", resourceId)
      .maybeSingle();

    if (resErr || !resource || !resource.active) {
      return new Response(JSON.stringify({ error: "Resource not available" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: signed, error: signErr } = await admin.storage
      .from("resources")
      .createSignedUrl(resource.file_path, 300, {
        download: resource.title.replace(/[^\w.-]+/g, "_"),
      });

    if (signErr || !signed) {
      return new Response(JSON.stringify({ error: "Failed to sign URL" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log access (best-effort)
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const ipHash = await hashString(ip);
    await admin.from("resource_downloads").insert({
      resource_id: resource.id,
      user_id: userId,
      ip_hash: ipHash,
      user_agent: req.headers.get("user-agent") ?? null,
    });
    // increment counter
    await admin.rpc("increment_resource_downloads", { _id: resource.id }).catch(async () => {
      // fallback if rpc doesn't exist
      await admin.from("resources")
        .update({ downloads_count: (await admin.from("resources").select("downloads_count").eq("id", resource.id).single()).data?.downloads_count + 1 || 1 })
        .eq("id", resource.id);
    });

    return new Response(JSON.stringify({ url: signed.signedUrl }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function hashString(s: string) {
  const buf = new TextEncoder().encode(s);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}
