import { Check, Crown, Loader2, Shield, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMembershipTiers } from "@/hooks/useMembershipTiers";

interface PricingCardsProps {
  cancelUrl?: string;
}

const PricingCards = ({ cancelUrl = "/" }: PricingCardsProps) => {
  const navigate = useNavigate();
  const { session: authSession } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { visibleTiers } = useMembershipTiers();

  // expectedPriceEur lets create-checkout catch a stale price shown to a
  // visitor with an old CMS cache or JS bundle — see docs/cms-review.md §B2.
  const createCheckoutSession = async (productType: string, expectedPriceEur: number) => {
    setLoadingTier(productType);

    // Use auth hook session - this is reliable (has timeout, cleared on expiry)
    // Don't use supabase.auth.getSession() which reads stale data from localStorage
    if (!authSession) {
      toast.error("Please log in first");
      navigate("/auth?redirect=/pricing");
      setLoadingTier(null);
      return;
    }

    // Safety timeout - always reset button after 10s no matter what
    const safetyTimeout = setTimeout(() => {
      setLoadingTier(null);
      toast.error("Request timed out. Please try again.");
    }, 10000);

    try {
      // Try to refresh for a fresh token (with 3s timeout), fall back to current
      let accessToken = authSession.access_token;
      try {
        const refreshResult = await Promise.race([
          supabase.auth.refreshSession(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("refresh timeout")), 3000)
          ),
        ]);
        if (refreshResult.data?.session) {
          accessToken = refreshResult.data.session.access_token;
        }
      } catch {
        // Use existing token if refresh fails or times out
      }

      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 8000);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          planId: productType,
          expectedPriceEur,
          successUrl: `${window.location.origin}/thank-you-membership`,
          cancelUrl: `${window.location.origin}${cancelUrl}`,
        }),
      });

      clearTimeout(fetchTimeout);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || `Server error (${response.status})`);
      }

      if (result?.url) {
        clearTimeout(safetyTimeout);
        window.location.href = result.url;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (error: any) {
      console.error("Checkout error:", error);
      clearTimeout(safetyTimeout);
      if (error.name === 'AbortError') {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error(error.message || "Failed to start checkout");
      }
      setLoadingTier(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {visibleTiers.map((tier) => {
        const currentPrice = tier.price;
        const isPremium = tier.membershipType === 'premium';

        return (
          <div
            key={tier.id}
            className={`group relative rounded-3xl transition-all duration-300 ${
              isPremium
                ? "bg-gradient-to-b from-primary/8 to-primary/3 border-2 border-primary/30 shadow-[0_8px_40px_-12px_hsla(30,25%,30%,0.18)]"
                : "bg-card border border-border/60 hover:border-primary/20 hover:shadow-[0_8px_30px_-12px_hsla(30,25%,30%,0.1)]"
            }`}
          >
            {/* Badges */}
            {tier.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-gold text-white text-xs font-sans font-semibold rounded-full shadow-md whitespace-nowrap">
                  {isPremium && <Crown size={12} className="flex-shrink-0" />}
                  {tier.badge}
                </span>
              </div>
            )}

            <div className="p-8 pt-10 h-full flex flex-col">
              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-serif font-semibold text-foreground mb-1.5">
                  {tier.name}
                </h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                  {tier.subtitle}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="inline-flex items-baseline">
                  <span className="text-lg font-sans text-muted-foreground/70">€</span>
                  <span className="text-5xl font-serif font-bold tracking-tight text-foreground">
                    {currentPrice}
                  </span>
                </div>
                <div className="text-sm font-sans text-muted-foreground">
                  {tier.period}
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-border/60 mb-6" />

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                    <Check size={16} className="text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="font-sans">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button
                onClick={() => createCheckoutSession(tier.id, currentPrice)}
                disabled={loadingTier === tier.id}
                className={`w-full rounded-full h-12 font-sans font-semibold text-sm transition-all ${
                  isPremium
                    ? "bg-muted-foreground/60 text-background hover:bg-muted-foreground/70"
                    : "bg-muted-foreground/60 text-background hover:bg-muted-foreground/70"
                }`}
              >
                {loadingTier === tier.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  tier.buttonText
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const PricingTrustSignals = () => (
  <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-[13px] text-muted-foreground/70 mt-10">
    <div className="flex items-center gap-2">
      <Shield size={15} className="text-primary/60" />
      <span className="font-sans">Secure payment via Stripe</span>
    </div>
    <div className="flex items-center gap-2">
      <Clock size={15} className="text-primary/60" />
      <span className="font-sans">One-time payment — no auto-renewal</span>
    </div>
    <div className="flex items-center gap-2">
      <Heart size={15} className="text-primary/60" />
      <span className="font-sans">Instant access after payment</span>
    </div>
  </div>
);

export default PricingCards;
