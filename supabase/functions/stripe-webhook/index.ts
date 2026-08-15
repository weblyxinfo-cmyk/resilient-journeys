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

async function sendMembershipEmail(userId: string, membershipType: string) {
  try {
    // Fetch user profile for email and name
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", userId)
      .single();

    if (!profile?.email) {
      console.error(`No email found for user ${userId}, skipping confirmation email`);
      return;
    }

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      console.error("BREVO_API_KEY not configured, skipping confirmation email");
      return;
    }

    const tierLabel = membershipType === "premium" ? "Premium" : "Basic";
    const displayName = profile.full_name || "there";
    const SITE_URL = "https://resilientmind.io";

    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background-color:#faf9f6;color:#2d2d2d;"><div style="max-width:600px;margin:0 auto;padding:40px 24px;"><div style="text-align:center;margin-bottom:32px;"><h1 style="font-size:28px;color:#2d2d2d;margin:0 0 8px;">Resilient Mind</h1><p style="font-size:14px;color:#8a8578;margin:0;">Membership Confirmation</p></div><div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e8e4dc;"><p style="font-size:18px;margin:0 0 16px;">Hi ${displayName},</p><p style="font-size:16px;line-height:1.6;color:#4a4a4a;margin:0 0 8px;">Thank you for joining Resilient Mind! &#127881;</p><p style="font-size:16px;line-height:1.6;color:#4a4a4a;margin:0 0 24px;">Your <strong>${tierLabel} Membership</strong> is now active. You have full access to the Resilient Hub &#8212; video lessons, workbooks, and all the tools designed to support your journey.</p><div style="border-top:1px solid #e8e4dc;padding-top:24px;margin-bottom:24px;"><p style="font-size:16px;font-weight:bold;color:#2d2d2d;margin:0 0 16px;">What you can do now:</p><div style="padding:14px 20px;background:#faf5eb;border:1px solid #e8dcc8;border-radius:12px;margin-bottom:12px;"><strong style="font-size:15px;">1. Go to your Dashboard</strong><span style="display:block;font-size:14px;color:#8a8578;margin-top:4px;">Access your video lessons and workbooks for each month</span></div><div style="padding:14px 20px;background:#faf5eb;border:1px solid #e8dcc8;border-radius:12px;margin-bottom:12px;"><strong style="font-size:15px;">2. Start with Month 1</strong><span style="display:block;font-size:14px;color:#8a8578;margin-top:4px;">Open the first month, choose a week, and watch your first video</span></div><div style="padding:14px 20px;background:#faf5eb;border:1px solid #e8dcc8;border-radius:12px;margin-bottom:12px;"><strong style="font-size:15px;">3. Download your Workbook</strong><span style="display:block;font-size:14px;color:#8a8578;margin-top:4px;">Each video has a PDF workbook &#8212; practice at your own pace</span></div></div><div style="text-align:center;margin-bottom:24px;"><a href="${SITE_URL}/dashboard" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#b8976a,#d4b896);color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;border-radius:50px;">Go to My Dashboard &#8594;</a></div><p style="font-size:16px;line-height:1.6;color:#4a4a4a;margin:0 0 24px;">Remember: resilience isn&#8217;t something you&#8217;re born with &#8212; it&#8217;s something you practice gently, one month at a time.</p><p style="font-size:16px;color:#4a4a4a;margin:0;">Warmly,<br><strong>Silvie</strong></p></div><div style="text-align:center;margin-top:32px;"><p style="font-size:12px;color:#b0a998;margin:0;">&copy; Resilient Mind | <a href="${SITE_URL}" style="color:#b8976a;text-decoration:none;">resilientmind.io</a></p></div></div></body></html>`;

    const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": brevoApiKey },
      body: JSON.stringify({
        sender: { name: "Silvie from Resilient Mind", email: "contact@resilientmind.io" },
        to: [{ email: profile.email, name: profile.full_name || undefined }],
        subject: `Welcome to Resilient Mind \u2013 Your ${tierLabel} Membership Is Active \u2705`,
        htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error("Brevo email error:", emailResponse.status, errText);
    } else {
      console.log(`Membership confirmation email sent to ${profile.email}`);
    }
  } catch (err) {
    // Don't throw — email failure shouldn't break the webhook
    console.error("Failed to send membership confirmation email:", err);
  }
}

/**
 * Notifies Silvie that someone paid for a workshop, via the same
 * notify-inquiry function the (now-removed) manual registration flow used.
 * Best-effort: notify-inquiry always responds 200 even on its own internal
 * failure (see its comment), so this never throws and never blocks the
 * payment confirmation above it from succeeding.
 */
async function notifyWorkshopRegistrationPaid(name: string, email: string, workshopTitle: string | null, phone: string | null, note: string | null) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing SUPABASE_URL/SERVICE_ROLE_KEY, skipping registration notification");
      return;
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/notify-inquiry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({
        type: "registration",
        name,
        email,
        workshopTitle,
        phone,
        note,
      }),
    });

    if (!response.ok) {
      console.error("notify-inquiry call failed:", response.status, await response.text());
    }
  } catch (err) {
    console.error("Failed to notify about paid workshop registration:", err);
  }
}

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

        // Handle WORKSHOP REGISTRATION payments — anonymous, no user_id.
        const workshopRegistrationId = session.metadata?.workshop_registration_id;
        if (workshopRegistrationId) {
          console.log(`Processing workshop registration payment for registration_id: ${workshopRegistrationId}`);

          try {
            // Guarded by .eq("payment_status", "pending") so a Stripe retry
            // of this same event (or the fallback below racing a first
            // delivery) updates zero rows the second time — .select()
            // returns the updated row only on the transition that actually
            // happened, which is what gates the notification email.
            const { data: updatedRegistrations, error } = await supabaseAdmin
              .from("workshop_registrations")
              .update({
                payment_status: "paid",
                status: "confirmed",
              })
              .eq("id", workshopRegistrationId)
              .eq("payment_status", "pending")
              .select("name, email, phone, note, workshop_id")
              .limit(1);

            if (error) {
              console.error(`Failed to confirm workshop registration ${workshopRegistrationId}:`, error);
              throw error;
            }

            const registration = updatedRegistrations?.[0];
            if (!registration) {
              console.log(`Workshop registration ${workshopRegistrationId} already paid — skipping duplicate notification`);
              break;
            }

            console.log(`Workshop registration ${workshopRegistrationId} confirmed as paid`);

            const { data: workshop } = await supabaseAdmin
              .from("blog_posts")
              .select("title")
              .eq("id", registration.workshop_id)
              .maybeSingle();

            await notifyWorkshopRegistrationPaid(
              registration.name,
              registration.email,
              workshop?.title ?? null,
              registration.phone,
              registration.note
            );
          } catch (error) {
            console.error(`Error processing workshop registration payment:`, error);
            throw error;
          }
          break;
        }

        // Handle EXTERNAL (Stripe Payment Link) workshop registration
        // payments. Payment Links don't accept custom metadata, so these
        // sessions carry no workshop_registration_id above — instead,
        // workshop-registration-create appends
        // ?client_reference_id=<registration_id> to the link URL, and
        // Stripe copies that onto the resulting Checkout Session's
        // client_reference_id field. Guarded on payment_status = 'external'
        // (set only by that same flow) so this can never match a row from
        // the metadata-based branch above, and so a retry/duplicate event
        // is a no-op the second time, same idempotency pattern as above.
        const clientReferenceId = session.client_reference_id;
        if (clientReferenceId) {
          console.log(`Processing external payment-link workshop registration for id: ${clientReferenceId}`);

          try {
            // amount_total/currency are Stripe's own record of what was
            // actually charged through the Payment Link — captured here
            // because it's the only place this code ever sees it, and
            // because the link's configured price can drift from
            // blog_posts.workshop_price (see docs/workshop-payment-link.md).
            // Kept even after this row later reads as 'paid' like any other
            // registration, so Silvie can still tell it went through the
            // external path and check it against the workshop's current
            // listed price in AdminInquiries.
            const { data: updatedExternal, error } = await supabaseAdmin
              .from("workshop_registrations")
              .update({
                payment_status: "paid",
                status: "confirmed",
                stripe_session_id: session.id,
                paid_amount_cents: session.amount_total ?? null,
                paid_currency: session.currency ?? null,
              })
              .eq("id", clientReferenceId)
              .eq("payment_status", "external")
              .select("name, email, phone, note, workshop_id")
              .limit(1);

            if (error) {
              console.error(`Failed to confirm external workshop registration ${clientReferenceId}:`, error);
              throw error;
            }

            const registration = updatedExternal?.[0];
            if (!registration) {
              console.log(`External workshop registration ${clientReferenceId} not found or already paid — skipping duplicate notification`);
              break;
            }

            console.log(`External workshop registration ${clientReferenceId} confirmed as paid`);

            const { data: workshop } = await supabaseAdmin
              .from("blog_posts")
              .select("title")
              .eq("id", registration.workshop_id)
              .maybeSingle();

            await notifyWorkshopRegistrationPaid(
              registration.name,
              registration.email,
              workshop?.title ?? null,
              registration.phone,
              registration.note
            );
          } catch (error) {
            console.error(`Error processing external workshop registration payment:`, error);
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
              // Cancel auto-renewal — user must actively re-subscribe each month
              const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
              if (!subscription.cancel_at_period_end) {
                await stripe.subscriptions.update(subscription.id, {
                  cancel_at_period_end: true,
                });
              }

              // Fetch current profile to determine months_unlocked
              const { data: currentProfile } = await supabaseAdmin
                .from("profiles")
                .select("months_unlocked, membership_started_at")
                .eq("user_id", userId)
                .single();

              const currentMonths = currentProfile?.months_unlocked || 0;
              const newMonths = currentMonths + 1;

              // 60-day access window from now
              const expiresAt = new Date();
              expiresAt.setDate(expiresAt.getDate() + 60);

              await supabaseAdmin
                .from("profiles")
                .update({
                  membership_type: membershipType,
                  // Only set membership_started_at on first subscription
                  membership_started_at: currentProfile?.membership_started_at || new Date().toISOString(),
                  membership_expires_at: expiresAt.toISOString(),
                  stripe_customer_id: session.customer as string,
                  months_unlocked: newMonths,
                })
                .eq("user_id", userId);

              console.log(`Updated subscription membership for user ${userId} to ${membershipType}, months_unlocked: ${newMonths}, expires: ${expiresAt.toISOString()}`);

              // Send confirmation email
              await sendMembershipEmail(userId, membershipType);
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
                  months_unlocked: 12,
                })
                .eq("user_id", userId);

              if (error) {
                console.error(`Error updating yearly membership for user ${userId}:`, error);
                throw error;
              }

              console.log(`Updated yearly membership for user ${userId} to ${membershipType}, months_unlocked: 12, expires: ${expiresAt.toISOString()}`);

              // Send confirmation email
              await sendMembershipEmail(userId, membershipType);
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
          break;
        }

        const workshopRegistrationId = session.metadata?.workshop_registration_id;
        if (workshopRegistrationId) {
          console.log(`Checkout session expired for workshop registration: ${workshopRegistrationId}`);

          try {
            // Only touch it if still pending — an already-paid registration
            // must never be overwritten by a late expired event.
            const { error } = await supabaseAdmin
              .from("workshop_registrations")
              .update({ payment_status: "expired" })
              .eq("id", workshopRegistrationId)
              .eq("payment_status", "pending");

            if (error) {
              console.error(`Failed to expire workshop registration ${workshopRegistrationId}:`, error);
              throw error;
            }

            console.log(`Workshop registration ${workshopRegistrationId} marked as expired`);
          } catch (error) {
            console.error(`Error processing expired workshop registration session:`, error);
            throw error;
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const customerId = charge.customer as string;

        if (!customerId) {
          console.log("Refund received but no customer ID on charge");
          break;
        }

        // Find user by customer ID
        const { data: refundProfile } = await supabaseAdmin
          .from("profiles")
          .select("user_id, membership_type")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!refundProfile) {
          console.log(`No profile found for customer ${customerId} on refund`);
          break;
        }

        // Full refund → downgrade to free
        if (charge.amount_captured > 0 && charge.amount_refunded === charge.amount_captured) {
          await supabaseAdmin
            .from("profiles")
            .update({
              membership_type: "free",
              membership_expires_at: null,
            })
            .eq("user_id", refundProfile.user_id);

          console.log(`Full refund processed for user ${refundProfile.user_id} — downgraded to free`);
        } else {
          console.log(`Partial refund for user ${refundProfile.user_id}: ${charge.amount_refunded}/${charge.amount_captured}`);
        }
        break;
      }

      case "invoice.paid": {
        const paidInvoice = event.data.object as Stripe.Invoice;
        const paidCustomerId = paidInvoice.customer as string;
        const paidSubId = paidInvoice.subscription as string;

        // Only handle subscription renewal invoices (not the first one — that's handled by checkout.session.completed)
        if (!paidSubId || paidInvoice.billing_reason === "subscription_create") {
          console.log(`Skipping invoice.paid — billing_reason: ${paidInvoice.billing_reason}`);
          break;
        }

        console.log(`Invoice paid for subscription ${paidSubId}, customer ${paidCustomerId}, reason: ${paidInvoice.billing_reason}`);

        // Find user by customer ID
        const { data: invoiceProfile } = await supabaseAdmin
          .from("profiles")
          .select("user_id, membership_type, months_unlocked")
          .eq("stripe_customer_id", paidCustomerId)
          .single();

        if (!invoiceProfile) {
          console.error(`No profile found for customer ${paidCustomerId} on invoice.paid`);
          break;
        }

        // 60-day access window from now + unlock next month
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 60);

        const currentUnlocked = (invoiceProfile as any).months_unlocked || 0;

        const { error: renewError } = await supabaseAdmin
          .from("profiles")
          .update({
            membership_expires_at: newExpiresAt.toISOString(),
            months_unlocked: currentUnlocked + 1,
          })
          .eq("user_id", invoiceProfile.user_id);

        if (renewError) {
          console.error(`Failed to update expiry on renewal for user ${invoiceProfile.user_id}:`, renewError);
          throw renewError;
        }

        console.log(`Renewed membership for user ${invoiceProfile.user_id}, months_unlocked: ${currentUnlocked + 1}, new expiry: ${newExpiresAt.toISOString()}`);
        break;
      }

      case "invoice.payment_failed": {
        const failedInvoice = event.data.object as Stripe.Invoice;
        const failedCustomerId = failedInvoice.customer as string;

        console.log(`Payment failed for invoice ${failedInvoice.id}, customer ${failedCustomerId}`);

        if (!failedCustomerId) break;

        // Find user to send notification
        const { data: failedProfile } = await supabaseAdmin
          .from("profiles")
          .select("user_id, email, full_name")
          .eq("stripe_customer_id", failedCustomerId)
          .single();

        if (!failedProfile?.email) {
          console.error(`No profile/email found for customer ${failedCustomerId} on payment failure`);
          break;
        }

        // Send payment failed notification email
        const brevoKey = Deno.env.get("BREVO_API_KEY");
        if (brevoKey) {
          const displayName = failedProfile.full_name || "there";
          const SITE_URL = "https://resilientmind.io";

          const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background-color:#faf9f6;color:#2d2d2d;"><div style="max-width:600px;margin:0 auto;padding:40px 24px;"><div style="text-align:center;margin-bottom:32px;"><h1 style="font-size:28px;color:#2d2d2d;margin:0 0 8px;">Resilient Mind</h1><p style="font-size:14px;color:#8a8578;margin:0;">Payment Update</p></div><div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e8e4dc;"><p style="font-size:18px;margin:0 0 16px;">Hi ${displayName},</p><p style="font-size:16px;line-height:1.6;color:#4a4a4a;margin:0 0 24px;">We were unable to process your latest membership payment. Please update your payment method to keep your access active.</p><div style="text-align:center;margin-bottom:24px;"><a href="${SITE_URL}/dashboard" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#b8976a,#d4b896);color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;border-radius:50px;">Update Payment Method &#8594;</a></div><p style="font-size:14px;line-height:1.6;color:#8a8578;margin:0;">If you have any questions, reply to this email or contact us at <a href="mailto:contact@resilientmind.io" style="color:#b8976a;">contact@resilientmind.io</a></p></div></div></body></html>`;

          try {
            const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
              method: "POST",
              headers: { "Content-Type": "application/json", "api-key": brevoKey },
              body: JSON.stringify({
                sender: { name: "Resilient Mind", email: "contact@resilientmind.io" },
                to: [{ email: failedProfile.email, name: failedProfile.full_name || undefined }],
                subject: "Action Required \u2013 Payment Failed for Your Membership",
                htmlContent,
              }),
            });

            if (!emailRes.ok) {
              console.error("Failed to send payment failure email:", await emailRes.text());
            } else {
              console.log(`Payment failure notification sent to ${failedProfile.email}`);
            }
          } catch (emailErr) {
            console.error("Error sending payment failure email:", emailErr);
          }
        }
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
