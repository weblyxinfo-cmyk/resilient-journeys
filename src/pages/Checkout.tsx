import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Check, CreditCard, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCms } from "@/hooks/useCms";
import {
  MEMBERSHIP_TIERS,
  getTierPrice,
} from "@/lib/pricing";

// Build plans from centralized pricing (only monthly visible)
const buildPlans = () => {
  const plans: Record<string, {
    id: string;
    name: string;
    subtitle: string;
    price: number;
    interval: string;
    membershipType: 'basic' | 'premium';
    features: string[];
    hidden: boolean;
  }> = {};

  for (const tier of MEMBERSHIP_TIERS) {
    plans[tier.id] = {
      id: tier.id,
      name: tier.membershipType === 'basic' ? 'Basic' : 'Premium',
      subtitle: tier.interval === 'month' ? 'Monthly' : 'Yearly',
      price: getTierPrice(tier),
      interval: tier.interval,
      membershipType: tier.membershipType,
      features: tier.features,
      hidden: tier.hidden,
    };
  }

  return plans;
};

type PlanId = string;

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { t } = useCms();

  const plans = buildPlans();
  const productParam = searchParams.get('product');
  const hubSlug = searchParams.get('hub');
  const isHubPurchase = productParam === 'hub' && !!hubSlug;
  const planId = (searchParams.get('plan') || 'basic_monthly') as PlanId;
  const plan = plans[planId] || plans.basic_monthly;

  // Translated labels — buildPlans() keeps its English defaults so pricing
  // logic stays untouched; render uses these maps instead of plan.name/subtitle.
  const membershipTypeLabel: Record<'basic' | 'premium', string> = {
    basic: t("checkout_plan_type_basic", "Basic"),
    premium: t("checkout_plan_type_premium", "Premium"),
  };
  const intervalLabel: Record<string, string> = {
    month: t("checkout_plan_interval_monthly", "Monthly"),
    year: t("checkout_plan_interval_yearly", "Yearly"),
  };

  // Hub display info
  const hubInfo: Record<string, { name: string; price: number; description: string }> = {
    'endometriosis': {
      name: t("checkout_hub_endometriosis_name", "Endometriosis Management Hub"),
      price: 147,
      description: t("checkout_hub_endometriosis_description", "Managing chronic pain while living abroad"),
    },
    'transformed_self': {
      name: t("checkout_hub_transformed_self_name", "The Transformed Self Hub"),
      price: 127,
      description: t("checkout_hub_transformed_self_description", "Carrying Your Strength Across Borders"),
    },
  };
  const hub = hubSlug ? hubInfo[hubSlug] : null;

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      const redirect = isHubPurchase
        ? `/checkout?product=hub&hub=${hubSlug}`
        : `/checkout?plan=${planId}`;
      navigate('/auth?redirect=' + encodeURIComponent(redirect));
      return;
    }

    setProcessing(true);
    setError(null);

    // Safety timeout - always reset button after 20s
    const safetyTimeout = setTimeout(() => {
      setProcessing(false);
      setError(t("checkout_error_timeout", "Request timed out. Please try again."));
    }, 20000);

    try {
      const body = isHubPurchase
        ? {
            product_type: 'hub',
            hub_slug: hubSlug,
            successUrl: `${window.location.origin}/thank-you-membership`,
            cancelUrl: `${window.location.origin}/checkout?product=hub&hub=${hubSlug}`,
          }
        : {
            planId,
            successUrl: `${window.location.origin}/thank-you-membership`,
            cancelUrl: `${window.location.origin}/checkout?plan=${planId}`,
          };

      console.log("Calling create-checkout:", body);

      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body,
      });

      console.log("create-checkout response:", { data, error: fnError });

      if (fnError) {
        const errorMsg = typeof fnError === 'object' && fnError.message
          ? fnError.message
          : t("checkout_error_generic", "Error creating payment");
        throw new Error(errorMsg);
      }

      if (data?.url) {
        window.location.href = data.url;
        return; // Don't reset - page is navigating
      }
      throw new Error(t("checkout_error_no_link", "Could not get payment link"));
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || t("checkout_error_processing", "An error occurred while processing payment"));
      setProcessing(false);
    } finally {
      clearTimeout(safetyTimeout);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  // Only show non-hidden plans in the switcher
  const visiblePlans = Object.entries(plans).filter(([, p]) => !p.hidden);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container px-4">
          <div id="cms-checkout-summary" className="max-w-lg mx-auto">
            {/* Back button */}
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate('/resilient-hub')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("checkout_back_button", "Back to program")}
            </Button>

            <Card className="border-gold/30">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-serif">
                  {t("checkout_title", "Complete Your Order")}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {isHubPurchase && hub ? (
                  /* Hub purchase summary */
                  <div className="p-4 bg-gradient-warm rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-serif font-semibold text-lg">{hub.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{hub.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-serif font-bold">€{hub.price}</span>
                        <span className="text-muted-foreground text-sm"> {t("checkout_hub_one_time_label", "one-time")}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Plan summary */}
                    <div className="p-4 bg-gradient-warm rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-serif font-semibold text-lg">
                            {membershipTypeLabel[plan.membershipType]} - {intervalLabel[plan.interval]}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-serif font-bold">€{plan.price}</span>
                          <span className="text-muted-foreground text-sm">/{plan.interval}</span>
                        </div>
                      </div>

                      <ul className="space-y-2 mt-4">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-gold flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* Error message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* User info */}
                {user && (
                  <div className="text-sm text-muted-foreground">
                    {t("checkout_signed_in_as", "Signed in as:")} <span className="font-medium">{user.email}</span>
                  </div>
                )}

                {/* Checkout button */}
                <Button
                  className="w-full bg-gradient-gold text-white py-6 text-lg"
                  onClick={handleCheckout}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t("checkout_button_processing", "Processing...")}
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      {t("checkout_pay_button_prefix", "Pay")} €{isHubPurchase && hub ? hub.price : plan.price}
                    </>
                  )}
                </Button>

                {/* Not logged in */}
                {!user && (
                  <div className="text-center text-sm text-muted-foreground">
                    {t("checkout_no_account_text", "Don't have an account?")}{' '}
                    <Link to={`/auth?redirect=${encodeURIComponent(`/checkout?plan=${planId}`)}`} className="text-gold hover:underline">
                      {t("checkout_signup_link", "Sign up")}
                    </Link>
                  </div>
                )}

                {/* Security note */}
                <p className="text-xs text-center text-muted-foreground">
                  {t("checkout_security_note", "Payment is secured by Stripe. Your data is encrypted.")}
                </p>
              </CardContent>
            </Card>

            {/* Other plans (only visible/monthly) - hide for hub purchases */}
            {!isHubPurchase && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-3">{t("checkout_different_plan_text", "Different plan?")}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {visiblePlans.map(([id, p]) => (
                  <Button
                    key={id}
                    variant={id === planId ? "default" : "outline"}
                    size="sm"
                    className={id === planId ? "bg-gold" : ""}
                    onClick={() => navigate(`/checkout?plan=${id}`)}
                  >
                    {membershipTypeLabel[p.membershipType]} {intervalLabel[p.interval]}
                  </Button>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
