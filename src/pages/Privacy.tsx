import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield } from "lucide-react";
import PageHero from "@/components/PageHero";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        <PageHero>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Shield size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  Privacy
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-6">
                Privacy Policy
              </h1>

              <p className="text-lg text-muted-foreground font-sans">
                Last updated: January 2025
              </p>
            </div>
        </PageHero>

        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto prose prose-lg">
              <h2 className="text-2xl font-serif font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground font-sans mb-4">
                We collect information you provide directly to us:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground font-sans mb-6 space-y-2">
                <li>Name and email address when you create an account</li>
                <li>Payment information (processed securely by Stripe)</li>
                <li>Information you share during consultations</li>
                <li>Progress and usage data within our platform</li>
              </ul>

              <h2 className="text-2xl font-serif font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground font-sans mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground font-sans mb-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Track your progress and personalize your experience</li>
              </ul>

              <h2 className="text-2xl font-serif font-semibold mb-4">3. Data Security</h2>
              <p className="text-muted-foreground font-sans mb-6">
                We implement appropriate security measures to protect your personal information.
                Your data is stored securely using Supabase infrastructure with encryption at rest
                and in transit. Payment data is handled exclusively by Stripe and never stored on our servers.
              </p>

              <h2 className="text-2xl font-serif font-semibold mb-4">4. Data Sharing</h2>
              <p className="text-muted-foreground font-sans mb-6">
                We do not sell, trade, or rent your personal information to third parties.
                We may share information with service providers who assist us in operating our
                platform (e.g., Stripe for payments, Supabase for data storage) under strict
                confidentiality agreements.
              </p>

              <h2 className="text-2xl font-serif font-semibold mb-4">5. Your Rights (GDPR)</h2>
              <p className="text-muted-foreground font-sans mb-4">
                Under the General Data Protection Regulation, you have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground font-sans mb-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request transfer of your personal data</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h2 className="text-2xl font-serif font-semibold mb-4">6. Cookies</h2>
              <p className="text-muted-foreground font-sans mb-6">
                We use essential cookies to maintain your session and preferences.
                We do not use tracking cookies for advertising purposes.
              </p>

              <h2 className="text-2xl font-serif font-semibold mb-4">7. Data Retention</h2>
              <p className="text-muted-foreground font-sans mb-6">
                We retain your personal data for as long as your account is active or as needed
                to provide you services. You can request deletion of your account and associated
                data at any time.
              </p>

              <h2 className="text-2xl font-serif font-semibold mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground font-sans mb-6">
                For privacy-related questions or to exercise your rights, contact us at{" "}
                <a href="mailto:contact@resilientmind.io" className="text-gold hover:underline">
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

export default Privacy;
