import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Cookie } from "lucide-react";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { useCms } from "@/hooks/useCms";

const Cookies = () => {
  const { t } = useCms();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Cookies Policy | Resilient Mind"
        description="Learn how Resilient Mind uses cookies and similar technologies on our website, and how you can manage your preferences."
        path="/cookies"
      />
      <Navbar />

      <main className="pt-20">
        <PageHero>
            <div id="cms-cookies-hero" className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Cookie size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  {t("cookies_hero_badge", "Cookies")}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-6">
                {t("cookies_hero_title", "Cookies Policy")}
              </h1>

              <p className="text-lg text-muted-foreground font-sans">
                {t("cookies_hero_updated", "Last updated: February 2026")}
              </p>
            </div>
        </PageHero>

        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto prose prose-lg">
              <div id="cms-cookies-intro">
                <p className="text-muted-foreground font-sans mb-6">
                  {t(
                    "cookies_intro_p1",
                    "This Cookies Policy explains how Resilient Mind (\"we,\" \"our,\" \"us\") uses cookies and similar technologies on our website. It also explains your options for managing or disabling cookies."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-8">
                  {t("cookies_intro_p2", "By using our website, you consent to our use of cookies as described in this policy.")}
                </p>
              </div>

              <div id="cms-cookies-s1">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("cookies_s1_title", "1. What Are Cookies?")}</h2>
                <p className="text-muted-foreground font-sans mb-6">
                  {t(
                    "cookies_s1_p1",
                    "A cookie is a small file that is downloaded to your computer or device when you visit a website. Cookies help websites recognize your device, store preferences, analyze usage, and provide personalized content or advertisements."
                  )}
                </p>
              </div>

              <div id="cms-cookies-s2">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("cookies_s2_title", "2. Types of Cookies We Use")}</h2>

                <div id="cms-cookies-s2a">
                  <h3 className="text-xl font-serif font-semibold mb-3">{t("cookies_s2a_title", "a) Analytical / Performance Cookies")}</h3>
                  <ul className="list-disc pl-6 text-muted-foreground font-sans mb-2 space-y-2">
                    <li>{t("cookies_s2a_li1", "These cookies help us measure how users interact with our website.")}</li>
                    <li>{t("cookies_s2a_li2", "Examples: Google Analytics cookies to track page visits, time on site, and navigation patterns.")}</li>
                  </ul>
                  <p className="text-muted-foreground font-sans mb-6">
                    <strong>{t("cookies_s2a_purpose_label", "Purpose:")}</strong> {t("cookies_s2a_purpose", "To improve website performance and enhance your experience.")}
                  </p>
                </div>

                <div id="cms-cookies-s2b">
                  <h3 className="text-xl font-serif font-semibold mb-3">{t("cookies_s2b_title", "b) Functional / Preference Cookies")}</h3>
                  <ul className="list-disc pl-6 text-muted-foreground font-sans mb-2 space-y-2">
                    <li>{t("cookies_s2b_li1", "Remember your preferences, such as language or settings in tools like video/audio players.")}</li>
                  </ul>
                  <p className="text-muted-foreground font-sans mb-6">
                    <strong>{t("cookies_s2b_purpose_label", "Purpose:")}</strong> {t("cookies_s2b_purpose", "To ensure the website works as you expect each time you visit.")}
                  </p>
                </div>

                <div id="cms-cookies-s2c">
                  <h3 className="text-xl font-serif font-semibold mb-3">{t("cookies_s2c_title", "c) Registration / Authentication Cookies")}</h3>
                  <ul className="list-disc pl-6 text-muted-foreground font-sans mb-2 space-y-2">
                    <li>{t("cookies_s2c_li1", "Used when you register or log in to a service on our website.")}</li>
                  </ul>
                  <p className="text-muted-foreground font-sans mb-6">
                    <strong>{t("cookies_s2c_purpose_label", "Purpose:")}</strong> {t("cookies_s2c_purpose", "To keep you logged in and identify authorized users for restricted areas.")}
                  </p>
                </div>

                <div id="cms-cookies-s2d">
                  <h3 className="text-xl font-serif font-semibold mb-3">{t("cookies_s2d_title", "d) Advertising / Marketing Cookies")}</h3>
                  <ul className="list-disc pl-6 text-muted-foreground font-sans mb-2 space-y-2">
                    <li>{t("cookies_s2d_li1", "Used to show personalized content or advertisements.")}</li>
                    <li>{t("cookies_s2d_li2", "May be set by us or by third-party advertising partners.")}</li>
                  </ul>
                  <p className="text-muted-foreground font-sans mb-6">
                    <strong>{t("cookies_s2d_purpose_label", "Purpose:")}</strong> {t("cookies_s2d_purpose", "To deliver relevant ads based on browsing behavior.")}
                  </p>
                </div>

                <div id="cms-cookies-s2e">
                  <h3 className="text-xl font-serif font-semibold mb-3">{t("cookies_s2e_title", "e) Geolocation Cookies")}</h3>
                  <ul className="list-disc pl-6 text-muted-foreground font-sans mb-2 space-y-2">
                    <li>{t("cookies_s2e_li1", "Identify the country or region of your visit to provide relevant content.")}</li>
                    <li>{t("cookies_s2e_li2", "Fully anonymous and only used for content targeting purposes.")}</li>
                  </ul>
                </div>
              </div>

              <div id="cms-cookies-s3">
                <h2 className="text-2xl font-serif font-semibold mb-4 mt-8">{t("cookies_s3_title", "3. Session vs Persistent Cookies")}</h2>
                <ul className="list-disc pl-6 text-muted-foreground font-sans mb-6 space-y-2">
                  <li><strong>{t("cookies_s3_li1_label", "Session cookies:")}</strong> {t("cookies_s3_li1", "Deleted when you close your browser.")}</li>
                  <li><strong>{t("cookies_s3_li2_label", "Persistent cookies:")}</strong> {t("cookies_s3_li2", "Stored until they expire or are manually deleted, e.g., to keep you logged in.")}</li>
                </ul>
              </div>

              <div id="cms-cookies-s4">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("cookies_s4_title", "4. First-Party vs Third-Party Cookies")}</h2>
                <ul className="list-disc pl-6 text-muted-foreground font-sans mb-6 space-y-2">
                  <li><strong>{t("cookies_s4_li1_label", "First-party cookies:")}</strong> {t("cookies_s4_li1", "Set directly by Resilient Mind to provide our services.")}</li>
                  <li><strong>{t("cookies_s4_li2_label", "Third-party cookies:")}</strong> {t("cookies_s4_li2", "Set by external services (e.g., Google Analytics, social media platforms) that may track your interactions with our website.")}</li>
                </ul>
              </div>

              <div id="cms-cookies-s5">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("cookies_s5_title", "5. Social Media Cookies")}</h2>
                <p className="text-muted-foreground font-sans mb-4">
                  {t(
                    "cookies_s5_p1",
                    "If you interact with our content on social media platforms (e.g., Facebook, Instagram, YouTube), these platforms may set cookies to measure engagement."
                  )}
                </p>
                <ul className="list-disc pl-6 text-muted-foreground font-sans mb-6 space-y-2">
                  <li>{t("cookies_s5_li1", "Their use is governed by the social platform's own privacy policy.")}</li>
                  <li>{t("cookies_s5_li2", "We do not control how these third-party cookies are used.")}</li>
                </ul>
              </div>

              <div id="cms-cookies-s6">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("cookies_s6_title", "6. Managing or Disabling Cookies")}</h2>
                <p className="text-muted-foreground font-sans mb-4">
                  {t("cookies_s6_intro", "You can manage, block, or delete cookies via your browser settings. Options are available for most browsers, such as:")}
                </p>
                <ul className="list-disc pl-6 text-muted-foreground font-sans mb-4 space-y-2">
                  <li><strong>{t("cookies_s6_chrome_label", "Chrome:")}</strong>{" "}
                    <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">support.google.com/chrome/answer/95647</a>
                  </li>
                  <li><strong>{t("cookies_s6_firefox_label", "Firefox:")}</strong>{" "}
                    <a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">support.mozilla.org</a>
                  </li>
                  <li><strong>{t("cookies_s6_safari_label", "Safari:")}</strong>{" "}
                    <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">support.apple.com</a>
                  </li>
                </ul>
                <p className="text-muted-foreground font-sans mb-6">
                  {t("cookies_s6_end", "You can choose to accept all cookies, reject all cookies, or be notified when a cookie is sent.")}
                </p>
              </div>

              <div id="cms-cookies-s7">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("cookies_s7_title", "7. Cookie Consent")}</h2>
                <p className="text-muted-foreground font-sans mb-6">
                  {t(
                    "cookies_s7_p1",
                    "When you first visit our website, you will see a cookie notice asking for your consent. Non-essential cookies (analytics, marketing) are only installed after you provide consent."
                  )}
                </p>
              </div>

              <div id="cms-cookies-s8">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("cookies_s8_title", "8. Updates to This Policy")}</h2>
                <p className="text-muted-foreground font-sans mb-6">
                  {t(
                    "cookies_s8_p1",
                    "We may update this Cookies Policy to comply with new legal requirements or to reflect changes in our services. Updates will be published on this page. We recommend checking this page periodically."
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

export default Cookies;
