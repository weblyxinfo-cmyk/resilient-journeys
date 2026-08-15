import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowed origins for redirect URLs to prevent open-redirect attacks — same
// list as create-checkout.
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REGISTRATION_UNAVAILABLE_MESSAGE = "Registration is temporarily unavailable. Please try again in a moment.";
const PRICE_CHANGED_MESSAGE = "The price has just changed. Please refresh the page and try again.";

interface WorkshopConfig {
  title: string;
  priceAmount: number; // cents
  currency: string; // lowercase ISO code, as Stripe expects
  stripePaymentLink: string | null;
}

/**
 * Same allow-list an admin is meant to be restricted to in AdminBlog.tsx,
 * enforced again here since this is the value that actually decides where a
 * visitor's browser goes next — trusting an unvalidated DB value (which
 * could in theory be edited outside the admin form) would be an open
 * redirect. https:// only, host is buy.stripe.com or any *.stripe.com
 * subdomain.
 */
function isValidStripePaymentLink(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return parsed.hostname === "buy.stripe.com" || parsed.hostname.endsWith(".stripe.com");
  } catch {
    return false;
  }
}

/**
 * Price/title for a paid workshop, read from blog_posts — the table the
 * admin edits. FAIL-CLOSED like create-checkout's loadPlanConfig/
 * loadHubConfig: a lookup error or missing/unpublished/non-paid workshop
 * refuses the registration rather than falling back to a price from the
 * request. See docs/cms-review.md §B1 for why this matters more than it
 * looks — a wrong one-time charge is a refund, but never silently trust
 * the client for the amount.
 */
// deno-lint-ignore no-explicit-any
async function loadWorkshopConfig(supabaseClient: any, workshopId: string): Promise<WorkshopConfig | null> {
  try {
    const { data, error } = await supabaseClient
      .from("blog_posts")
      .select("title, workshop_price, workshop_currency, is_paid_workshop, is_published, category, stripe_payment_link")
      .eq("id", workshopId)
      .eq("category", "workshop")
      .eq("is_paid_workshop", true)
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const priceAmount = Math.round(Number(data.workshop_price) * 100);
    if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
      console.error("Invalid price on blog_posts row, refusing registration:", workshopId, data.workshop_price);
      return null;
    }

    // An invalid stored link (shouldn't happen — AdminBlog.tsx validates on
    // save — but the column has no DB-level format check) falls back to
    // null, i.e. the normal in-house Stripe Checkout path. Never redirect
    // anywhere on the strength of an unvalidated value.
    let stripePaymentLink: string | null = null;
    if (typeof data.stripe_payment_link === "string" && data.stripe_payment_link.trim()) {
      const trimmed = data.stripe_payment_link.trim();
      if (isValidStripePaymentLink(trimmed)) {
        stripePaymentLink = trimmed;
      } else {
        console.error("Invalid stripe_payment_link on blog_posts row, falling back to built-in checkout:", workshopId, trimmed);
      }
    }

    return {
      title: data.title,
      priceAmount,
      currency: (data.workshop_currency || "EUR").toLowerCase(),
      stripePaymentLink,
    };
  } catch (err) {
    console.error("blog_posts lookup failed, refusing registration:", err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY.");
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      workshopId,
      name,
      email,
      phone,
      note,
      expectedPriceEur,
      successUrl: rawSuccessUrl,
      cancelUrl: rawCancelUrl,
    } = await req.json();

    if (!workshopId || typeof workshopId !== "string") {
      throw new Error("Missing workshopId");
    }
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim() : "";
    if (!trimmedName || !trimmedEmail) {
      throw new Error("Missing required fields: name, email");
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      throw new Error("Invalid email format");
    }

    const successUrl = validateRedirectUrl(rawSuccessUrl, "successUrl");
    const cancelUrl = validateRedirectUrl(rawCancelUrl, "cancelUrl");

    const workshop = await loadWorkshopConfig(supabaseClient, workshopId);
    if (!workshop) {
      return new Response(JSON.stringify({ error: REGISTRATION_UNAVAILABLE_MESSAGE }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Client sends what price it rendered; if it disagrees with the DB, the
    // visitor is looking at a stale CMS cache or an old JS bundle — refuse
    // rather than charge a price nobody currently sees. See create-checkout §B2.
    // Skipped for a payment-link workshop: the actual charge amount lives in
    // the Payment Link's own Stripe configuration, not workshop_price, so
    // this check has nothing authoritative to compare against — see
    // docs/workshop-payment-link.md for the resulting risk (workshop_price
    // can drift out of sync with what the link actually charges).
    const expectedAmount =
      typeof expectedPriceEur === "number" && Number.isFinite(expectedPriceEur)
        ? Math.round(expectedPriceEur * 100)
        : null;
    if (!workshop.stripePaymentLink && expectedAmount !== null && expectedAmount !== workshop.priceAmount) {
      return new Response(JSON.stringify({ error: PRICE_CHANGED_MESSAGE }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Registration row is created before the Stripe session, same order as
    // booking-create for session_bookings: the row must exist first so its
    // id can go into the session metadata for the webhook to match back to.
    // payment_status starts 'pending' (built-in Checkout) or 'external'
    // (Payment Link) and is only ever flipped onward by stripe-webhook —
    // never by this function or the client.
    const { data: registration, error: insertError } = await supabaseClient
      .from("workshop_registrations")
      .insert({
        workshop_id: workshopId,
        name: trimmedName,
        email: trimmedEmail,
        phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
        note: typeof note === "string" && note.trim() ? note.trim() : null,
        status: "pending",
        payment_status: workshop.stripePaymentLink ? "external" : "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create workshop registration:", insertError);
      return new Response(JSON.stringify({ error: REGISTRATION_UNAVAILABLE_MESSAGE }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Payment-link path: no Stripe session to create. The registration is
    // already saved (above), so Silvie knows who registered either way.
    // client_reference_id and prefilled_email are Stripe-documented URL
    // parameters for Payment Links — Stripe copies client_reference_id onto
    // the Checkout Session it creates behind the link, which lets
    // stripe-webhook match the resulting checkout.session.completed event
    // back to this registration (see stripe-webhook's client_reference_id
    // branch) without needing custom metadata, which Payment Links don't
    // accept.
    if (workshop.stripePaymentLink) {
      const redirectUrl = new URL(workshop.stripePaymentLink);
      // .set() (not .append()) is deliberate: if the pasted link already
      // has its own client_reference_id/prefilled_email query params (e.g.
      // pasted from somewhere that already customized it), ours must win —
      // stripe-webhook can only match this registration back to a payment
      // if the id it receives from Stripe is the one we generated here.
      redirectUrl.searchParams.set("client_reference_id", registration.id);
      redirectUrl.searchParams.set("prefilled_email", trimmedEmail);
      return new Response(
        JSON.stringify({ registration_id: registration.id, checkout_url: redirectUrl.toString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: trimmedEmail,
        line_items: [
          {
            price_data: {
              currency: workshop.currency,
              product_data: {
                name: workshop.title,
              },
              unit_amount: workshop.priceAmount,
            },
            quantity: 1,
          },
        ],
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          type: "workshop_registration",
          workshop_registration_id: registration.id,
          workshop_id: workshopId,
          email: trimmedEmail,
        },
        // Checkout link expires in 1h — matches booking-create's window.
        // stripe-webhook marks the registration payment_status 'expired' on
        // the resulting checkout.session.expired event.
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      });
    } catch (stripeError) {
      // The registration row stays 'pending' with no stripe_session_id — a
      // harmless orphan, same as an abandoned booking-create call. It never
      // becomes visible as "paid" and Silvie's admin already treats
      // pending/unlinked rows as not-yet-registered.
      console.error("Stripe checkout session creation failed:", stripeError);
      return new Response(JSON.stringify({ error: REGISTRATION_UNAVAILABLE_MESSAGE }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { error: updateError } = await supabaseClient
      .from("workshop_registrations")
      .update({ stripe_session_id: session.id })
      .eq("id", registration.id);

    if (updateError) {
      // Payment can still proceed — the webhook matches on
      // workshop_registration_id from the session metadata, not on this
      // column. Only the anonymous success-page lookup by session_id would
      // be affected, and that's a display fallback, not the confirmation
      // path.
      console.error("Failed to store stripe_session_id on registration:", updateError);
    }

    return new Response(
      JSON.stringify({ registration_id: registration.id, checkout_url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("workshop-registration-create error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
