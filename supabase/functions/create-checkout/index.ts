import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowed origins for redirect URLs to prevent open-redirect attacks
const ALLOWED_ORIGIN = 'https://resilientmind.io';
const ALLOWED_ORIGINS = [ALLOWED_ORIGIN, 'https://www.resilientmind.io', 'http://localhost:5173', 'http://localhost:8080'];

function isAllowedRedirectUrl(url: string): boolean {
  return ALLOWED_ORIGINS.some((origin) => url.startsWith(origin + '/') || url === origin);
}

function validateRedirectUrl(url: string, label: string): string {
  if (!url || !isAllowedRedirectUrl(url)) {
    throw new Error(`Invalid ${label}: redirect URL must start with an allowed origin`);
  }
  return url;
}

// Old spellings that predate tier_key. Mapped here, not duplicated as rows
// in membership_tiers — the canonical key is always e.g. "basic_monthly".
const LEGACY_TIER_ALIASES: Record<string, string> = {
  monthly_basic: 'basic_monthly',
  yearly_basic: 'basic_yearly',
  monthly_premium: 'premium_monthly',
  yearly_premium: 'premium_yearly',
};

function resolveTierKey(productType: string): string {
  return LEGACY_TIER_ALIASES[productType] ?? productType;
}

interface PlanConfig {
  priceAmount: number; // cents — what Stripe actually charges
  interval: 'month' | 'year';
  membershipType: 'basic' | 'premium';
  name: string;
}

interface HubConfig {
  priceAmount: number; // cents
  name: string;
  description: string;
}

/**
 * Membership plan price/config, read from membership_tiers — the table the
 * admin edits. FAIL-CLOSED: unlike booking_create's loadSessionConfig, there
 * is no hardcoded price fallback here. A wrong one-time booking price is a
 * refund; a wrong *subscription* price is a Stripe ad-hoc price that keeps
 * charging every month until someone finds it manually. A failed checkout is
 * always recoverable — a silently wrong subscription is not.
 * See docs/cms-review.md §B1.
 */
// deno-lint-ignore no-explicit-any
async function loadPlanConfig(supabaseClient: any, tierKey: string): Promise<PlanConfig | null> {
  try {
    const { data, error } = await supabaseClient
      .from("membership_tiers")
      .select("name, price_eur, billing_interval, membership_type")
      .eq("tier_key", tierKey)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const priceAmount = Math.round(Number(data.price_eur) * 100);
    if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
      console.error("Invalid price on membership_tiers row, refusing checkout:", tierKey, data.price_eur);
      return null;
    }

    return {
      priceAmount,
      interval: data.billing_interval,
      membershipType: data.membership_type,
      name: data.name,
    };
  } catch (err) {
    console.error("membership_tiers lookup failed, refusing checkout:", err);
    return null;
  }
}

/** Hub (one-time purchase) price/config, read from hub_products. Same fail-closed reasoning as loadPlanConfig. */
// deno-lint-ignore no-explicit-any
async function loadHubConfig(supabaseClient: any, hubSlug: string): Promise<HubConfig | null> {
  try {
    const { data, error } = await supabaseClient
      .from("hub_products")
      .select("name, description, price_eur")
      .eq("hub_slug", hubSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const priceAmount = Math.round(Number(data.price_eur) * 100);
    if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
      console.error("Invalid price on hub_products row, refusing checkout:", hubSlug, data.price_eur);
      return null;
    }

    return {
      priceAmount,
      name: data.name,
      description: data.description ?? "",
    };
  } catch (err) {
    console.error("hub_products lookup failed, refusing checkout:", err);
    return null;
  }
}

const CHECKOUT_UNAVAILABLE_MESSAGE = "Checkout is temporarily unavailable. Please try again in a moment.";
const PRICE_CHANGED_MESSAGE = "The price has just changed. Please refresh the page and try again.";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from auth header — required for every branch, including diagnose.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    const token = authHeader.replace("Bearer ", "");

    // Auth client to verify user
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);

    // Service-role client for DB operations (RLS bypass)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Diagnostic branch: GET /create-checkout?diagnose=1 — admin-only, never
    // creates a Stripe session. Lets an admin verify the DB→cents mapping
    // (the × 100 and rounding) for every tier/hub without a real payment.
    // See docs/cms-review.md §C4.
    const url = new URL(req.url);
    if (req.method === "GET" && url.searchParams.get("diagnose") === "1") {
      const { data: isAdmin } = await supabaseClient.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        });
      }

      const [{ data: tiers, error: tiersError }, { data: hubs, error: hubsError }] = await Promise.all([
        supabaseClient.from("membership_tiers").select("tier_key, price_eur").eq("is_active", true),
        supabaseClient.from("hub_products").select("hub_slug, price_eur").eq("is_active", true),
      ]);
      if (tiersError) throw tiersError;
      if (hubsError) throw hubsError;

      const diagnostics = [
        ...(tiers ?? []).map((t: { tier_key: string; price_eur: number }) => ({
          tier_key: t.tier_key,
          unit_amount: Math.round(Number(t.price_eur) * 100),
          currency: "eur",
        })),
        ...(hubs ?? []).map((h: { hub_slug: string; price_eur: number }) => ({
          tier_key: h.hub_slug,
          unit_amount: Math.round(Number(h.price_eur) * 100),
          currency: "eur",
        })),
      ];

      return new Response(JSON.stringify(diagnostics), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY.");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const {
      planId,
      product_type,
      hub_slug,
      expectedPriceEur,
      successUrl: rawSuccessUrl,
      cancelUrl: rawCancelUrl,
    } = await req.json();

    // Validate redirect URLs to prevent open-redirect attacks
    const successUrl = validateRedirectUrl(rawSuccessUrl, 'successUrl');
    const cancelUrl = validateRedirectUrl(rawCancelUrl, 'cancelUrl');

    // Determine if this is a plan or hub purchase
    const productType = product_type || planId; // Support both naming conventions
    const isHubPurchase = productType === 'hub' && hub_slug;

    // Client sends what price it rendered; if it disagrees with the DB, the
    // visitor is looking at a stale CMS cache or an old JS bundle — refuse
    // rather than charge a price nobody currently sees. See §B2.
    const expectedAmount =
      typeof expectedPriceEur === "number" && Number.isFinite(expectedPriceEur)
        ? Math.round(expectedPriceEur * 100)
        : null;

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
      const hubConfig = await loadHubConfig(supabaseClient, hub_slug);
      if (!hubConfig) {
        return new Response(JSON.stringify({ error: CHECKOUT_UNAVAILABLE_MESSAGE }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      if (expectedAmount !== null && expectedAmount !== hubConfig.priceAmount) {
        return new Response(JSON.stringify({ error: PRICE_CHANGED_MESSAGE }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        payment_method_types: ["card"],
        allow_promotion_codes: true,
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
          product_type: 'hub',
          hub_slug: hub_slug,
        },
      });
    } else {
      // Membership plan - subscription
      const tierKey = resolveTierKey(productType);
      const planConfig = await loadPlanConfig(supabaseClient, tierKey);
      if (!planConfig) {
        return new Response(JSON.stringify({ error: CHECKOUT_UNAVAILABLE_MESSAGE }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      if (expectedAmount !== null && expectedAmount !== planConfig.priceAmount) {
        return new Response(JSON.stringify({ error: PRICE_CHANGED_MESSAGE }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        allow_promotion_codes: true,
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
          plan_id: tierKey,
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
