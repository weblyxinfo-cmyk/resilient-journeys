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
import {
  MEMBERSHIP_TIERS,
  getTierPrice,
  isEarlyBird,
  formatEarlyBirdEnd,
} from "@/lib/pricing";

// Build plans from centralized pricing (only monthly visible)
const buildPlans = () => {
  const plans: Record<string, {
    id: string;
    name: string;
    subtitle: string;
    price: number;
    regularPrice: number;
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
      regularPrice: tier.regularPrice,
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

  const plans = buildPlans();
  const productParam = searchParams.get('product');
  const hubSlug = searchParams.get('hub');
  const isHubPurchase = productParam === 'hub' && !!hubSlug;
  const planId = (searchParams.get('plan') || 'basic_monthly') as PlanId;
  const plan = plans[planId] || plans.basic_monthly;
  const earlyBird = isEarlyBird();

  // Hub display info
  const hubInfo: Record<string, { name: string; price: number; description: string }> = {
    'endometriosis': { name: 'Endometriosis Management Hub', price: 147, description: 'Managing chronic pain while living abroad' },
    'transformed-self': { name: 'The Transformed Self Hub', price: 127, description: 'Carrying Your Strength Across Borders' },
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
      setError('Request timed out. Please try again.');
    }, 20000);

    try {
      const body = isHubPurchase
        ? {
            product_type: 'hub',
            hub_slug: hubSlug,
            successUrl: `${window.location.origin}/checkout/success`,
            cancelUrl: `${window.location.origin}/checkout?product=hub&hub=${hubSlug}`,
          }
        : {
            planId,
            successUrl: `${window.location.origin}/checkout/success`,
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
          : 'Error creating payment';
        throw new Error(errorMsg);
      }

      if (data?.url) {
        window.location.href = data.url;
        return; // Don't reset - page is navigating
      }
      throw new Error('Could not get payment link');
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'An error occurred while processing payment');
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
          <div className="max-w-lg mx-auto">
            {/* Back button */}
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate('/resilient-hub')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to program
            </Button>

            <Card className="border-gold/30">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-serif">
                  Complete Your Order
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
                        <span className="text-muted-foreground text-sm"> one-time</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Early-bird notice */}
                    {earlyBird && plan.regularPrice !== plan.price && (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center text-sm text-green-800 font-medium">
                        Early-bird pricing active until {formatEarlyBirdEnd()}!
                      </div>
                    )}

                    {/* Plan summary */}
                    <div className="p-4 bg-gradient-warm rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-serif font-semibold text-lg">
                            {plan.name} - {plan.subtitle}
                          </h3>
                        </div>
                        <div className="text-right">
                          {earlyBird && plan.regularPrice !== plan.price && (
                            <span className="text-sm text-muted-foreground line-through mr-2">
                              €{plan.regularPrice}
                            </span>
                          )}
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
                    Signed in as: <span className="font-medium">{user.email}</span>
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Pay €{isHubPurchase && hub ? hub.price : plan.price}
                    </>
                  )}
                </Button>

                {/* Not logged in */}
                {!user && (
                  <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to={`/auth?redirect=/checkout?plan=${planId}`} className="text-gold hover:underline">
                      Sign up
                    </Link>
                  </div>
                )}

                {/* Security note */}
                <p className="text-xs text-center text-muted-foreground">
                  Payment is secured by Stripe.
                  Your data is encrypted.
                </p>
              </CardContent>
            </Card>

            {/* Other plans (only visible/monthly) - hide for hub purchases */}
            {!isHubPurchase && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-3">Different plan?</p>
              <div className="flex flex-wrap justify-center gap-2">
                {visiblePlans.map(([id, p]) => (
                  <Button
                    key={id}
                    variant={id === planId ? "default" : "outline"}
                    size="sm"
                    className={id === planId ? "bg-gold" : ""}
                    onClick={() => navigate(`/checkout?plan=${id}`)}
                  >
                    {p.name} {p.subtitle}
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
