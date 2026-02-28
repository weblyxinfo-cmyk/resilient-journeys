import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing sessionId");

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Security: verify this session belongs to the requesting user
    if (session.metadata?.user_id !== user.id) {
      throw new Error("Session does not belong to this user");
    }

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ status: "unpaid", membership_type: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check current profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("membership_type, membership_expires_at, stripe_customer_id, purchased_hubs")
      .eq("user_id", user.id)
      .single();

    const membershipType = session.metadata?.membership_type;

    // Validate membership_type before writing to DB
    const validMembershipTypes = ["basic", "premium"];
    if (membershipType && !validMembershipTypes.includes(membershipType)) {
      throw new Error(`Invalid membership_type: ${membershipType}`);
    }

    // If profile already has correct membership and it hasn't expired, no action needed
    if (
      profile?.membership_type === membershipType &&
      profile?.membership_expires_at &&
      new Date(profile.membership_expires_at) > new Date()
    ) {
      return new Response(
        JSON.stringify({ status: "already_active", membership_type: membershipType }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Webhook hasn't processed yet — apply membership now
    console.log(`Verify-checkout fallback: activating ${membershipType} for user ${user.id}`);

    if (session.mode === "subscription" && session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

      // Security: verify subscription is actually active (prevent replay with cancelled/refunded subscriptions)
      if (subscription.status !== "active" && subscription.status !== "trialing") {
        throw new Error(`Subscription is not active (status: ${subscription.status})`);
      }

      const expiresAt = new Date(subscription.current_period_end * 1000);

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          membership_type: membershipType,
          membership_started_at: new Date().toISOString(),
          membership_expires_at: expiresAt.toISOString(),
          stripe_customer_id: session.customer as string,
        })
        .eq("user_id", user.id);
      if (updateError) throw new Error(`Failed to update profile: ${updateError.message}`);
    } else if (session.mode === "payment") {
      // Security: verify the payment hasn't been refunded (prevent replay attacks)
      if (session.payment_intent) {
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
        const latestCharge = paymentIntent.latest_charge;
        if (latestCharge) {
          const charge = await stripe.charges.retrieve(latestCharge as string);
          if (charge.refunded) {
            throw new Error("Payment has been refunded");
          }
        }
      }

      // One-time payment (yearly or hub)
      const productType = session.metadata?.product_type;

      if (productType === "hub") {
        const hubSlug = session.metadata?.hub_slug;
        if (hubSlug) {
          const currentHubs = profile?.purchased_hubs || [];
          if (!currentHubs.includes(hubSlug)) {
            const { error: updateError } = await supabaseAdmin
              .from("profiles")
              .update({ purchased_hubs: [...currentHubs, hubSlug] })
              .eq("user_id", user.id);
            if (updateError) throw new Error(`Failed to update purchased_hubs: ${updateError.message}`);
          }
        }
      } else if (membershipType) {
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            membership_type: membershipType,
            membership_started_at: new Date().toISOString(),
            membership_expires_at: expiresAt.toISOString(),
            stripe_customer_id: session.customer as string,
          })
          .eq("user_id", user.id);
        if (updateError) throw new Error(`Failed to update profile: ${updateError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ status: "activated", membership_type: membershipType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Verify-checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
