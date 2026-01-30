import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("Starting membership cleanup job...");

    // Find all expired memberships
    const now = new Date().toISOString();
    const { data: expiredUsers, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, email, membership_type, membership_expires_at")
      .lt("membership_expires_at", now)
      .neq("membership_type", "free");

    if (fetchError) {
      console.error("Error fetching expired memberships:", fetchError);
      throw fetchError;
    }

    const expiredCount = expiredUsers?.length || 0;
    console.log(`Found ${expiredCount} expired memberships`);

    // Update them to 'free'
    if (expiredUsers && expiredUsers.length > 0) {
      const userIds = expiredUsers.map((u) => u.user_id);

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ membership_type: "free" })
        .in("user_id", userIds);

      if (updateError) {
        console.error("Error updating profiles to free tier:", updateError);
        throw updateError;
      }

      console.log(`Successfully updated ${userIds.length} users to free tier`);

      // Log the cleaned up users for audit trail
      expiredUsers.forEach((user) => {
        console.log(
          `Cleaned up: ${user.email} (expired: ${user.membership_expires_at})`
        );
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        cleaned: expiredCount,
        timestamp: now,
        users: expiredUsers?.map((u) => ({
          email: u.email,
          previous_type: u.membership_type,
          expired_at: u.membership_expires_at,
        })),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Membership cleanup error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
