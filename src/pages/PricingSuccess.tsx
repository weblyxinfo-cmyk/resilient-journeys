import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Crown, Loader2, ArrowRight, Video, FileText, Calendar, AlertTriangle, LogIn, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCms } from "@/hooks/useCms";

type PageState = "loading" | "processing" | "success" | "error" | "no-session" | "not-authenticated";

const PricingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [pageState, setPageState] = useState<PageState>("loading");
  const { refreshProfile, profile, user, session, loading } = useAuth();
  const { t } = useCms();
  const sessionId = searchParams.get("session_id");

  // Handle unauthenticated users and missing sessionId once auth loading finishes
  useEffect(() => {
    if (loading) return;

    if (!user) {
      setPageState("not-authenticated");
      return;
    }

    if (!sessionId) {
      setPageState("no-session");
      return;
    }

    // Auth is loaded, user exists, sessionId exists — start processing
    setPageState("processing");
  }, [loading, user, sessionId]);

  // Verify checkout once we enter the processing state
  useEffect(() => {
    if (pageState !== "processing" || !sessionId || !session) return;

    let cancelled = false;

    const verifyAndActivate = async () => {
      // Try up to 3 times with increasing delays (webhook may need time)
      for (let attempt = 0; attempt < 3; attempt++) {
        if (cancelled) return;

        // Wait before each attempt (2s, 4s, 6s)
        await new Promise(r => setTimeout(r, (attempt + 1) * 2000));

        try {
          // Use session from useAuth() instead of calling supabase.auth.getSession()
          if (!session) continue;

          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-checkout`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
              body: JSON.stringify({ sessionId }),
            }
          );

          if (res.ok) {
            const result = await res.json();
            if (result.status === "activated" || result.status === "already_active") {
              await refreshProfile();
              if (!cancelled) setPageState("success");
              return;
            }
          }
        } catch (err) {
          console.error("Verify attempt failed:", err);
        }
      }

      // Final fallback: refresh profile and check membership
      await refreshProfile();
      if (!cancelled) {
        // Re-read the profile to determine if activation actually worked
        // profile state will be updated by refreshProfile() above
        // We need to check after a microtask so React state has settled
        setTimeout(() => {
          if (cancelled) return;
          // We'll set to success optimistically, then the render will
          // check the profile to decide what to show
          setPageState("success");
        }, 100);
      }
    };

    verifyAndActivate();

    return () => { cancelled = true; };
  }, [pageState, sessionId, session, refreshProfile]);

  // Determine if we should show a warning instead of success
  const activationFailed = pageState === "success" && profile && profile.membership_type === "free";

  // Fire Meta Pixel Purchase event on successful activation (once)
  const purchaseFired = useRef(false);
  useEffect(() => {
    if (pageState === "success" && !activationFailed && !purchaseFired.current) {
      purchaseFired.current = true;
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Purchase');
      }
    }
  }, [pageState, activationFailed]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Welcome to Resilient Mind Membership"
        description="Your membership is active."
        path="/pricing/success"
        noindex
      />
      <Navbar />

      <main className="pt-20 pb-16">
        <section className="py-12">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              {/* Unauthenticated user */}
              {pageState === "not-authenticated" && (
                <Card id="cms-pricing-success-login" className="border-primary/20 text-center">
                  <CardContent className="py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
                      <LogIn className="h-10 w-10 text-amber-600" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                      {t("pricing_success_login_title", "Please Log In to Activate Your Membership")}
                    </h1>
                    <p className="text-muted-foreground mb-6">
                      {t("pricing_success_login_text", "You need to be logged in so we can activate your membership.")}
                    </p>
                    <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90">
                      <Link to="/auth">
                        {t("pricing_success_login_button", "Log In")}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* No session ID */}
              {pageState === "no-session" && (
                <Card id="cms-pricing-success-no-session" className="border-primary/20 text-center">
                  <CardContent className="py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
                      <XCircle className="h-10 w-10 text-amber-600" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                      {t("pricing_success_no_session_title", "No Payment Session Found")}
                    </h1>
                    <p className="text-muted-foreground mb-6">
                      {t("pricing_success_no_session_text", "If you completed a purchase, check your email or contact support.")}
                    </p>
                    <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90">
                      <Link to="/dashboard">
                        {t("pricing_success_no_session_button", "Go to Dashboard")}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Loading auth state or processing payment */}
              {(pageState === "loading" || pageState === "processing") && (
                <Card id="cms-pricing-success-processing" className="border-primary/20 text-center">
                  <CardContent className="py-16">
                    <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-6" />
                    <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                      {t("pricing_success_processing_title", "Processing Your Payment...")}
                    </h1>
                    <p className="text-muted-foreground">
                      {t("pricing_success_processing_text", "Please wait while we activate your membership.")}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Success but activation failed — membership still free */}
              {pageState === "success" && activationFailed && (
                <div id="cms-pricing-success-pending" className="space-y-8">
                  <Card className="border-amber-300 bg-amber-50">
                    <CardContent className="py-12 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
                        <AlertTriangle className="h-10 w-10 text-amber-600" />
                      </div>

                      <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
                        {t("pricing_success_pending_title", "Payment Processing")}
                      </h1>

                      <p className="text-lg text-muted-foreground mb-6">
                        {t(
                          "pricing_success_pending_text",
                          "We're still processing your payment. If your membership isn't active within a few minutes, please contact support at"
                        )}{" "}
                        <a href="mailto:contact@resilientmind.io" className="text-primary hover:underline font-medium">
                          contact@resilientmind.io
                        </a>
                      </p>

                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
                        <Loader2 size={16} className="text-amber-600 animate-spin" />
                        <span className="text-sm font-medium text-amber-700">
                          {t("pricing_success_pending_badge", "Activation Pending")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Support Info */}
                  <Card className="bg-muted/30">
                    <CardContent className="py-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        {t("pricing_success_support_prefix", "Need help?")}{" "}
                        <Link to="/booking" className="text-primary hover:underline font-medium">
                          {t("pricing_success_support_link", "Book a free discovery call")}
                        </Link>{" "}
                        {t("pricing_success_support_middle", "or reach out to us at")}{" "}
                        <a href="mailto:contact@resilientmind.io" className="text-primary hover:underline font-medium">
                          contact@resilientmind.io
                        </a>
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* True success — membership activated */}
              {pageState === "success" && !activationFailed && (
                <div id="cms-pricing-success-success" className="space-y-8">
                  {/* Success Message */}
                  <Card className="border-primary/20 bg-gradient-warm">
                    <CardContent className="py-12 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>

                      <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
                        {t("pricing_success_title", "Welcome to Your Journey!")}
                      </h1>

                      <p className="text-lg text-muted-foreground mb-6">
                        {t("pricing_success_text", "Your payment was successful and your membership is now active.")}
                      </p>

                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                        <Crown size={16} className="text-primary" />
                        <span className="text-sm font-medium text-primary">
                          {t("pricing_success_badge", "Membership Activated")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* What Happens Next */}
                  <Card id="cms-pricing-success-next">
                    <CardHeader>
                      <CardTitle className="text-2xl font-serif">
                        {t("pricing_success_next_title", "What Happens Next?")}
                      </CardTitle>
                      <CardDescription>
                        {t("pricing_success_next_subtitle", "Here's what you can expect in the coming moments")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            <span className="text-primary font-semibold">1</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{t("pricing_success_next_1_title", "Email Confirmation")}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t(
                              "pricing_success_next_1_text",
                              "You'll receive a confirmation email with your membership details and receipt within the next few minutes."
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            <span className="text-primary font-semibold">2</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{t("pricing_success_next_2_title", "Dashboard Access")}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t(
                              "pricing_success_next_2_text",
                              "Your dashboard is now unlocked with all the content available for your membership tier."
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            <span className="text-primary font-semibold">3</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{t("pricing_success_next_3_title", "Start Learning")}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t(
                              "pricing_success_next_3_text",
                              "Begin with the introduction videos and explore your personalized 12-month program."
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Access Cards */}
                  <div id="cms-pricing-success-cards" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-primary/20 hover:shadow-elevated transition-all">
                      <CardHeader>
                        <div className="p-3 bg-primary/10 rounded-full w-fit mb-2">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg font-serif">
                          {t("pricing_success_card1_title", "Watch Videos")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {t("pricing_success_card1_text", "Access your weekly video content and start your transformation journey.")}
                        </p>
                        <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                          <Link to="/dashboard">
                            {t("pricing_success_card1_button", "Go to Dashboard")}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/20 hover:shadow-elevated transition-all">
                      <CardHeader>
                        <div className="p-3 bg-primary/10 rounded-full w-fit mb-2">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg font-serif">
                          {t("pricing_success_card2_title", "Download Resources")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {t("pricing_success_card2_text", "Get your workbooks, worksheets, and meditation guides.")}
                        </p>
                        <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                          <Link to="/dashboard?tab=resources">
                            {t("pricing_success_card2_button", "View Resources")}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/20 hover:shadow-elevated transition-all">
                      <CardHeader>
                        <div className="p-3 bg-primary/10 rounded-full w-fit mb-2">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg font-serif">
                          {t("pricing_success_card3_title", "Book a Session")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {t("pricing_success_card3_text", "Premium members can schedule their consultation sessions.")}
                        </p>
                        <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                          <Link to="/booking">
                            {t("pricing_success_card3_button", "Book Now")}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* CTA */}
                  <Card id="cms-pricing-success-cta" className="bg-gradient-gold text-white border-0">
                    <CardContent className="py-8 text-center">
                      <h2 className="text-2xl font-serif font-semibold mb-4">
                        {t("pricing_success_cta_title", "Ready to Start Your Transformation?")}
                      </h2>
                      <p className="mb-6 opacity-90">
                        {t("pricing_success_cta_text", "Head to your dashboard and begin exploring your personalized program.")}
                      </p>
                      <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                        <Link to="/dashboard">
                          {t("pricing_success_cta_button", "Go to Dashboard")}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Support Info */}
                  <Card className="bg-muted/30">
                    <CardContent className="py-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        {t("pricing_success_final_support_prefix", "Need help getting started? Have questions?")}{" "}
                        <Link to="/booking" className="text-primary hover:underline font-medium">
                          {t("pricing_success_final_support_link", "Book a free discovery call")}
                        </Link>{" "}
                        {t("pricing_success_final_support_middle", "or reach out to us at")}{" "}
                        <a href="mailto:contact@resilientmind.io" className="text-primary hover:underline font-medium">
                          contact@resilientmind.io
                        </a>
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingSuccess;
