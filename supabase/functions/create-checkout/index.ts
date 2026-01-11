import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Plan configurations
const planConfigs: Record<string, { 
  priceAmount: number; 
  interval: 'month' | 'year'; 
  membershipType: 'basic' | 'premium';
  name: string;
}> = {
  basic_monthly: { priceAmount: 2700, interval: 'month', membershipType: 'basic', name: 'Basic Monthly' },
  basic_yearly: { priceAmount: 27000, interval: 'year', membershipType: 'basic', name: 'Basic Yearly' },
  premium_monthly: { priceAmount: 4700, interval: 'month', membershipType: 'premium', name: 'Premium Monthly' },
  premium_yearly: { priceAmount: 47000, interval: 'year', membershipType: 'premium', name: 'Premium Yearly' },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY.");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Get user from auth header
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { planId, successUrl, cancelUrl } = await req.json();

    const planConfig = planConfigs[planId];
    if (!planConfig) {
      throw new Error("Invalid plan");
    }

    // Check if customer exists
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      // Save customer ID to profile
      await supabaseClient
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: planConfig.name,
              description: `${planConfig.membershipType.charAt(0).toUpperCase() + planConfig.membershipType.slice(1)} membership`,
            },
            unit_amount: planConfig.priceAmount,
            recurring: {
              interval: planConfig.interval,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        membership_type: planConfig.membershipType,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
