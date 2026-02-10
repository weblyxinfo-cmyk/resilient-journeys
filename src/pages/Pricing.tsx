import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import PricingCards, { PricingTrustSignals } from "@/components/PricingCards";
import {
  isEarlyBird,
  formatEarlyBirdEnd,
} from "@/lib/pricing";
import {
  Crown,
  Video,
  FileText,
  User,
} from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const earlyBird = isEarlyBird();

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
              url: "https://resilientmind.io/pricing",
            },
            {
              "@type": "Offer",
              name: "Premium Monthly",
              price: "47",
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
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Crown size={16} className="text-primary" />
              <span className="text-sm font-sans font-medium text-primary">
                Membership Pricing
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
              From Navigating Life Abroad to Truly Thriving
            </h1>

            <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto leading-relaxed">
              A self-paced journey back to emotional balance, clarity, and inner safety — wherever you are in the world.
            </p>
          </div>
        </PageHero>

        {/* Program description */}
        <section className="py-8">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="space-y-3 text-muted-foreground font-sans leading-relaxed">
                <p>This is not a program you need to "keep up with." It's a space you return to — at your own rhythm.</p>
                <p>There are no deadlines, no pressure, and no expectation to be "ready." The program stays open until you finish.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Early-bird banner */}
        {earlyBird && (
          <section className="py-4">
            <div className="container px-4">
              <div className="max-w-3xl mx-auto">
                <div className="bg-gradient-gold text-primary-foreground rounded-xl px-6 py-4 text-center">
                  <p className="font-sans font-semibold text-lg">
                    Save €10/month! Early-bird pricing ends on {formatEarlyBirdEnd()}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Membership Tiers */}
        <section className="py-12">
          <div className="container px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-4">
                Resilient Mind Membership
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12 max-w-xl mx-auto">
                This program adapts to you — not the other way around. You move at your own pace.
              </p>

              <PricingCards cancelUrl="/pricing" />
              <PricingTrustSignals />
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
