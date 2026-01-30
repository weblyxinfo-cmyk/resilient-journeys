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
  // Legacy support (with underscore prefix)
  monthly_basic: { priceAmount: 2700, interval: 'month', membershipType: 'basic', name: 'Basic Monthly' },
  yearly_basic: { priceAmount: 27000, interval: 'year', membershipType: 'basic', name: 'Basic Yearly' },
  monthly_premium: { priceAmount: 4700, interval: 'month', membershipType: 'premium', name: 'Premium Monthly' },
  yearly_premium: { priceAmount: 47000, interval: 'year', membershipType: 'premium', name: 'Premium Yearly' },
};

// Hub configurations (one-time payments)
const hubConfigs: Record<string, {
  priceAmount: number;
  name: string;
  description: string;
}> = {
  'transformed-self': {
    priceAmount: 12700,
    name: 'The Transformed Self Hub',
    description: 'Carrying Your Strength Across Borders'
  },
  'endometriosis': {
    priceAmount: 12700,
    name: 'Endometriosis Management Hub',
    description: 'Managing chronic pain while living abroad'
  },
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

    const {
      planId,
      product_type,
      hub_slug,
      successUrl,
      cancelUrl
    } = await req.json();

    // Determine if this is a plan or hub purchase
    const productType = product_type || planId; // Support both naming conventions
    const isHubPurchase = productType === 'hub' && hub_slug;

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

    let session;

    if (isHubPurchase) {
      // Hub purchase - one-time payment
      const hubConfig = hubConfigs[hub_slug];
      if (!hubConfig) {
        throw new Error("Invalid hub");
      }

      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: hubConfig.name,
                description: hubConfig.description,
              },
              unit_amount: hubConfig.priceAmount,
            },
            quantity: 1,
          },
        ],
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          user_id: user.id,
          purchase_type: 'one_time_hub',
          hub_slug: hub_slug,
        },
      });
    } else {
      // Membership plan - subscription
      const planConfig = planConfigs[productType];
      if (!planConfig) {
        throw new Error("Invalid plan");
      }

      session = await stripe.checkout.sessions.create({
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
          plan_id: productType,
          membership_type: planConfig.membershipType,
        },
      });
    }

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
