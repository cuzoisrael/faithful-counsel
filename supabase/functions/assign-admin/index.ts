import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { email } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "Email required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Find user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    
    const user = users.find((u: any) => u.email === email);
    if (!user) return new Response(JSON.stringify({ error: "User not found. Sign up first." }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Check if already admin
    const { data: existing } = await supabase.from("user_roles").select("id").eq("user_id", user.id).eq("role", "admin").single();
    if (existing) return new Response(JSON.stringify({ message: "Already an admin" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Insert admin role
    const { error: insertError } = await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: "Admin role assigned", user_id: user.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
