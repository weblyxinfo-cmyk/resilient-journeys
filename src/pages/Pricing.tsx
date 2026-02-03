import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import PricingCards, { PricingTrustSignals } from "@/components/PricingCards";
import {
  Check,
  Crown,
  Loader2,
  Sparkles,
  Heart,
  Brain,
  Video,
  FileText,
  Music,
  User,
  Zap,
} from "lucide-react";

// Additional hubs that can be purchased separately
const ADDITIONAL_HUBS = [
  {
    id: "transformed_self",
    name: "The Transformed Self",
    slug: "transformed-self",
    price: 127,
    description: "Carrying Your Strength Across Borders",
    features: [
      "2 specialized video sessions",
      "2 interactive workbooks",
      "Identity transformation tools",
      "Cultural adaptation strategies",
      "Lifetime access",
    ],
    icon: Sparkles,
  },
  {
    id: "endometriosis",
    name: "Endometriosis Hub",
    slug: "endometriosis",
    price: 127,
    description: "Managing chronic pain while living abroad",
    features: [
      "1 hour individual session",
      "1 hour Reiki treatment",
      "Art Therapy tool kit for chronic pain",
    ],
    icon: Heart,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const createHubCheckout = async (hubSlug: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error("Please log in first");
      navigate("/auth");
      return;
    }

    setLoadingTier(`hub_${hubSlug}`);

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
            product_type: "hub",
            user_id: userData.user.id,
            hub_slug: hubSlug,
            success_url: `${window.location.origin}/pricing/success`,
            cancel_url: `${window.location.origin}/pricing`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to start checkout");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing — Membership Plans from €27/month | Resilient Mind"
        description="Choose from Basic or Premium membership plans. Monthly from €27 or yearly from €270 with savings. Includes video lessons, workbooks and more."
        path="/pricing"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Resilient Mind Membership",
          description:
            "Membership plans for art expressive therapy programs for expatriates.",
          brand: {
            "@type": "Organization",
            name: "Resilient Mind",
          },
          offers: [
            {
              "@type": "Offer",
              name: "Basic Monthly",
              price: "27",
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
              url: "https://resilient-journeys.vercel.app/pricing",
            },
            {
              "@type": "Offer",
              name: "Basic Yearly",
              price: "270",
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
              url: "https://resilient-journeys.vercel.app/pricing",
            },
            {
              "@type": "Offer",
              name: "Premium Monthly",
              price: "47",
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
              url: "https://resilient-journeys.vercel.app/pricing",
            },
            {
              "@type": "Offer",
              name: "Premium Yearly",
              price: "470",
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
              url: "https://resilient-journeys.vercel.app/pricing",
            },
          ],
        }}
      />
      <Navbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <PageHero>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Crown size={16} className="text-primary" />
              <span className="text-sm font-sans font-medium text-primary">
                Membership Pricing
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
              Choose Your Journey
            </h1>

            <p className="text-lg text-muted-foreground font-sans">
              Select the membership tier that fits your needs. All plans include
              access to our transformative 12-month program.
            </p>
          </div>
        </PageHero>

        {/* Main Membership Tiers */}
        <section className="py-12">
          <div className="container px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-12">
                Main Membership Plans
              </h2>

              <PricingCards cancelUrl="/pricing" />
              <PricingTrustSignals />
            </div>
          </div>
        </section>

        {/* Additional Hubs Section */}
        <section className="py-12 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                  Additional Specialized Hubs
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Deep-dive programs focusing on specific challenges. Can be
                  purchased separately or included with Premium membership.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                {ADDITIONAL_HUBS.map((hub) => {
                  const IconComponent = hub.icon;
                  return (
                    <div
                      key={hub.id}
                      className="group bg-card/80 backdrop-blur-sm rounded-3xl border border-border/60 p-1 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_8px_30px_-12px_hsla(30,25%,30%,0.12)]"
                    >
                      <div className="rounded-[1.25rem] bg-gradient-to-b from-background/60 to-background/30 p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-11 h-11 rounded-2xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
                            <IconComponent size={20} className="text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-serif font-semibold">
                              {hub.name}
                            </h3>
                            <div className="inline-flex items-baseline gap-0.5 mt-1">
                              <span className="text-xs font-sans text-muted-foreground/70">€</span>
                              <span className="text-2xl font-serif font-bold text-foreground">
                                {hub.price}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground font-sans mb-4">
                          {hub.description}
                        </p>

                        <div className="w-12 h-px bg-border/80 my-4" />

                        <ul className="space-y-2.5 mb-6">
                          {hub.features.map((feature, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2.5 text-[13px] leading-relaxed text-foreground/80"
                            >
                              <div className="w-4 h-4 rounded-full bg-primary/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check size={10} className="text-primary" strokeWidth={3} />
                              </div>
                              <span className="font-sans">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          onClick={() => createHubCheckout(hub.slug)}
                          disabled={loadingTier === `hub_${hub.slug}`}
                          variant="outline"
                          className="w-full rounded-full h-11 font-sans font-medium text-sm border-primary/30 text-primary hover:bg-primary hover:text-white transition-all"
                        >
                          {loadingTier === `hub_${hub.slug}` ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Purchase Hub"
                          )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground/60 mt-3 font-sans">
                          Included free with Premium membership
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-12">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-12">
                What's Included
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    icon: Video,
                    title: "Video Content",
                    desc: "48 weekly videos covering EFT tapping, art therapy, and guided meditations throughout the 12-month journey.",
                  },
                  {
                    icon: FileText,
                    title: "Workbooks",
                    desc: "Downloadable worksheets, reflection exercises, and practical tools to support your transformation.",
                  },
                  {
                    icon: User,
                    title: "Personal Support",
                    desc: "Premium members receive individual consultation sessions and priority support throughout their journey.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group bg-card/80 backdrop-blur-sm rounded-3xl border border-border/60 p-1 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="rounded-[1.25rem] bg-gradient-to-b from-background/60 to-background/30 p-6">
                      <div className="w-11 h-11 rounded-2xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors">
                        <item.icon size={20} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-serif font-semibold mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-gradient-warm">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-muted-foreground mb-6 font-sans">
                Choose the plan that resonates with you. You can upgrade or
                change your membership at any time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => {
                    if (!user) {
                      navigate("/auth");
                    } else {
                      const element = document.querySelector("section");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  size="lg"
                  className="bg-gradient-gold text-white rounded-full"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
                <Button
                  onClick={() => navigate("/about")}
                  size="lg"
                  variant="outline"
                  className="border-primary/30 text-primary rounded-full"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
