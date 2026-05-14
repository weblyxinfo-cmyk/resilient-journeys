import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      console.warn("BREVO_API_KEY not set — skipping contact creation");
      return new Response(
        JSON.stringify({ success: false, reason: "BREVO_API_KEY not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const { email, name, listIds } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    const doiTemplateIdRaw = Deno.env.get("BREVO_DOI_TEMPLATE_ID");
    const doiTemplateId = doiTemplateIdRaw ? parseInt(doiTemplateIdRaw, 10) : null;
    const doiRedirectUrl =
      Deno.env.get("BREVO_DOI_REDIRECT_URL") || "https://resilientmind.io/thank-you";
    const useDoi = doiTemplateId && Number.isFinite(doiTemplateId);

    const attributes: Record<string, unknown> | undefined = name
      ? { FIRSTNAME: name }
      : undefined;

    let endpoint: string;
    let body: Record<string, unknown>;

    if (useDoi) {
      // Double opt-in: Brevo sends a confirmation email and only adds the
      // contact to includeListIds after the recipient clicks the confirmation link.
      endpoint = "https://api.brevo.com/v3/contacts/doubleOptinConfirmation";
      body = {
        email,
        templateId: doiTemplateId,
        redirectionUrl: doiRedirectUrl,
        includeListIds:
          listIds && Array.isArray(listIds) && listIds.length > 0 ? listIds : [2],
        ...(attributes ? { attributes } : {}),
      };
    } else {
      // Fallback: legacy single opt-in until BREVO_DOI_TEMPLATE_ID is configured.
      endpoint = "https://api.brevo.com/v3/contacts";
      body = {
        email,
        updateEnabled: true,
        ...(attributes ? { attributes } : {}),
        ...(listIds && Array.isArray(listIds) && listIds.length > 0
          ? { listIds }
          : {}),
      };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Brevo API error:", response.status, errorData);
      // Return success anyway — Brevo failures should not block user flow
      return new Response(
        JSON.stringify({ success: false, reason: `Brevo error: ${response.status}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, mode: useDoi ? "double-opt-in" : "single-opt-in" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in brevo-add-contact:", error);
    // Non-blocking: always return 200 so the calling flow doesn't break
    return new Response(
      JSON.stringify({ success: false, reason: error.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
