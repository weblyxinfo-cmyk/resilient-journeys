import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import PricingCards, { PricingTrustSignals } from "@/components/PricingCards";
import { Crown } from "lucide-react";
import { useCms } from "@/hooks/useCms";
import { useMembershipTiers } from "@/hooks/useMembershipTiers";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useCms();
  // Same source as PricingCards, so the JSON-LD price can never disagree
  // with the card the visitor sees — see docs/cms-review.md §B2.
  const { getTier } = useMembershipTiers();
  const basicMonthlyPrice = getTier('basic_monthly')?.price ?? 37;
  const premiumMonthlyPrice = getTier('premium_monthly')?.price ?? 47;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${t("pricing_seo_title_prefix", "Pricing — Membership Plans from €")}${basicMonthlyPrice}${t("pricing_seo_title_suffix", " | Resilient Mind")}`}
        description={`${t("pricing_seo_description_prefix", "Choose from Basic or Premium membership plans. Pay as you go from €")}${basicMonthlyPrice}${t("pricing_seo_description_middle", " or yearly from €")}${getTier('basic_yearly')?.price ?? 370}${t("pricing_seo_description_suffix", ". One-time payments, no auto-renewal. Includes video lessons, workbooks and more.")}`}
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
              price: String(basicMonthlyPrice),
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
              url: "https://resilientmind.io/pricing",
            },
            {
              "@type": "Offer",
              name: "Premium Monthly",
              price: String(premiumMonthlyPrice),
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
              url: "https://resilientmind.io/pricing",
            },
          ],
        }}
      />
      <Navbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <PageHero>
          <div id="cms-pricing-hero" className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Crown size={16} className="text-primary" />
              <span className="text-sm font-sans font-medium text-primary">
                {t("pricing_hero_badge", "Membership Pricing")}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
              {t("pricing_hero_title", "From Navigating Life Abroad to Truly Thriving")}
            </h1>

            <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto leading-relaxed">
              {t(
                "pricing_hero_subtitle",
                "A 12-month guided membership program that transforms the loneliness, uncertainty, and cultural stress of expat life into your greatest strengths."
              )}
            </p>
          </div>
        </PageHero>

        {/* Program description */}
        <section id="cms-pricing-intro" className="py-8">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-muted-foreground font-sans leading-relaxed">
                {t("pricing_intro_text", "Ongoing emotional support and nervous system regulation for expat women.")}
              </p>
            </div>
          </div>
        </section>

        {/* Main Membership Tiers */}
        <section id="cms-pricing-tiers" className="py-12">
          <div className="container px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-4">
                {t("pricing_tiers_title", "Resilient Mind Membership")}
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12 max-w-xl mx-auto">
                {t(
                  "pricing_tiers_subtitle",
                  "An online membership with guided practical tools and video support. Pay as you go — no auto-renewal."
                )}
              </p>

              <PricingCards cancelUrl="/pricing" />
              <PricingTrustSignals />
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section id="cms-pricing-included" className="py-12">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-4">
                {t("pricing_included_title", "What's Included in the Membership")}
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12">
                {t("pricing_included_subtitle", "Every month you receive:")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    emoji: "🎧",
                    title: t("pricing_included_1_title", "Guided EFT Sessions"),
                    desc: t("pricing_included_1_desc", "Stress, anxiety, emotional regulation, self-safety"),
                  },
                  {
                    emoji: "🧠",
                    title: t("pricing_included_2_title", "One Monthly Theme"),
                    desc: t(
                      "pricing_included_2_desc",
                      "e.g. stress abroad, loneliness, health challenges, boundaries, stability"
                    ),
                  },
                  {
                    emoji: "🫶",
                    title: t("pricing_included_3_title", "Community Support (Skool)"),
                    desc: t("pricing_included_3_desc", "For Premium Membership"),
                  },
                  {
                    emoji: "📄",
                    title: t("pricing_included_4_title", "Practical Tools"),
                    desc: t("pricing_included_4_desc", "Worksheets, journaling prompts, integration practices"),
                  },
                  {
                    emoji: "🤍",
                    title: t("pricing_included_5_title", "Safe Members-Only Space"),
                    desc: t("pricing_included_5_desc", "Connection without pressure, sharing is always optional"),
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group bg-card/80 backdrop-blur-sm rounded-3xl border border-border/60 p-1 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="rounded-[1.25rem] bg-gradient-to-b from-background/60 to-background/30 p-6">
                      <div className="text-2xl mb-3">{item.emoji}</div>
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
        <section id="cms-pricing-cta" className="py-12 bg-gradient-warm">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                {t("pricing_cta_title", "Ready to Begin Your Journey?")}
              </h2>
              <p className="text-muted-foreground mb-6 font-sans">
                {t(
                  "pricing_cta_text",
                  "Choose the plan that resonates with you. You can upgrade or change your membership at any time."
                )}
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
                  {t("pricing_cta_button_start", "Get Started")}
                </Button>
                <Button
                  onClick={() => navigate("/about")}
                  size="lg"
                  variant="outline"
                  className="border-primary/30 text-primary rounded-full"
                >
                  {t("pricing_cta_button_learn_more", "Learn More")}
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
