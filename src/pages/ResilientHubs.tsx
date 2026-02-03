import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgramOverview from "@/components/ProgramOverview";
import { Check, Sparkles, Download, ArrowRight, Heart, Brain, Users, Globe, Coins, Fingerprint, Crown, Star, Zap, Video, FileText, Headphones, Shield, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";

const whatYouWillGain = [
  {
    icon: Heart,
    title: "Cultivate Inner Stability",
    description: "Independent of your external circumstances"
  },
  {
    icon: Brain,
    title: "Manage Emotional Stress",
    description: "Using EFT, Byron Katie, and mindfulness techniques"
  },
  {
    icon: Globe,
    title: "Navigate Cultural Differences",
    description: "With confidence and ease"
  },
  {
    icon: Users,
    title: "Strengthen Relationships",
    description: "With loved ones despite distance"
  },
  {
    icon: Coins,
    title: "Build Financial and Practical Resilience",
    description: "In a new environment"
  },
  {
    icon: Fingerprint,
    title: "Transform Your Identity",
    description: "Draw strength from both your home and new country"
  }
];

const programIncludes = [
  "48 weekly videos (10-15 min each)",
  "48 workbooks with exercises",
  "Guided meditations",
  "EFT / Art Therapy / Journaling practices",
  "Monthly integration rituals"
];

const whyDifferent = [
  {
    title: "Created by an expatriate for expatriates",
    description: "Built on 13 years of real-world experience living abroad"
  },
  {
    title: "Holistic integration",
    description: "Mind, body, and energy techniques working together for complete transformation"
  },
  {
    title: "Expressive arts approach",
    description: "Process complex emotions through creative expression when words aren't enough"
  },
  {
    title: "Personal experience with health challenges",
    description: "Optional specialized support for managing chronic conditions abroad"
  }
];

const MEMBERSHIP_TIERS = [
  {
    id: "monthly_basic",
    name: "Basic Monthly",
    price: 27,
    period: "/month",
    savings: null,
    badge: null,
    icon: Sparkles,
    features: [
      "Monthly foundational module (Module A)",
      "Downloadable worksheets for Module A",
      "Access to meditation library",
      "Monthly content updates",
    ],
    buttonText: "Start Basic Monthly",
    highlighted: false,
  },
  {
    id: "yearly_basic",
    name: "Basic Yearly",
    price: 270,
    period: "/year",
    savings: "Save €54",
    badge: "Best Value",
    icon: Sparkles,
    features: [
      "All 4 transformational programs (12 months)",
      "Complete access to all modules (A, B, C)",
      "All downloadable worksheets & exercises",
      "Full meditation & visualization library",
    ],
    buttonText: "Save with Basic Yearly",
    highlighted: true,
  },
  {
    id: "monthly_premium",
    name: "Premium Monthly",
    price: 47,
    period: "/month",
    savings: null,
    badge: null,
    icon: Crown,
    features: [
      "Modules A & B of current month",
      "All Basic Monthly benefits",
      "Access to additional Resilient Hub (Module A)",
      "Priority support",
    ],
    buttonText: "Go Premium Monthly",
    highlighted: false,
  },
  {
    id: "yearly_premium",
    name: "Premium Yearly",
    price: 470,
    period: "/year",
    savings: "Save €94",
    badge: "Most Popular",
    icon: Crown,
    features: [
      "All 4 programs with all modules (A, B, C)",
      "4 hours personal consultations (€348 value)",
      "Art expressive therapy materials kit",
      "Additional Resilient Hubs access",
      "All worksheets, meditations & exercises",
    ],
    buttonText: "Save with Premium Yearly",
    highlighted: true,
  },
];

const ResilientHubs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

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
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            product_type: productType,
            user_id: userData.user.id,
            success_url: `${window.location.origin}/pricing/success`,
            cancel_url: `${window.location.origin}/resilient-hubs`,
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
    <div className="min-h-screen bg-background">
      <SEO
        title="12-Month Membership Program to Inner Strength | Resilient Mind"
        description="Join a 12-month guided program with video lessons, workbooks and community support designed for expatriates seeking inner strength."
        path="/resilient-hubs"
      />
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <PageHero>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Sparkles size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  Building RESILIENT MIND
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-semibold mb-6">
                <span className="text-gradient-gold">12 Months Program</span>
                <br />
                to Inner Strength
              </h1>

              <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-8 max-w-3xl mx-auto">
                Expat life can be rewarding, but it also comes with challenges—loneliness, cultural differences, uncertainty, and navigating health challenges while away from your familiar support network. I've been there. Using my 13 years of experience living abroad and my expertise in personal development, expressive arts, and holistic therapies, I created a program that turns these challenges into opportunities for growth and inner strength.
              </p>
            </div>
        </PageHero>

        {/* What You'll Gain */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4 text-center">
                What You'll Gain
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12">
                By the end of this 12-month journey, you will:
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {whatYouWillGain.map((item, index) => (
                  <div key={index} className="flex gap-4 p-6 bg-card rounded-2xl border border-border">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground font-sans">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How the Program Works */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-6">
                How the Program Works
              </h2>
              <p className="text-lg text-muted-foreground font-sans mb-12 max-w-2xl mx-auto">
                Each month focuses on a specific aspect of resilience. You'll engage with creative exercises, therapeutic techniques, and reflective practices to build skills that last a lifetime.
              </p>

              <div className="bg-gradient-warm rounded-2xl p-8 md:p-12">
                <h3 className="text-xl md:text-2xl font-serif font-semibold mb-6">
                  Program Includes
                </h3>
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {programIncludes.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-left">
                      <Check size={20} className="text-primary flex-shrink-0" />
                      <span className="font-sans text-foreground/90">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Program Content / Video Lessons */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4 text-center">
                Explore the <span className="text-gradient-gold">Program Content</span>
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-8">
                Preview the monthly video lessons, workbooks, and exercises included in your membership.
              </p>
              <ProgramOverview />
            </div>
          </div>
        </section>

        {/* Why Different */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-12 text-center">
                Why <span className="text-gradient-gold">Resilient Hubs</span> are Different
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {whyDifferent.map((item, index) => (
                  <div key={index} className="p-6 bg-card rounded-2xl border border-border">
                    <h3 className="text-lg font-serif font-semibold mb-3 text-primary">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground font-sans">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 md:py-24 bg-gradient-warm" id="pricing">
          <div className="container px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <Crown size={16} className="text-primary" />
                  <span className="text-sm font-sans font-medium text-primary">Choose Your Path</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  Invest in Your <span className="text-gradient-gold">Transformation</span>
                </h2>
                <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                  Start building your inner strength today. Every plan includes access to our proven 12-month program — choose the level of support that fits your needs.
                </p>
              </div>

              {/* 4 Pricing Cards — same as /pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
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
                          <span className={`text-5xl font-extrabold ${tier.highlighted ? 'text-transparent bg-clip-text bg-gradient-gold' : 'text-primary'}`}>
                            €{tier.price}
                          </span>
                          <span className="text-muted-foreground text-base font-medium">
                            {tier.period}
                          </span>
                        </div>
                        {tier.savings && (
                          <Badge className="mt-3 bg-green-100 text-green-700 border-green-300 text-sm px-3 py-1">
                            {tier.savings}
                          </Badge>
                        )}
                      </div>
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

              {/* Trust signals */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-primary" />
                  <span>Secure payment via Stripe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-primary" />
                  <span>Cancel anytime — no lock-in</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart size={18} className="text-primary" />
                  <span>Instant access after payment</span>
                </div>
              </div>

              {/* Free guide nudge */}
              <div className="text-center mt-8">
                <p className="text-sm text-muted-foreground font-sans">
                  💛 Not sure yet? <Link to="/free-guide" className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium">Download our free guide</Link> and experience the program first.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                Begin Your <span className="text-gradient-gold">Alchemical Journey</span>
              </h2>

              <p className="text-lg text-muted-foreground font-sans mb-6 max-w-2xl mx-auto">
                Your transformation doesn't wait for perfect circumstances—it begins the moment you decide to transform uncertainty into your greatest strength.
              </p>

              <p className="text-xl font-serif font-medium text-foreground/90 mb-8">
                With Resilient Mind, Your Inner Strength Goes Wherever Life Takes You
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all"
                >
                  Choose Your Membership – Start Today
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/free-guide"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card border border-border font-sans font-medium rounded-full hover:bg-secondary transition-all"
                >
                  <Download size={18} />
                  Download 3 Resilience Techniques
                </Link>
              </div>

              {/* Testimonial */}
              <div className="bg-card rounded-2xl p-8 border border-border max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center">
                    <Heart size={28} className="text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <div className="font-serif font-semibold text-lg">Silvie</div>
                    <div className="text-sm text-muted-foreground font-sans">Founder, Resilient Mind</div>
                  </div>
                </div>
                <p className="text-muted-foreground font-sans italic text-left">
                  "The moment I stopped fighting against my expatriate challenges and started transforming them instead, everything changed. You can create your 'inner home' wherever you go."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ResilientHubs;
