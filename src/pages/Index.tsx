import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import IntroVideo from "@/components/IntroVideo";
import Services from "@/components/Services";
import AboutPreview from "@/components/AboutPreview";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import LeadMagnet from "@/components/LeadMagnet";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Resilient Mind — Transform Uncertainty Into Your Greatest Strength | Support for Expats"
        description="Build inner strength through art expressive therapy. Monthly video lessons, workbooks & consultations for expatriates navigating life abroad."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Resilient Mind",
          "url": "https://resilientmind.io",
          "logo": "https://resilientmind.io/assets/resilient-mind-logo.png",
          "description": "Online platform for building mental resilience through art expressive therapy for expatriates.",
          "founder": {
            "@type": "Person",
            "name": "Silvie Bogdanova",
            "jobTitle": "Art Expressive Therapist"
          },
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "ES"
          },
          "sameAs": []
        }}
      />
      <Navbar />
      <main>
        <Hero />
        <IntroVideo />
        <Services />
        <AboutPreview />
        <Testimonials />
        <Pricing />
        <LeadMagnet />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
