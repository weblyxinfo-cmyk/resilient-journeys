import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";
import PageHero from "@/components/PageHero";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        <PageHero>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <FileText size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  Legal
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-6">
                Terms of Service
              </h1>

              <p className="text-lg text-muted-foreground font-sans">
                Last updated: January 2025
              </p>
            </div>
        </PageHero>

        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto prose prose-lg">
              <h2 className="text-2xl font-serif font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground font-sans mb-6">
                By accessing or using Resilient Mind services, you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use our services.
              </p>

              <h2 className="text-2xl font-serif font-semibold mb-4">2. Description of Services</h2>
              <p className="text-muted-foreground font-sans mb-6">
                Resilient Mind provides online coaching, art expressive therapy programs, video courses,
                downloadable resources, and personal consultation services designed for expatriates and
                globally mobile individuals.
              </p>

              <h2 className="text-2xl font-serif font-semibold mb-4">3. Membership and Subscriptions</h2>
              <p className="text-muted-foreground font-sans mb-4">
                We offer different membership tiers:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground font-sans mb-6 space-y-2">
                <li><strong>Basic Membership:</strong> Access to foundational modules, worksheets, and meditation library</li>
                <li><strong>Premium Membership:</strong> Full access including personal consultations and art expressive therapy materials kit</li>
              </ul>
              <p className="text-muted-foreground font-sans mb-6">
                Subscriptions are billed monthly or annually. You may cancel at any time, and your access
                will continue until the end of your current billing period.
              </p>

              <h2 className="text-2xl font-serif font-semibold mb-4">4. Payment Terms</h2>
              <p className="text-muted-foreground font-sans mb-6">
                All payments are processed securely through Stripe. Prices are listed in EUR.
                Refunds may be requested within 14 days of purchase if you have not accessed
                more than 20% of the program content.
              </p>

              <h2 className="text-2xl font-serif font-semibold mb-4">5. Intellectual Property</h2>
              <p className="text-muted-foreground font-sans mb-6">
                All content, including videos, worksheets, meditations, and written materials,
                are the intellectual property of Resilient Mind. You may not reproduce, distribute,
                or share this content without written permission.
              </p>

              <h2 className="text-2xl font-serif font-semibold mb-4">6. Disclaimer</h2>
              <p className="text-muted-foreground font-sans mb-6">
                Our services are for educational and personal development purposes only. They are not
                a substitute for professional medical, psychological, or psychiatric treatment.
                If you are experiencing a mental health crisis, please contact a licensed healthcare provider.
              </p>

              <h2 className="text-2xl font-serif font-semibold mb-4">7. Contact</h2>
              <p className="text-muted-foreground font-sans mb-6">
                For questions about these terms, please contact us at{" "}
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

export default Terms;
