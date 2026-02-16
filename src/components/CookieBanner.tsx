import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const COOKIE_CONSENT_KEY = "cookie_consent";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-elevated p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-10 h-10 rounded-full bg-primary/10 items-center justify-center flex-shrink-0 mt-0.5">
            <Cookie size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-sans text-foreground mb-1 font-medium">
              We use cookies
            </p>
            <p className="text-sm font-sans text-muted-foreground mb-4">
              We use cookies to improve your experience. Non-essential cookies are only used with your consent.{" "}
              <Link to="/cookies" className="text-gold hover:underline">
                Learn more
              </Link>
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleAccept}
                size="sm"
                className="rounded-full bg-primary hover:bg-primary/90 font-sans text-sm"
              >
                Accept All
              </Button>
              <Button
                onClick={handleDecline}
                size="sm"
                variant="outline"
                className="rounded-full border-border font-sans text-sm"
              >
                Essential Only
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
