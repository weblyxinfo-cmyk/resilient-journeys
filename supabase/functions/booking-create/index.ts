import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Fallback only. booking_cards is the source of truth for price and duration —
// see loadSessionConfig. These values stand in if the lookup fails, and cover
// premium_consultation, which is booked from the dashboard rather than a card.
const SESSION_DURATIONS: Record<string, number> = {
  discovery: 30,
  one_on_one: 60,
  family: 60,
  endometriosis_support: 60,
  individual_eft_reiki_offer: 60,
  premium_consultation: 60,
};

const SESSION_PRICES: Record<string, number> = {
  discovery: 0,
  one_on_one: 10700, // €107
  family: 12700, // €127
  endometriosis_support: 23700, // €237 (3-session package, €79/session)
  individual_eft_reiki_offer: 6000, // €60 EFT & Reiki session
  premium_consultation: 8700, // €87
};

interface SessionConfig {
  durationMinutes: number;
  priceCents: number;
  validUntil: string | null;
  title: string | null;
}

/**
 * Price and duration for the card the visitor booked from.
 *
 * More than one card can sell the same backend session type — two currently
 * sell an EFT & Reiki session — so the type alone does not identify a price.
 * The page therefore sends the card_key it displayed and we price that exact
 * card; matching on the type would charge whichever card happens to sort
 * first, which is how a €60 card once billed €77 through Stripe.
 *
 * Requests without a card_key (an older page still open in a tab) fall back to
 * matching by type, lowest sort_order first, as before.
 */
// deno-lint-ignore no-explicit-any
async function loadSessionConfig(
  supabaseClient: any,
  sessionType: string,
  cardKey?: string | null,
): Promise<SessionConfig> {
  const fallback: SessionConfig = {
    durationMinutes: SESSION_DURATIONS[sessionType],
    priceCents: SESSION_PRICES[sessionType],
    validUntil: null,
    title: null,
  };

  // deno-lint-ignore no-explicit-any
  let card: any = null;
  try {
    const query = supabaseClient
      .from("booking_cards")
      .select("duration_minutes, price_eur, valid_until, title, booking_type, card_key")
      .eq("is_active", true);

    const { data, error } = await (cardKey
      ? query.eq("card_key", cardKey)
      : query.or(`booking_type.eq.${sessionType},card_key.eq.${sessionType}`))
      .order("sort_order")
      .limit(1);

    if (error) throw error;
    card = data?.[0] ?? null;
  } catch (err) {
    console.error("booking_cards lookup failed, using fallback prices:", err);
    return fallback;
  }

  // A named card that matches nothing is a request we cannot price. Refusing
  // beats silently charging some other card's amount.
  if (cardKey && !card) {
    throw new Error("Unknown session card. Please reload the page and try again.");
  }

  // A type with no card (premium_consultation) keeps the hardcoded values.
  if (!card) return fallback;

  // The card has to actually sell the type being booked, so a request cannot
  // pair a cheap card with an expensive session.
  const cardSessionType = card.booking_type ?? card.card_key;
  if (cardSessionType !== sessionType) {
    throw new Error("This session card does not match the session being booked.");
  }

  // Never let a bad row produce a free or negative charge.
  const priceCents = Math.round(Number(card.price_eur) * 100);
  if (!Number.isFinite(priceCents) || priceCents < 0) {
    console.error("Invalid price on booking card, using fallback:", card.price_eur);
    return fallback;
  }

  return {
    durationMinutes: Number(card.duration_minutes) || fallback.durationMinutes,
    priceCents,
    validUntil: card.valid_until ?? null,
    title: card.title ?? null,
  };
}

// TIME columns (e.g. "08:00:00") compared as minutes since midnight, the same
// way booking-available-slots/-days compare them against UTC slot times.
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { session_type, card_key, expected_price_eur, client_name, client_email, start_time, notes } = requestBody;

    console.log("Booking request:", session_type, start_time);

    // Validation
    if (!session_type || !client_name || !client_email || !start_time) {
      console.error("Missing required fields for booking");
      throw new Error("Missing required fields: session_type, client_name, client_email, start_time");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(client_email)) {
      throw new Error("Invalid email format");
    }

    // Parse start time
    const startDate = new Date(start_time);
    if (isNaN(startDate.getTime())) {
      throw new Error("Invalid start_time format");
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("Supabase URL exists:", !!supabaseUrl);
    console.log("Service role key exists:", !!supabaseServiceKey);

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Price and duration come from the card the admin edits, never from the
    // request, so an edited price takes effect for Stripe on the next booking.
    const sessionConfig = await loadSessionConfig(supabaseClient, session_type, card_key);

    if (!sessionConfig.durationMinutes) {
      throw new Error(`Invalid session type: ${session_type}`);
    }

    // The page tells us the price it showed. If that disagrees with the card,
    // the visitor is looking at a stale page (or the request was tampered
    // with) — refuse rather than charge an amount they never saw, the same way
    // create-checkout does for memberships.
    if (expected_price_eur !== undefined && expected_price_eur !== null) {
      const expectedCents = Math.round(Number(expected_price_eur) * 100);
      if (!Number.isFinite(expectedCents) || expectedCents !== sessionConfig.priceCents) {
        console.error(
          "Price mismatch:",
          { session_type, card_key, expectedCents, actual: sessionConfig.priceCents },
        );
        throw new Error(
          "The price of this session has changed. Please reload the page and book again.",
        );
      }
    }

    // Time-limited offers: reject bookings after the offer's end date
    if (
      sessionConfig.validUntil &&
      new Date() > new Date(`${sessionConfig.validUntil}T23:59:59Z`)
    ) {
      throw new Error("This special offer has expired.");
    }

    // Calculate end time
    const duration = sessionConfig.durationMinutes;
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + duration);

    // Check 24h minimum notice
    const minBookingDate = new Date();
    minBookingDate.setHours(minBookingDate.getHours() + 24);
    if (startDate < minBookingDate) {
      throw new Error("Bookings must be made at least 24 hours in advance");
    }

    // Check if slot is still available (race condition protection)
    const dateStr = startDate.toISOString().split("T")[0];
    const dayOfWeek = startDate.getUTCDay();

    // Check blocked dates. A date can now have several blocked windows
    // (or one full-day row with start_time/end_time both NULL), so fetch
    // all rows for the date instead of assuming at most one.
    const { data: blockedRows, error: blockedError } = await supabaseClient
      .from("blocked_dates")
      .select("start_time, end_time")
      .eq("date", dateStr);

    if (blockedError) throw blockedError;

    if (blockedRows?.some((b: any) => b.start_time === null || b.end_time === null)) {
      throw new Error("Selected date is blocked");
    }

    // Session [start, start+duration) is blocked when it overlaps a blocked
    // window [start_time, end_time). Compare in minutes since midnight, same
    // as the UTC hours/minutes used elsewhere for TIME columns.
    const sessionStartMinutes = startDate.getUTCHours() * 60 + startDate.getUTCMinutes();
    const sessionEndMinutes = sessionStartMinutes + duration;

    const hasBlockedTimeOverlap = (blockedRows || []).some((b: any) => {
      const blockedStart = timeToMinutes(b.start_time);
      const blockedEnd = timeToMinutes(b.end_time);
      return sessionStartMinutes < blockedEnd && sessionEndMinutes > blockedStart;
    });

    if (hasBlockedTimeOverlap) {
      throw new Error("Selected time is blocked. Please choose a different time on this date.");
    }

    // Check availability for day of week
    console.log("Checking availability for day_of_week:", dayOfWeek);
    const { data: availability, error: availError } = await supabaseClient
      .from("availability")
      .select("*")
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true);

    console.log("Availability query result:", { availability, error: availError });

    if (availError) {
      console.error("Error fetching availability:", availError);
      throw new Error(`Availability check failed: ${availError.message}`);
    }

    if (!availability || availability.length === 0) {
      console.error("No availability found for day", dayOfWeek);
      throw new Error(`No availability for selected day (${dayOfWeek})`);
    }

    // Check for conflicting bookings
    const { data: existingBookings } = await supabaseClient
      .from("session_bookings")
      .select("session_date, end_time, duration_minutes")
      .gte("session_date", startDate.toISOString())
      .lt("session_date", endDate.toISOString())
      .in("status", ["confirmed", "pending_payment", "scheduled"]);

    if (existingBookings && existingBookings.length > 0) {
      // Check for overlap
      const hasConflict = existingBookings.some((booking: any) => {
        const bookingStart = new Date(booking.session_date);
        const bookingEnd = booking.end_time
          ? new Date(booking.end_time)
          : new Date(
              bookingStart.getTime() + (booking.duration_minutes || 60) * 60000
            );

        return (
          (startDate >= bookingStart && startDate < bookingEnd) ||
          (endDate > bookingStart && endDate <= bookingEnd) ||
          (startDate <= bookingStart && endDate >= bookingEnd)
        );
      });

      if (hasConflict) {
        throw new Error("Time slot is no longer available");
      }
    }

    // Get price
    const priceInCents = sessionConfig.priceCents;

    // Create booking record
    const bookingData: any = {
      session_type,
      client_name,
      client_email,
      session_date: startDate.toISOString(),
      end_time: endDate.toISOString(),
      duration_minutes: duration,
      price_cents: priceInCents,
      notes,
      status: priceInCents > 0 ? "pending_payment" : "confirmed",
    };

    if (priceInCents > 0) {
      // Set payment expiration (60 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 60);
      bookingData.payment_expires_at = expiresAt.toISOString();
    }

    const { data: booking, error: bookingError } = await supabaseClient
      .from("session_bookings")
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) throw bookingError;

    // If free session, return success immediately
    if (priceInCents === 0) {
      // TODO: Send confirmation email
      return new Response(
        JSON.stringify({
          booking_id: booking.id,
          status: "confirmed",
          message: "Booking confirmed successfully",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create Stripe checkout session for paid bookings
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Session type names for display
    const sessionNames: Record<string, string> = {
      discovery: "Discovery Call",
      one_on_one: "Individual Session",
      family: "Family Session",
      endometriosis_support: "Endometriosis & Chronic Pain Support (3-session package)",
      individual_eft_reiki_offer: "Special Offer – Individual Session (EFT & Reiki)",
      premium_consultation: "Premium Consultation",
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: sessionConfig.title || sessionNames[session_type] || session_type,
              description: `${duration} minutes session with Silvie Bogdánová`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      allow_promotion_codes: true,
      success_url: `${req.headers.get("origin") || "https://resilientmind.io"}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin") || "https://resilientmind.io"}/booking?cancelled=true`,
      customer_email: client_email,
      metadata: {
        booking_id: booking.id,
        session_type,
        client_name,
      },
      expires_at: Math.floor(new Date(bookingData.payment_expires_at).getTime() / 1000),
    });

    // Update booking with Stripe session ID
    await supabaseClient
      .from("session_bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    return new Response(
      JSON.stringify({
        booking_id: booking.id,
        checkout_url: session.url,
        expires_at: bookingData.payment_expires_at,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in booking-create:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
