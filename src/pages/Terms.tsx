import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { useCms } from "@/hooks/useCms";

const Terms = () => {
  const { t } = useCms();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("terms_seo_title", "General Terms and Conditions | Resilient Mind")}
        description={t("terms_seo_description", "General Terms and Conditions for the sale of digital products by Resilient Mind. Rights, obligations, payments, refunds and data protection.")}
        path="/terms"
      />
      <Navbar />

      <main className="pt-20">
        <PageHero>
            <div id="cms-terms-hero" className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <FileText size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  {t("terms_hero_badge", "Legal")}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-6">
                {t("terms_hero_title", "General Terms and Conditions")}
              </h1>

              <p className="text-lg text-muted-foreground font-sans">
                {t("terms_hero_updated", "Last updated: February 2026")}
              </p>
            </div>
        </PageHero>

        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto prose prose-lg">
              <p id="cms-terms-intro" className="text-muted-foreground font-sans mb-8 text-center italic">
                {t("terms_intro_subtitle", "for the Sale of Digital Products — Resilient Mind")}
              </p>

              <div id="cms-terms-s1">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("terms_s1_title", "1. General Provisions")}</h2>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s1_p1",
                    "1.1 These General Terms and Conditions (\"Terms\") apply to the sale of digital products (\"Products\") by the Seller:"
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-2 pl-6">
                  <strong>{t("terms_s1_company_name", "Resilient Mind")}</strong><br />
                  {t("terms_s1_company_owner", "Owner: Silvie Bogdanova")}<br />
                  {t("terms_s1_company_website", "Website: www.resilientmind.io")}<br />
                  {t("terms_s1_company_country", "Country: Spain")}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s1_p2",
                    "1.2 These Terms define the rights and obligations of the Seller and the Buyer (also referred to as \"Customer\" or \"Participant\")."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s1_p3", "1.3 These Terms form an integral part of the purchase contract.")}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s1_p4",
                    "1.4 If the contracting party is a consumer, relationships not governed by these Terms are subject to applicable consumer protection and civil law regulations."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-6">
                  {t("terms_s1_p5", "1.5 These Terms are published on the Seller's website: www.resilientmind.io")}
                </p>
              </div>

              <div id="cms-terms-s2">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("terms_s2_title", "2. Order and Conclusion of Contract")}</h2>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s2_p1",
                    "2.1 The Product description, main features, and price (including applicable taxes) are stated on the Seller's website. The offer remains valid while displayed on the website."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s2_p2",
                    "2.2 The order form contains Customer information, selected Product, price (including taxes and fees), payment method, and delivery method. Costs incurred when using remote communication means are borne by the Customer."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s2_p3",
                    "2.3 The contract arises when the Customer submits the order by clicking the \"Submit\" button. By submitting the order, the Customer confirms acceptance of these Terms. The Seller does not accept offers with amendments or deviations."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s2_p4",
                    "2.4 The Customer may review and correct entered data before submitting the order. Submitted data is considered accurate."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s2_p5", "2.5 The Customer agrees to use remote communication means for concluding the contract.")}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s2_p6",
                    "2.6 The contract is concluded in English and stored electronically by the Seller for three (3) years."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s2_p7",
                    "2.7 The Seller undertakes to deliver the ordered Product, and the Customer undertakes to pay the purchase price."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-6">
                  {t(
                    "terms_s2_p8",
                    "2.8 The Customer acknowledges that proper use of digital Products requires up-to-date software and internet browsers."
                  )}
                </p>
              </div>

              <div id="cms-terms-s3">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("terms_s3_title", "3. Price and Payment Terms")}</h2>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s3_p1", "3.1 The Product price is listed on the Seller's website and in the order form.")}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s3_p2",
                    "3.2 The Seller issues an invoice as proof of purchase. The Seller is not a VAT payer unless stated otherwise."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s3_p3", "3.3 Payment is cashless according to the order and invoice.")}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s3_p4", "3.4 Payments may be processed via secure third-party gateways, such as Stripe.")}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s3_p5", "3.5 Available payment methods are listed in the order form.")}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s3_p6", "3.6 Payment is made as a one-time transaction unless otherwise stated.")}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s3_p7", "3.7 The Customer must provide correct payment identification details.")}
                </p>
                <p className="text-muted-foreground font-sans mb-6">
                  {t("terms_s3_p8", "3.8 The purchase price is due within five (5) days of invoice issuance.")}
                </p>
              </div>

              <div id="cms-terms-s4">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("terms_s4_title", "4. Delivery Terms")}</h2>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s4_p1",
                    "4.1 Delivery of digital Products consists of sending access credentials or a URL link to the Customer's email address."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-6">
                  {t("terms_s4_p2", "4.2 Access is granted after full payment, no later than three (3) days unless stated otherwise.")}
                </p>
              </div>

              <div id="cms-terms-s5">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("terms_s5_title", "5. Copyright and Access Security")}</h2>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s5_p1",
                    "5.1 Access credentials are for personal use only. The Customer must keep login details confidential."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-6">
                  {t("terms_s5_p2", "5.2 All Products and content are protected by copyright law. Unauthorized distribution is prohibited.")}
                </p>
              </div>

              <div id="cms-terms-s6">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("terms_s6_title", "6. Withdrawal from Contract")}</h2>
                <p className="text-muted-foreground font-sans mb-2">
                  <strong>{t("terms_s6_p1_label", "6.1 Consumer withdrawal")}</strong><br />
                  {t(
                    "terms_s6_p1",
                    "Consumers may withdraw from the contract within fourteen (14) days of delivery without giving reasons."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  <strong>{t("terms_s6_p2_label", "6.2 Withdrawal procedure")}</strong><br />
                  {t("terms_s6_p2_pre", "Notice of withdrawal must be sent by email to")}{" "}
                  <a href="mailto:contact@resilientmind.io" className="text-gold hover:underline">contact@resilientmind.io</a>.
                  {" "}{t("terms_s6_p2_post", "Refunds are processed within 14 days.")}
                </p>
                <p className="text-muted-foreground font-sans mb-6">
                  <strong>{t("terms_s6_p3_label", "6.3 Seller withdrawal")}</strong><br />
                  {t(
                    "terms_s6_p3",
                    "The Seller may withdraw from the contract if the Customer materially breaches obligations, including non-payment or copyright infringement."
                  )}
                </p>
              </div>

              <div id="cms-terms-s7">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("terms_s7_title", "7. Defective Performance")}</h2>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s7_p1", "7.1 Rights arising from defective performance are governed by applicable law.")}
                </p>
                <p className="text-muted-foreground font-sans mb-6">
                  {t(
                    "terms_s7_p2",
                    "7.2 The Seller is not liable for issues caused by insufficient technical conditions or improper use."
                  )}
                </p>
              </div>

              <div id="cms-terms-s8">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("terms_s8_title", "8. Money-Back Guarantee")}</h2>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s8_p1",
                    "8.1 Selected Products may include a satisfaction guarantee under conditions stated on the Product page."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s8_p2_pre", "8.2 Withdrawal requests must be sent to")}{" "}
                  <a href="mailto:contact@resilientmind.io" className="text-gold hover:underline">contact@resilientmind.io</a>{" "}
                  {t("terms_s8_p2_post", "with proof of purchase.")}
                </p>
                <p className="text-muted-foreground font-sans mb-6">
                  {t("terms_s8_p3", "8.3 Refunds are processed within 14 days, and access will be deactivated.")}
                </p>
              </div>

              <div id="cms-terms-s9">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("terms_s9_title", "9. Disclaimer of Liability")}</h2>
                <p className="text-muted-foreground font-sans mb-6">
                  {t(
                    "terms_s9_p1",
                    "9.1 Products are provided for educational and informational purposes only and do not replace professional medical or psychological care."
                  )}
                </p>
              </div>

              <div id="cms-terms-s10">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("terms_s10_title", "10. Personal Data Protection")}</h2>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s10_p1_pre", "10.1 Personal data is processed in accordance with GDPR and the")}{" "}
                  <a href="/privacy" className="text-gold hover:underline">{t("terms_s10_p1_link", "Privacy Policy")}</a>.
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s10_p2_pre", "10.2 Customers may request information, corrections, or deletion via")}{" "}
                  <a href="mailto:contact@resilientmind.io" className="text-gold hover:underline">contact@resilientmind.io</a>.
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s10_p3", "10.3 Data may be collected automatically when visiting the website.")}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s10_p4", "10.4 Marketing communications are voluntary and can be unsubscribed at any time.")}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s10_p5",
                    "10.5 By submitting the order form, the Customer consents to personal data processing for marketing purposes until consent is withdrawn."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-6">
                  {t("terms_s10_p6", "10.6 Cookies may be used to improve website functionality.")}
                </p>
              </div>

              <div id="cms-terms-s11">
                <h2 className="text-2xl font-serif font-semibold mb-4">{t("terms_s11_title", "11. Final Provisions")}</h2>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s11_p1", "11.1 These Terms are published on the Seller's website.")}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s11_p2_pre", "11.2 Complaints may be submitted via email to")}{" "}
                  <a href="mailto:contact@resilientmind.io" className="text-gold hover:underline">contact@resilientmind.io</a>.
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t(
                    "terms_s11_p3",
                    "11.3 Any disputes shall be resolved by courts of the Seller's registered country unless mandatory consumer laws apply."
                  )}
                </p>
                <p className="text-muted-foreground font-sans mb-2">
                  {t("terms_s11_p4", "11.4 The Seller reserves the right to amend these Terms.")}
                </p>
                <p className="text-muted-foreground font-sans mb-6">
                  {t("terms_s11_p5", "11.5 The valid and effective version of these Terms is effective from February 2026.")}
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

export default Terms;
