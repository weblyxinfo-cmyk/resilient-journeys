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

const plans = {
  basic_monthly: {
    id: 'basic_monthly',
    name: 'Basic',
    subtitle: 'Měsíční',
    price: 27,
    interval: 'měsíc',
    membershipType: 'basic' as const,
    features: [
      '4 video lekce měsíčně',
      'Stažitelné pracovní listy',
      'Knihovna meditací',
      'Přístup do komunity',
      'Měsíční Q&A',
    ],
  },
  basic_yearly: {
    id: 'basic_yearly',
    name: 'Basic',
    subtitle: 'Roční',
    price: 270,
    interval: 'rok',
    membershipType: 'basic' as const,
    savings: 54,
    features: [
      '4 video lekce měsíčně',
      'Stažitelné pracovní listy',
      'Knihovna meditací',
      'Přístup do komunity',
      'Měsíční Q&A',
    ],
  },
  premium_monthly: {
    id: 'premium_monthly',
    name: 'Premium',
    subtitle: 'Měsíční',
    price: 47,
    interval: 'měsíc',
    membershipType: 'premium' as const,
    features: [
      'Vše z Basic',
      '4 osobní konzultace/rok',
      'Art therapy materiály',
      'Prioritní email podpora',
      'Exkluzivní workshopy',
      'Materiály pro partnery',
    ],
  },
  premium_yearly: {
    id: 'premium_yearly',
    name: 'Premium',
    subtitle: 'Roční',
    price: 470,
    interval: 'rok',
    membershipType: 'premium' as const,
    savings: 94,
    features: [
      'Vše z Basic',
      '4 osobní konzultace/rok',
      'Art therapy materiály',
      'Prioritní email podpora',
      'Exkluzivní workshopy',
      'Materiály pro partnery',
    ],
  },
};

type PlanId = keyof typeof plans;

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  
  const planId = (searchParams.get('plan') || 'basic_monthly') as PlanId;
  const plan = plans[planId] || plans.basic_monthly;
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth?redirect=/checkout?plan=' + planId);
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Call the checkout edge function
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout?plan=${planId}`,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Chyba při vytváření platby');
      }

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('Nepodařilo se získat odkaz na platbu');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Došlo k chybě při zpracování platby');
      setProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

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
              Zpět na program
            </Button>

            <Card className="border-gold/30">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-serif">
                  Dokončit objednávku
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Plan summary */}
                <div className="p-4 bg-gradient-warm rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-serif font-semibold text-lg">
                        {plan.name} - {plan.subtitle}
                      </h3>
                      {'savings' in plan && plan.savings && (
                        <span className="text-sm text-gold font-medium">
                          Ušetříte €{String(plan.savings)}
                        </span>
                      )}
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
                    Přihlášen jako: <span className="font-medium">{user.email}</span>
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
                      Zpracování...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Zaplatit €{plan.price}
                    </>
                  )}
                </Button>

                {/* Not logged in */}
                {!user && (
                  <div className="text-center text-sm text-muted-foreground">
                    Nemáte účet?{' '}
                    <Link to={`/auth?redirect=/checkout?plan=${planId}`} className="text-gold hover:underline">
                      Zaregistrujte se
                    </Link>
                  </div>
                )}

                {/* Security note */}
                <p className="text-xs text-center text-muted-foreground">
                  Platba je zabezpečena pomocí Stripe. 
                  Vaše údaje jsou šifrovány.
                </p>
              </CardContent>
            </Card>

            {/* Other plans */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-3">Jiný plán?</p>
              <div className="flex flex-wrap justify-center gap-2">
                {(Object.entries(plans) as [PlanId, typeof plans[PlanId]][]).map(([id, p]) => (
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
