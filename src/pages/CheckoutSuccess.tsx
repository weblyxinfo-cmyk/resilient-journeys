import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}
import { CheckCircle, Loader2, PartyPopper, AlertTriangle, LogIn, XCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useCms } from "@/hooks/useCms";

type PageState = "loading" | "processing" | "success" | "error" | "no-session" | "not-authenticated";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const { refreshProfile, profile, user, session, loading: authLoading } = useAuth();
  const { t } = useCms();
  const [pageState, setPageState] = useState<PageState>("loading");
  const sessionId = searchParams.get("session_id");

  // Handle unauthenticated users and missing sessionId once auth loading finishes
  useEffect(() => {
    if (authLoading) return;

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
  }, [authLoading, user, sessionId]);

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

      // Final fallback: refresh profile and check
      await refreshProfile();
      if (!cancelled) {
        setTimeout(() => {
          if (cancelled) return;
          setPageState("success");
        }, 100);
      }
    };

    verifyAndActivate();

    return () => { cancelled = true; };
  }, [pageState, sessionId, session, refreshProfile]);

  // Determine if activation actually worked
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
        title="Checkout Confirmed | Resilient Mind"
        description="Your purchase was confirmed."
        path="/checkout/success"
        noindex
      />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container px-4">
          <div className="max-w-lg mx-auto text-center">
            {/* Unauthenticated user */}
            {pageState === "not-authenticated" && (
              <Card id="cms-checkout-success-login" className="border-gold/30 overflow-hidden">
                <div className="bg-gradient-gold p-8">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto">
                    <LogIn className="h-10 w-10 text-gold" />
                  </div>
                </div>
                <CardContent className="p-8">
                  <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                    {t("checkout_success_login_title", "Please Log In")}
                  </h1>
                  <p className="text-muted-foreground mb-6">
                    {t("checkout_success_login_text", "You need to be logged in so we can activate your membership.")}
                  </p>
                  <Button asChild className="bg-gradient-gold text-white">
                    <Link to="/auth">
                      {t("checkout_success_login_button", "Log In")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* No session ID */}
            {pageState === "no-session" && (
              <Card id="cms-checkout-success-no-session" className="border-gold/30 overflow-hidden">
                <div className="bg-gradient-gold p-8">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="h-10 w-10 text-gold" />
                  </div>
                </div>
                <CardContent className="p-8">
                  <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                    {t("checkout_success_no_session_title", "No Payment Session Found")}
                  </h1>
                  <p className="text-muted-foreground mb-6">
                    {t("checkout_success_no_session_text", "If you completed a purchase, check your email or contact support.")}
                  </p>
                  <Button asChild className="bg-gradient-gold text-white">
                    <Link to="/dashboard">
                      {t("checkout_success_no_session_button", "Go to Dashboard")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Loading / Processing */}
            {(pageState === "loading" || pageState === "processing") && (
              <Card id="cms-checkout-success-processing" className="border-gold/30 overflow-hidden">
                <div className="bg-gradient-gold p-8">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="h-10 w-10 text-gold animate-spin" />
                  </div>
                </div>
                <CardContent className="p-8">
                  <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                    {t("checkout_success_processing_title", "Processing Your Payment...")}
                  </h1>
                  <p className="text-muted-foreground">
                    {t("checkout_success_processing_text", "Please wait while we activate your membership.")}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Success but activation failed — membership still free */}
            {pageState === "success" && activationFailed && (
              <Card id="cms-checkout-success-pending" className="border-gold/30 overflow-hidden">
                <div className="bg-amber-100 p-8">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="h-10 w-10 text-amber-600" />
                  </div>
                </div>
                <CardContent className="p-8">
                  <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                    {t("checkout_success_pending_title", "Payment Processing")}
                  </h1>
                  <p className="text-muted-foreground mb-6">
                    {t(
                      "checkout_success_pending_text",
                      "We're still processing your payment. If your membership isn't active within a few minutes, please contact support at"
                    )}{" "}
                    <a href="mailto:contact@resilientmind.io" className="text-gold hover:underline font-medium">
                      contact@resilientmind.io
                    </a>
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-6">
                    <Loader2 size={16} className="text-amber-600 animate-spin" />
                    <span className="text-sm font-medium text-amber-700">
                      {t("checkout_success_pending_badge", "Activation Pending")}
                    </span>
                  </div>
                  <div>
                    <Button asChild className="bg-gradient-gold text-white">
                      <Link to="/dashboard">{t("checkout_success_pending_button", "Go to Dashboard")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* True success — membership activated */}
            {pageState === "success" && !activationFailed && (
              <Card id="cms-checkout-success-success" className="border-gold/30 overflow-hidden">
                <div className="bg-gradient-gold p-8">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-10 w-10 text-gold" />
                  </div>
                </div>

                <CardContent className="p-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <PartyPopper className="h-6 w-6 text-gold" />
                    <span className="text-gold font-semibold">{t("checkout_success_thank_you", "Thank you!")}</span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                    {t("checkout_success_title", "Payment Successful")}
                  </h1>

                  <p className="text-muted-foreground mb-6">
                    {t(
                      "checkout_success_text",
                      "Your membership has been activated. You now have access to all content based on your membership level."
                    )}
                  </p>

                  {profile && (
                    <div className="mb-6 p-4 bg-gradient-warm rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">{t("checkout_success_membership_label", "Your membership")}</p>
                      <p className="font-serif font-semibold text-lg capitalize">
                        {profile.membership_type}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild className="bg-gradient-gold text-white">
                      <Link to="/dashboard">{t("checkout_success_dashboard_button", "Go to Dashboard")}</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/resilient-hub">{t("checkout_success_explore_button", "Explore Program")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
