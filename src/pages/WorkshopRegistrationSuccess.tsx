import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { CheckCircle, Loader2, Mail, User, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useCms } from "@/hooks/useCms";

interface RegistrationRow {
  id: string;
  workshop_id: string;
  name: string;
  email: string;
  phone: string | null;
  note: string | null;
  payment_status: string;
  created_at: string;
}

// Webhook is the source of truth for payment confirmation (see
// stripe-webhook), not this page — a visitor who closes the tab right after
// paying is still confirmed. This page only polls a few times so the common
// case (webhook already ran by the time Stripe redirects back) shows "Paid"
// immediately instead of "Processing" for no reason.
const POLL_DELAYS_MS = [2000, 4000, 6000];

const WorkshopRegistrationSuccess = () => {
  const [searchParams] = useSearchParams();
  const { t } = useCms();
  const sessionId = searchParams.get("session_id");

  const [registration, setRegistration] = useState<RegistrationRow | null>(null);
  const [workshopTitle, setWorkshopTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollAttempt = useRef(0);

  const fetchRegistration = useCallback(async () => {
    if (!sessionId) {
      setError(t("workshop_success_error_no_session", "No payment session found."));
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("workshop_registrations")
      .select("id, workshop_id, name, email, phone, note, payment_status, created_at")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (fetchError || !data) {
      setError(t("workshop_success_error_not_found", "We couldn't find your registration."));
      setLoading(false);
      return;
    }

    setRegistration(data);

    if (data.workshop_id) {
      const { data: workshop } = await supabase
        .from("blog_posts")
        .select("title")
        .eq("id", data.workshop_id)
        .maybeSingle();
      setWorkshopTitle(workshop?.title ?? null);
    }

    setLoading(false);

    // Payment is still pending — poll a few times while the webhook catches up.
    if (data.payment_status === "pending" && pollAttempt.current < POLL_DELAYS_MS.length) {
      const delay = POLL_DELAYS_MS[pollAttempt.current];
      pollAttempt.current += 1;
      setTimeout(fetchRegistration, delay);
    }
  }, [sessionId, t]);

  useEffect(() => {
    fetchRegistration();
    // fetchRegistration intentionally only re-runs from its own poll timer —
    // re-running it on every render would restart polling from attempt 0.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (loading) {
    return (
      <div id="cms-workshop-success-loading" className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t("workshop_success_loading_text", "Loading your registration...")}</p>
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16">
          <div className="container px-4">
            <div id="cms-workshop-success-error" className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
                <XCircle className="h-10 w-10 text-amber-600" />
              </div>
              <h1 className="text-3xl font-serif font-semibold mb-4">{t("workshop_success_error_title", "Something went wrong")}</h1>
              <p className="text-muted-foreground mb-8">
                {error || t("workshop_success_error_fallback", "Registration not found")}
              </p>
              <Button asChild className="bg-gradient-gold text-white">
                <Link to="/workshopy">
                  {t("workshop_success_error_button", "Back to Workshops")}
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isPaid = registration.payment_status === "paid";
  const isExpired = registration.payment_status === "expired";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("workshop_success_seo_title", "Registration Confirmed | Resilient Mind")}
        description={t("workshop_success_seo_description", "Your workshop registration has been confirmed.")}
        path="/workshopy/success"
        noindex
      />
      <Navbar />

      <main className="pt-32 pb-16">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto">
            <div id="cms-workshop-success-header" className="text-center mb-12">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${isPaid ? "bg-gradient-gold" : "bg-amber-100"}`}>
                {isPaid ? (
                  <CheckCircle size={48} className="text-primary-foreground" />
                ) : isExpired ? (
                  <XCircle size={48} className="text-amber-600" />
                ) : (
                  <Loader2 size={48} className="text-amber-600 animate-spin" />
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
                {isPaid
                  ? t("workshop_success_title_paid", "You're Registered!")
                  : isExpired
                  ? t("workshop_success_title_expired", "Payment Link Expired")
                  : t("workshop_success_title_pending", "Confirming Your Payment...")}
              </h1>

              <p className="text-lg text-muted-foreground">
                {isPaid
                  ? t("workshop_success_subtitle_paid", "Thank you for registering. A confirmation email is on its way to you.")
                  : isExpired
                  ? t("workshop_success_subtitle_expired", "This payment link is no longer valid. Please register again to get a new one.")
                  : t("workshop_success_subtitle_pending", "This can take a few seconds. This page will update automatically.")}
              </p>
            </div>

            <Card id="cms-workshop-success-details" className="mb-8">
              <CardHeader>
                <CardTitle>{t("workshop_success_details_title", "Registration Details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="text-primary mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">{t("workshop_success_label_name", "Name")}</p>
                    <p className="text-muted-foreground">{registration.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="text-primary mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">{t("workshop_success_label_email", "Email")}</p>
                    <p className="text-muted-foreground">{registration.email}</p>
                  </div>
                </div>
                {workshopTitle && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t("workshop_success_label_workshop", "Workshop:")}</span>
                      <span className="font-semibold">{workshopTitle}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              {isExpired && (
                <Button asChild className="bg-gradient-gold text-white">
                  <Link to="/workshopy">
                    {t("workshop_success_retry_button", "Back to Workshops")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/">{t("workshop_success_home_button", "Back to Homepage")}</Link>
              </Button>
            </div>

            <div id="cms-workshop-success-contact" className="text-center text-sm text-muted-foreground">
              <p>{t("workshop_success_contact_text", "Have questions? Contact us at")}</p>
              <a href="mailto:contact@resilientmind.io" className="text-primary hover:underline">
                contact@resilientmind.io
              </a>
              {isPaid && (
                <p className="mt-2 text-xs">
                  {format(new Date(registration.created_at), "d MMMM yyyy, HH:mm")}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WorkshopRegistrationSuccess;
