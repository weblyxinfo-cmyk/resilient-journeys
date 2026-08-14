import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield } from "lucide-react";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { useCms } from "@/hooks/useCms";

const Privacy = () => {
  const { t } = useCms();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Personal Data Protection (GDPR) | Resilient Mind"
        description="Statement on the Processing of Personal Data in accordance with GDPR. How Resilient Mind handles your personal data and your rights."
        path="/privacy"
      />
      <Navbar />

      <main className="pt-20">
        <PageHero>
            <div id="cms-privacy-hero" className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Shield size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  {t("privacy_hero_badge", "Privacy")}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-6">
                {t("privacy_hero_title", "Personal Data Protection (GDPR)")}
              </h1>

              <p className="text-lg text-muted-foreground font-sans">
                {t("privacy_hero_updated", "Last updated: February 2026")}
              </p>
            </div>
        </PageHero>

        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto prose prose-lg">
              <div id="cms-privacy-intro">
                <p className="text-muted-foreground font-sans mb-8 text-center italic">
                  {t(
                    "privacy_intro_p1",
                    "Statement on the Processing of Personal Data in accordance with Regulation (EU) 2016/679 (GDPR)"
                  )}
                </p>

                <p className="text-muted-foreground font-sans mb-8">
                  {t(
                    "privacy_intro_p2",
                    "If you are a customer, newsletter subscriber, or visitor of this website, you entrust us with your personal data. We are responsible for protecting it and ensuring its security. Please read this statement to understand how we handle your personal data and your rights under GDPR."
                  )}
                </p>
              </div>

              <div id="cms-privacy-s1">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("privacy_s1_title", "1. Data Controller")}</h2>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("privacy_s1_p1", "The data controller for personal data on the website resilientmind.io is:")}
                </p>
                <p className="text-muted-foreground font-sans mb-6 pl-6">
                  <strong>{t("privacy_s1_company_name", "Resilient Mind")}</strong><br />
                  {t("privacy_s1_company_owner", "Owner: Silvie Bogdanova")}<br />
                  {t("privacy_s1_company_country", "Country: Spain")}
                </p>
              </div>

              <div id="cms-privacy-s2">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("privacy_s2_title", "2. Contact Details")}</h2>
                <p className="text-muted-foreground font-sans mb-6">
                  {t("privacy_s2_p1", "If you wish to contact the controller regarding personal data processing, you may email us at:")}{" "}
                  <a href="mailto:contact@resilientmind.io" className="text-gold hover:underline">contact@resilientmind.io</a>
                </p>
              </div>

              <div id="cms-privacy-s3">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("privacy_s3_title", "3. Controller's Declaration")}</h2>
                <p className="text-muted-foreground font-sans mb-4">
                  {t("privacy_s3_intro", "As the controller of your personal data, we declare that:")}
                </p>
                <ul className="list-disc pl-6 text-muted-foreground font-sans mb-6 space-y-2">
                  <li>{t("privacy_s3_li1", "We process personal data only on a valid legal basis: performance of a contract, legitimate interest, legal obligation, or your consent.")}</li>
                  <li>{t("privacy_s3_li2", "We fulfill our information obligations in accordance with Article 13 of GDPR.")}</li>
                  <li>{t("privacy_s3_li3", "We enable and support the exercise of your rights under GDPR.")}</li>
                </ul>
              </div>

              <div id="cms-privacy-s4">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("privacy_s4_title", "4. Scope of Personal Data Processed")}</h2>
                <p className="text-muted-foreground font-sans mb-4">
                  {t(
                    "privacy_s4_intro",
                    "We process personal data only for the purposes, duration, and extent necessary to provide our services, which may include:"
                  )}
                </p>
                <ul className="list-disc pl-6 text-muted-foreground font-sans mb-6 space-y-2">
                  <li>{t("privacy_s4_li1", "First and last name")}</li>
                  <li>{t("privacy_s4_li2", "Email address")}</li>
                  <li>{t("privacy_s4_li3", "Phone number")}</li>
                  <li>{t("privacy_s4_li4", "Postal address")}</li>
                  <li>{t("privacy_s4_li5", "Billing details (company name, VAT number, bank details)")}</li>
                  <li>{t("privacy_s4_li6", "Other information required depending on the service provided")}</li>
                </ul>
              </div>

              <div id="cms-privacy-s5">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("privacy_s5_title", "5. Photos and Audio-Visual Recordings")}</h2>
                <p className="text-muted-foreground font-sans mb-6">
                  {t(
                    "privacy_s5_p1",
                    "During certain events, courses, or webinars, photographs or audio-visual recordings may be made. These materials may be used for promotional or educational purposes. Participants' names are never published without explicit consent."
                  )}
                </p>
              </div>

              <div id="cms-privacy-s6">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("privacy_s6_title", "6. Cookies")}</h2>
                <p className="text-muted-foreground font-sans mb-4">
                  {t("privacy_s6_intro", "When browsing our website, we may record your IP address, time spent on the site, and referring page.")}
                </p>
                <ul className="list-disc pl-6 text-muted-foreground font-sans mb-4 space-y-2">
                  <li>{t("privacy_s6_li1", "Analytical cookies are processed based on our legitimate interest to improve our services.")}</li>
                  <li>{t("privacy_s6_li2", "Marketing cookies are processed only with your consent.")}</li>
                </ul>
                <p className="text-muted-foreground font-sans mb-6">
                  {t("privacy_s6_end", "You can manage or disable cookies through your browser settings.")}
                </p>
              </div>

              <div id="cms-privacy-s7">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("privacy_s7_title", "7. Data Security")}</h2>
                <p className="text-muted-foreground font-sans mb-6">
                  {t(
                    "privacy_s7_p1",
                    "We use modern technical and organizational measures to protect personal data against misuse, damage, or loss. Our security measures are designed to match current technological standards."
                  )}
                </p>
              </div>

              <div id="cms-privacy-s8">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("privacy_s8_title", "8. Transfer of Personal Data to Third Parties")}</h2>
                <p className="text-muted-foreground font-sans mb-4">
                  {t("privacy_s8_intro", "For certain processing operations, we rely on trusted processors who comply with GDPR, including:")}
                </p>
                <ul className="list-disc pl-6 text-muted-foreground font-sans mb-4 space-y-2">
                  <li>{t("privacy_s8_li1", "Stripe (payments)")}</li>
                  <li>{t("privacy_s8_li2", "Email marketing platforms")}</li>
                  <li>{t("privacy_s8_li3", "Website analytics providers")}</li>
                </ul>
                <p className="text-muted-foreground font-sans mb-6">
                  {t("privacy_s8_end", "Personal data may also be disclosed if required by law.")}
                </p>
              </div>

              <div id="cms-privacy-s9">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("privacy_s9_title", "9. Your Rights")}</h2>
                <p className="text-muted-foreground font-sans mb-4">
                  {t("privacy_s9_intro", "Under GDPR, you have the following rights:")}
                </p>
                <ul className="list-disc pl-6 text-muted-foreground font-sans mb-4 space-y-2">
                  <li>{t("privacy_s9_li1", "Access your personal data")}</li>
                  <li>{t("privacy_s9_li2", "Rectify inaccurate data")}</li>
                  <li>{t("privacy_s9_li3", "Request erasure (\"right to be forgotten\")")}</li>
                  <li>{t("privacy_s9_li4", "Restrict processing")}</li>
                  <li>{t("privacy_s9_li5", "Data portability")}</li>
                  <li>{t("privacy_s9_li6", "Object to processing")}</li>
                  <li>{t("privacy_s9_li7", "Withdraw consent at any time")}</li>
                </ul>
                <p className="text-muted-foreground font-sans mb-6">
                  {t("privacy_s9_end", "To exercise your rights, contact us at:")}{" "}
                  <a href="mailto:contact@resilientmind.io" className="text-gold hover:underline">contact@resilientmind.io</a>
                </p>
              </div>

              <div id="cms-privacy-s10">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("privacy_s10_title", "10. Confidentiality")}</h2>
                <p className="text-muted-foreground font-sans mb-6">
                  {t(
                    "privacy_s10_p1",
                    "We are bound by confidentiality regarding personal data and our security measures. This obligation continues even after the end of any contractual relationship. Personal data will not be shared with third parties without your consent, unless required by law."
                  )}
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

export default Privacy;
