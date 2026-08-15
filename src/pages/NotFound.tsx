import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Home, ArrowLeft } from "lucide-react";
import { useCms } from "@/hooks/useCms";

const NotFound = () => {
  const { t } = useCms();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={t("notfound_seo_title", "Page Not Found (404) | Resilient Mind")}
        description={t("notfound_seo_description", "The page you're looking for doesn't exist or has been moved.")}
        path="/404"
        noindex
      />
      <Navbar />

      <main id="cms-shared-notfound" className="flex-1 flex items-center justify-center pt-20 pb-16">
        <div className="container px-4 max-w-lg mx-auto text-center">
          <div className="text-8xl font-serif font-bold text-gradient-gold mb-4">
            404
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
            {t("notfound_heading", "Page Not Found")}
          </h1>
          <p className="text-muted-foreground font-sans mb-8">
            {t("notfound_description", "Sorry, the page you're looking for doesn't exist or has been moved.")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all"
            >
              <Home size={18} />
              {t("notfound_button_home", "Go to Homepage")}
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground font-sans font-medium rounded-full hover:bg-secondary transition-all"
            >
              <ArrowLeft size={18} />
              {t("notfound_button_back", "Go Back")}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
