import { Check, Crown, Loader2, Shield, Clock, Heart, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  getVisibleTiers,
  getTierPrice,
  isEarlyBird,
  formatEarlyBirdEnd,
  type MembershipTier,
} from "@/lib/pricing";

interface PricingCardsProps {
  cancelUrl?: string;
}

const PricingCards = ({ cancelUrl = "/" }: PricingCardsProps) => {
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const visibleTiers = getVisibleTiers();
  const earlyBird = isEarlyBird();

  const createCheckoutSession = async (productType: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error("Please log in first");
      navigate("/auth");
      return;
    }
    setLoadingTier(productType);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            product_type: productType,
            user_id: userData.user.id,
            success_url: `${window.location.origin}/pricing/success`,
            cancel_url: `${window.location.origin}${cancelUrl}`,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to start checkout");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {visibleTiers.map((tier) => {
        const currentPrice = getTierPrice(tier);
        const hasDiscount = earlyBird && tier.regularPrice !== tier.earlyBirdPrice;
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
            {(tier.badge || hasDiscount) && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {tier.badge && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-gold text-white text-xs font-sans font-semibold rounded-full shadow-md whitespace-nowrap">
                    {isPremium && <Crown size={12} className="flex-shrink-0" />}
                    {tier.badge}
                  </span>
                )}
                {hasDiscount && (
                  <span className="inline-flex items-center px-4 py-1.5 bg-muted text-muted-foreground text-xs font-sans font-semibold rounded-full shadow-md whitespace-nowrap">
                    Early Bird
                  </span>
                )}
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
                {hasDiscount && (
                  <div className="text-sm font-sans text-muted-foreground/60 line-through mb-0.5">
                    €{tier.regularPrice}
                  </div>
                )}
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
                onClick={() => createCheckoutSession(tier.id)}
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
      <span className="font-sans">Cancel anytime — no lock-in</span>
    </div>
    <div className="flex items-center gap-2">
      <Heart size={15} className="text-primary/60" />
      <span className="font-sans">Instant access after payment</span>
    </div>
  </div>
);

export const EarlyBirdBanner = () => {
  const earlyBird = isEarlyBird();
  if (!earlyBird) return null;
  return (
    <div className="mb-8 inline-block bg-gradient-gold text-primary-foreground rounded-full px-6 py-2 font-sans font-semibold text-sm">
      Early-bird pricing until {formatEarlyBirdEnd()} — Save €10/month!
    </div>
  );
};

export default PricingCards;
