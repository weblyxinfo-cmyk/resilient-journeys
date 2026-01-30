import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

// Membership tiers configuration
const MEMBERSHIP_TIERS = [
  {
    id: "monthly_basic",
    name: "Basic Monthly",
    price: 27,
    period: "/month",
    savings: null,
    badge: null,
    description: "Access to the complete 12-month core program",
    features: [
      "Access to 12-month core program",
      "48 weekly videos (4 per month)",
      "48 workbooks & worksheets",
      "Guided meditations library",
      "EFT tapping sessions",
      "Art therapy exercises",
      "Community support",
    ],
    buttonText: "Start Monthly",
    highlighted: false,
  },
  {
    id: "yearly_basic",
    name: "Basic Yearly",
    price: 270,
    period: "/year",
    savings: "Save €54",
    badge: "Best Value",
    description: "Pay once for 12 months of core program access",
    features: [
      "Everything in Basic Monthly",
      "Pay once, access for 12 months",
      "2 months free",
      "Priority email support",
      "Early access to new content",
    ],
    buttonText: "Save with Yearly",
    highlighted: true,
  },
  {
    id: "monthly_premium",
    name: "Premium Monthly",
    price: 47,
    period: "/month",
    savings: null,
    badge: null,
    description: "Everything in Basic plus exclusive additional hubs",
    features: [
      "Everything in Basic Monthly",
      "Both Additional Hubs included",
      "The Transformed Self Hub",
      "Endometriosis Management Hub",
      "1 free individual session/year",
      "Priority booking",
      "VIP community access",
    ],
    buttonText: "Go Premium",
    highlighted: false,
  },
  {
    id: "yearly_premium",
    name: "Premium Yearly",
    price: 470,
    period: "/year",
    savings: "Save €94",
    badge: "Most Popular",
    description: "Ultimate package with all content and benefits",
    features: [
      "Everything in Premium Monthly",
      "Pay once, access for 12 months",
      "2 months free",
      "4 individual sessions/year",
      "Priority support & booking",
      "Exclusive premium workshops",
      "Lifetime resources access",
    ],
    buttonText: "Save with Yearly",
    highlighted: true,
  },
];

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
      "1hr personalized consultation",
      "1hr Reiki healing session",
      "Complete art therapy toolkit",
      "Pain management strategies",
      "Lifetime access",
    ],
    icon: Heart,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const createCheckoutSession = async (productType: string, hubSlug?: string) => {
    // Check if user is logged in
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
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            product_type: productType,
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
      <Navbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-warm">
          <div className="container px-4">
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
                Select the membership tier that fits your needs. All plans include access to our transformative 12-month program.
              </p>
            </div>
          </div>
        </section>

        {/* Main Membership Tiers */}
        <section className="py-12">
          <div className="container px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-12">
                Main Membership Plans
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MEMBERSHIP_TIERS.map((tier) => (
                  <Card
                    key={tier.id}
                    className={`relative border-2 transition-all ${
                      tier.highlighted
                        ? "border-primary shadow-elevated scale-105"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-gold text-white px-4 py-1">
                          {tier.badge}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pt-8">
                      <div className="mb-4">
                        {tier.name.includes("Premium") ? (
                          <Crown className="h-10 w-10 mx-auto text-primary" />
                        ) : (
                          <Sparkles className="h-10 w-10 mx-auto text-primary" />
                        )}
                      </div>
                      <CardTitle className="text-xl font-serif mb-2">
                        {tier.name}
                      </CardTitle>
                      <div className="mb-4">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-primary">
                            €{tier.price}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {tier.period}
                          </span>
                        </div>
                        {tier.savings && (
                          <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                            {tier.savings}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {tier.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check
                              size={16}
                              className="text-primary flex-shrink-0 mt-0.5"
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => createCheckoutSession(tier.id)}
                        disabled={loadingTier === tier.id}
                        className={`w-full ${
                          tier.highlighted
                            ? "bg-gradient-gold text-white"
                            : "bg-primary"
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
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                  Deep-dive programs focusing on specific challenges. Can be purchased separately or included with Premium membership.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {ADDITIONAL_HUBS.map((hub) => {
                  const IconComponent = hub.icon;
                  return (
                    <Card
                      key={hub.id}
                      className="border-2 border-muted hover:border-primary/50 transition-all"
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-serif">
                              {hub.name}
                            </CardTitle>
                            <div className="text-2xl font-bold text-primary mt-1">
                              €{hub.price}
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-sm">
                          {hub.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        <ul className="space-y-2">
                          {hub.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check
                                size={16}
                                className="text-primary flex-shrink-0 mt-0.5"
                              />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          onClick={() => createCheckoutSession("hub", hub.slug)}
                          disabled={loadingTier === `hub_${hub.slug}`}
                          variant="outline"
                          className="w-full border-primary text-primary hover:bg-primary hover:text-white"
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

                        <p className="text-xs text-center text-muted-foreground">
                          Included free with Premium membership
                        </p>
                      </CardContent>
                    </Card>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="border-muted">
                  <CardHeader>
                    <div className="p-3 bg-primary/10 rounded-full w-fit mb-3">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-serif">
                      Video Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      48 weekly videos covering EFT tapping, art therapy, and guided meditations throughout the 12-month journey.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-muted">
                  <CardHeader>
                    <div className="p-3 bg-primary/10 rounded-full w-fit mb-3">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-serif">
                      Workbooks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Downloadable worksheets, reflection exercises, and practical tools to support your transformation.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-muted">
                  <CardHeader>
                    <div className="p-3 bg-primary/10 rounded-full w-fit mb-3">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-serif">
                      Personal Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Premium members receive individual consultation sessions and priority support throughout their journey.
                    </p>
                  </CardContent>
                </Card>
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
              <p className="text-muted-foreground mb-6">
                Choose the plan that resonates with you. You can upgrade or change your membership at any time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => {
                    if (!user) {
                      navigate("/auth");
                    } else {
                      const element = document.querySelector('section');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  size="lg"
                  className="bg-gradient-gold text-white"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
                <Button
                  onClick={() => navigate("/about")}
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary"
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
