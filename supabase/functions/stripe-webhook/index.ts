import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("Missing signature or webhook secret");
    return new Response("Webhook secret not configured", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    console.log("Received Stripe event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const bookingId = session.metadata?.booking_id;
        const mode = session.mode; // 'subscription' or 'payment'

        console.log(`Checkout completed - Mode: ${mode}, User: ${userId}, Booking: ${bookingId}`);

        // Handle BOOKING payments (consultations)
        if (bookingId) {
          console.log(`Processing booking payment for booking_id: ${bookingId}`);

          try {
            const { error } = await supabaseAdmin
              .from("session_bookings")
              .update({
                status: "confirmed",
                payment_expires_at: null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", bookingId);

            if (error) {
              console.error(`Failed to confirm booking ${bookingId}:`, error);
              throw error;
            }

            console.log(`Booking ${bookingId} confirmed successfully`);
          } catch (error) {
            console.error(`Error processing booking payment:`, error);
            throw error;
          }
          break;
        }

        // Handle MEMBERSHIP payments
        if (!userId) {
          console.error("No user_id in session metadata for membership payment");
          break;
        }

        // Handle subscription payments
        if (mode === "subscription") {
          const membershipType = session.metadata?.membership_type;

          if (membershipType) {
            try {
              // Calculate expiry based on subscription
              const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
              const expiresAt = new Date(subscription.current_period_end * 1000);

              await supabaseAdmin
                .from("profiles")
                .update({
                  membership_type: membershipType,
                  membership_started_at: new Date().toISOString(),
                  membership_expires_at: expiresAt.toISOString(),
                  stripe_customer_id: session.customer as string,
                })
                .eq("user_id", userId);

              console.log(`Updated subscription membership for user ${userId} to ${membershipType}`);
            } catch (error) {
              console.error(`Error processing subscription for user ${userId}:`, error);
              throw error;
            }
          }
        }

        // Handle one-time payments
        if (mode === "payment") {
          const productType = session.metadata?.product_type;
          console.log(`Processing one-time payment - Product type: ${productType}`);

          try {
            // Handle yearly membership purchases (support both naming conventions)
            if (productType === "yearly_basic" || productType === "yearly_premium" ||
                productType === "basic_yearly" || productType === "premium_yearly") {
              // Set membership for 12 months
              const expiresAt = new Date();
              expiresAt.setFullYear(expiresAt.getFullYear() + 1);

              const membershipType = (productType === "yearly_basic" || productType === "basic_yearly") ? "basic" : "premium";

              const { error } = await supabaseAdmin
                .from("profiles")
                .update({
                  membership_type: membershipType,
                  membership_started_at: new Date().toISOString(),
                  membership_expires_at: expiresAt.toISOString(),
                  stripe_customer_id: session.customer as string,
                })
                .eq("user_id", userId);

              if (error) {
                console.error(`Error updating yearly membership for user ${userId}:`, error);
                throw error;
              }

              console.log(`Updated yearly membership for user ${userId} to ${membershipType}, expires: ${expiresAt.toISOString()}`);
            }

            // Handle Hub purchases
            if (productType === "hub") {
              const hubSlug = session.metadata?.hub_slug;

              if (!hubSlug) {
                console.error(`No hub_slug in metadata for Hub purchase by user ${userId}`);
                break;
              }

              // Get current purchased hubs
              const { data: profile, error: fetchError } = await supabaseAdmin
                .from("profiles")
                .select("purchased_hubs")
                .eq("user_id", userId)
                .single();

              if (fetchError) {
                console.error(`Error fetching profile for user ${userId}:`, fetchError);
                throw fetchError;
              }

              const currentHubs = profile?.purchased_hubs || [];

              // Check if hub is already purchased
              if (currentHubs.includes(hubSlug)) {
                console.log(`Hub ${hubSlug} already purchased by user ${userId}`);
              } else {
                const updatedHubs = [...currentHubs, hubSlug];

                const { error: updateError } = await supabaseAdmin
                  .from("profiles")
                  .update({ purchased_hubs: updatedHubs })
                  .eq("user_id", userId);

                if (updateError) {
                  console.error(`Error updating purchased hubs for user ${userId}:`, updateError);
                  throw updateError;
                }

                console.log(`Added hub ${hubSlug} to purchased_hubs for user ${userId}. Total hubs: ${updatedHubs.length}`);
              }
            }
          } catch (error) {
            console.error(`Error processing one-time payment for user ${userId}:`, error);
            throw error;
          }
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          const expiresAt = new Date(subscription.current_period_end * 1000);
          
          await supabaseAdmin
            .from("profiles")
            .update({
              membership_expires_at: expiresAt.toISOString(),
            })
            .eq("user_id", profile.user_id);

          console.log(`Updated subscription expiry for user ${profile.user_id}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({
              membership_type: "free",
              membership_expires_at: null,
            })
            .eq("user_id", profile.user_id);

          console.log(`Cancelled subscription for user ${profile.user_id}`);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;

        if (bookingId) {
          console.log(`Checkout session expired for booking: ${bookingId}`);

          try {
            const { error } = await supabaseAdmin
              .from("session_bookings")
              .update({
                status: "expired",
                updated_at: new Date().toISOString(),
              })
              .eq("id", bookingId);

            if (error) {
              console.error(`Failed to expire booking ${bookingId}:`, error);
              throw error;
            }

            console.log(`Booking ${bookingId} marked as expired`);
          } catch (error) {
            console.error(`Error processing expired session:`, error);
            throw error;
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment failed for invoice ${invoice.id}`);
        // Could send email notification here
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
});
