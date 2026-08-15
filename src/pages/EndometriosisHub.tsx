import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { useCms } from "@/hooks/useCms";

const EndometriosisHub = () => {
  const { t } = useCms();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("endometriosis_seo_title", "Endometriosis Management Hub for Expats Living Abroad | Resilient Mind")}
        description={t("endometriosis_seo_description", "Support module for women managing endometriosis and chronic pain while living abroad. Creative techniques for daily resilience.")}
        path="/endometriosis-hub"
      />
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <PageHero>
            <div id="cms-endo-hero" className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Heart size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  {t("endo_hero_badge", "Additional Resilient Hub")}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-semibold mb-6">
                {t("endo_hero_title_prefix", "Navigating Expat Life with")}{" "}
                <span className="text-gradient-gold">{t("endo_hero_title_highlight", "Endometriosis & Chronic Pain")}</span>
              </h1>

              <p className="text-lg text-muted-foreground font-sans mb-4 max-w-3xl mx-auto">
                {t("endo_hero_lead", "This optional module is designed for women living abroad while managing endometriosis or chronic pain. It is not a medical or therapeutic treatment.")}
              </p>

              <p className="text-base text-foreground/90 font-sans mb-8 max-w-3xl mx-auto">
                {t("endo_hero_body", "The focus is on nervous system regulation, emotional resilience, self-trust, and identity integrity while living with pain.")}
              </p>

              <div className="inline-flex items-center gap-4 px-6 py-3 bg-card rounded-full border border-border">
                <span className="text-3xl font-serif font-bold text-gold">€147</span>
                <span className="text-sm text-muted-foreground">{t("endo_hero_price_label", "One-time fee")}</span>
              </div>
            </div>
        </PageHero>

        {/* Focus Areas */}
        <section id="cms-endo-focus" className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4 text-center">
                {t("endo_focus_title", "What's Included")}
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12 max-w-2xl mx-auto">
                {t("endo_focus_subtitle", "1-hour individual session, 1-hour Reiki treatment, and Art Therapy tool kit for chronic pain")}
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="text-sm font-sans font-semibold text-gold mb-3">{t("endo_focus_month1_label", "1st Month")}</div>
                  <h3 className="text-xl font-serif font-semibold mb-3">{t("endo_focus_month1_title", "The Invisible Load")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t("endo_focus_month1_desc", "When pain is unseen but ever-present.")}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("endo_focus_month1_item_1", "Identity erosion through chronic pain")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("endo_focus_month1_item_2", "Shame, minimization, and self-doubt")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("endo_focus_month1_item_3", "Grief for the body you used to have")}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="text-sm font-sans font-semibold text-gold mb-3">{t("endo_focus_month2_label", "2nd Month")}</div>
                  <h3 className="text-xl font-serif font-semibold mb-3">{t("endo_focus_month2_title", "Safety Over Strength")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t("endo_focus_month2_desc", "Redefining resilience.")}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("endo_focus_month2_item_1", "Pain, stress, and expatriation")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("endo_focus_month2_item_2", "Nervous system prioritization")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("endo_focus_month2_item_3", "Pacing, boundaries, and self-respect")}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="text-sm font-sans font-semibold text-gold mb-3">{t("endo_focus_month3_label", "3rd Month")}</div>
                  <h3 className="text-xl font-serif font-semibold mb-3">{t("endo_focus_month3_title", "Living Fully Without Waiting")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t("endo_focus_month3_desc", "Life now, not later.")}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("endo_focus_month3_item_1", "Releasing the 'I will live when...' mindset")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("endo_focus_month3_item_2", "Joy without denial")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("endo_focus_month3_item_3", "Identity beyond illness")}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* What You Get */}
              <div id="cms-endo-whatget" className="bg-gradient-warm rounded-2xl p-8 border border-border">
                <h3 className="text-xl font-serif font-semibold mb-6 text-center">{t("endo_whatget_title", "What You Get")}</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart size={24} className="text-primary" />
                    </div>
                    <h4 className="font-serif font-semibold mb-2">{t("endo_whatget_1_title", "1 hour individual session")}</h4>
                    <p className="text-sm text-muted-foreground font-sans">
                      {t("endo_whatget_1_desc", "Personalized online consultation")}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart size={24} className="text-primary" />
                    </div>
                    <h4 className="font-serif font-semibold mb-2">{t("endo_whatget_2_title", "1 hour Reiki treatment")}</h4>
                    <p className="text-sm text-muted-foreground font-sans">
                      {t("endo_whatget_2_desc", "Energy healing session")}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart size={24} className="text-primary" />
                    </div>
                    <h4 className="font-serif font-semibold mb-2">{t("endo_whatget_3_title", "Art Therapy tool kit")}</h4>
                    <p className="text-sm text-muted-foreground font-sans">
                      {t("endo_whatget_3_desc", "For managing chronic pain")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cms-endo-cta" className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                {t("endo_cta_title", "Ready to Begin?")}
              </h2>
              <p className="text-muted-foreground font-sans mb-8">
                {t("endo_cta_body", "Access all three modules plus personal consultation for a one-time fee of €147.")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/checkout?product=hub&hub=endometriosis"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all"
                >
                  {t("endo_cta_purchase", "Purchase Access")}
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/booking"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-background border border-border font-sans font-medium rounded-full hover:bg-secondary transition-all"
                >
                  {t("endo_cta_consult", "Book Consultation First")}
                </Link>
              </div>
              <p className="text-sm text-muted-foreground font-sans mt-6">
                {t("endo_cta_contact_prefix", "Questions? Contact me at")}{" "}
                <a href="mailto:contact@resilientmind.io" className="text-primary hover:underline">
                  contact@resilientmind.io
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EndometriosisHub;
