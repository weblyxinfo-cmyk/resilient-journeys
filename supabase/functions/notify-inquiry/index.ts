import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Never taken from the request — recipient always comes from the DB (or this
// fallback) so the function can't be used to spam an arbitrary address.
const FALLBACK_CONTACT_EMAIL = "contact@resilientmind.io";

const ADMIN_INQUIRIES_URL = "https://www.resilientmind.io/admin?tab=inquiries";

type NotifyPayload = {
  type: "inquiry" | "registration";
  name: string;
  email: string;
  workshopTitle?: string | null;
  company?: string | null;
  groupSize?: string | null;
  message?: string | null;
  phone?: string | null;
  note?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildEmail(payload: NotifyPayload) {
  const isRegistration = payload.type === "registration";
  const subject = `${isRegistration ? "New Workshop Registration" : "New Workshop Inquiry"} — ${payload.name}`;

  const rows: [string, string | null | undefined][] = isRegistration
    ? [
        ["Workshop", payload.workshopTitle],
        ["Name", payload.name],
        ["Email", payload.email],
        ["Phone", payload.phone],
        ["Note", payload.note],
      ]
    : [
        ["Workshop", payload.workshopTitle],
        ["Name", payload.name],
        ["Email", payload.email],
        ["Company", payload.company],
        ["Group size", payload.groupSize],
        ["Message", payload.message],
      ];

  const rowsHtml = rows
    .filter(([, value]) => value && value.trim().length > 0)
    .map(
      ([label, value]) => `
        <div style="padding:14px 20px;background:#faf5eb;border:1px solid #e8dcc8;border-radius:12px;margin-bottom:12px;">
          <strong style="font-size:13px;color:#8a8578;display:block;margin-bottom:4px;">${escapeHtml(label)}</strong>
          <span style="font-size:15px;color:#2d2d2d;white-space:pre-wrap;">${escapeHtml(value as string)}</span>
        </div>`
    )
    .join("");

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background-color:#faf9f6;color:#2d2d2d;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;color:#2d2d2d;margin:0 0 8px;">Resilient Mind</h1>
      <p style="font-size:14px;color:#8a8578;margin:0;">${isRegistration ? "New Workshop Registration" : "New Workshop Inquiry"}</p>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e8e4dc;">
      <p style="font-size:16px;line-height:1.6;color:#4a4a4a;margin:0 0 24px;">
        ${isRegistration ? "Someone just registered for a workshop." : "Someone just sent a workshop inquiry."}
      </p>

      ${rowsHtml}

      <div style="text-align:center;margin-top:24px;">
        <a href="${ADMIN_INQUIRIES_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#b8976a,#d4b896);color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;border-radius:50px;">
          Open in Admin &#8594;
        </a>
      </div>
    </div>

    <div style="text-align:center;margin-top:32px;">
      <p style="font-size:12px;color:#b0a998;margin:0;">
        &copy; Resilient Mind | <a href="https://resilientmind.io" style="color:#b8976a;text-decoration:none;">resilientmind.io</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  return { subject, htmlContent };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    const payload = (await req.json()) as NotifyPayload;

    if (!payload.name || !payload.email || !payload.type) {
      throw new Error("Missing required fields: type, name, email");
    }

    // Recipient comes from cms_content (admin-editable) with a hardcoded
    // fallback — a failed lookup must never mean the notification is lost.
    let recipientEmail = FALLBACK_CONTACT_EMAIL;
    try {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      const { data, error } = await supabaseAdmin
        .from("cms_content")
        .select("value")
        .eq("key", "shared_contact_email")
        .single();

      if (!error && data?.value && data.value.trim()) {
        recipientEmail = data.value.trim();
      }
    } catch (lookupError) {
      console.error("Failed to load shared_contact_email, using fallback:", lookupError);
    }

    const { subject, htmlContent } = buildEmail(payload);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "Resilient Mind Website",
          email: "contact@resilientmind.io",
        },
        to: [{ email: recipientEmail }],
        replyTo: { email: payload.email, name: payload.name },
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Brevo send email error:", response.status, errorData);
      throw new Error(`Brevo API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Inquiry notification email sent:", result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in notify-inquiry:", error);
    // Non-blocking: the inquiry/registration is already saved in the DB by
    // the time this function is called, so a failure here must not surface
    // as an error to the visitor. Always return 200.
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
