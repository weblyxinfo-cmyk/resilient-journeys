import { useState } from "react";
import { Download, CheckCircle, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useCms } from "@/hooks/useCms";

const emailSchema = z.string().email('Please enter a valid email address');

const LeadMagnet = () => {
  const { t } = useCms();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
    } catch {
      toast({
        title: t("leadmagnet_toast_error_title", "Error"),
        description: t("leadmagnet_toast_invalid_email", "Please enter a valid email address"),
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from('lead_magnets')
      .insert({ email, name: name || null, source: 'website' });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: t("leadmagnet_toast_already_title", "Already registered"),
          description: t("leadmagnet_toast_already_description", "This email is already in our list")
        });
        setIsSubmitted(true);
      } else {
        toast({
          title: t("leadmagnet_toast_error_title", "Error"),
          description: t("leadmagnet_toast_generic_error", "Something went wrong. Please try again."),
          variant: 'destructive'
        });
      }
    } else {
      setIsSubmitted(true);

      // Call Brevo: DOI mode sends a confirmation email; legacy mode adds directly.
      let isDoi = false;
      try {
        const { data } = await supabase.functions.invoke('brevo-add-contact', {
          body: { email, name: name || undefined, listIds: [2] },
        });
        isDoi = data?.mode === 'double-opt-in';
      } catch {
        // Non-blocking — Brevo failure should not affect user flow
      }

      setNeedsConfirmation(isDoi);
      toast({
        title: isDoi
          ? t("leadmagnet_toast_doi_title", "Almost there!")
          : t("leadmagnet_toast_thanks_title", "Thank you!"),
        description: isDoi
          ? t("leadmagnet_toast_doi_description", "Check your inbox and click the confirmation link to receive your materials.")
          : t("leadmagnet_toast_thanks_description", "You will receive an email with the materials soon")
      });
    }

    setIsLoading(false);
  };

  const bullets = [
    t("leadmagnet_bullet_1", "Ground your energy with morning gratitude"),
    t("leadmagnet_bullet_2", "Release stress and tension with a simple EFT tapping practice"),
    t("leadmagnet_bullet_3", "Quiet your mind and reflect in the evening to end the day calmer and more in control"),
  ];

  return (
    <section id="cms-leadmagnet-main" className="py-24 bg-card">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              {/* Content */}
              <div id="cms-leadmagnet-content">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <Download size={16} className="text-primary" />
                  <span className="text-sm font-sans font-medium text-primary">
                    {t("leadmagnet_badge", "Free Download")}
                  </span>
                </div>

                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  {t("leadmagnet_title", "Shift Your Energy & Calm Your Mind in Just 30 Minutes a Day")}
                </h2>

                <p className="text-muted-foreground font-sans mb-4">
                  {t("leadmagnet_intro_1", "Feeling anxious, stressed, or stuck while living abroad? Struggling with work, language barriers, or just fitting into a new life?")}
                </p>

                <p className="text-muted-foreground font-sans mb-6">
                  {t("leadmagnet_intro_2", "This free 7-day practice is designed specifically for expats like you. In just 30 minutes a day, you'll:")}
                </p>

                <ul className="space-y-3 mb-6">
                  {bullets.map((item, index) => (
                    <li key={index} className="flex items-center gap-3 font-sans text-sm">
                      <CheckCircle size={18} className="text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-muted-foreground font-sans text-sm italic mb-6">
                  {t("leadmagnet_quote", "Even after the first day, you'll notice: \"Wow, I feel lighter. I can handle this. I'm not ruled by anxiety.\"")}
                </p>
              </div>

              {/* Form */}
              <div className="bg-card rounded-2xl p-6 shadow-elevated">
                {isSubmitted ? (
                  <div id="cms-leadmagnet-success" className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold mb-2">
                      {needsConfirmation
                        ? t("leadmagnet_success_doi_title", "Almost there!")
                        : t("leadmagnet_success_thanks_title", "Thank you!")}
                    </h3>
                    <p className="text-muted-foreground font-sans text-sm">
                      {needsConfirmation
                        ? t("leadmagnet_success_doi_text", "Check your inbox and click the confirmation link. We’ll send your free materials right after you confirm.")
                        : t("leadmagnet_success_thanks_text", "Check your inbox for your free materials and access link.")}
                    </p>
                  </div>
                ) : (
                  <div id="cms-leadmagnet-form">
                    <h3 className="text-xl font-serif font-semibold mb-2">
                      {t("leadmagnet_form_title", "Get Free Access")}
                    </h3>
                    <p className="text-muted-foreground font-sans text-sm mb-6">
                      {t("leadmagnet_form_subtitle", "Enter your email and receive the materials instantly.")}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t("leadmagnet_form_name_placeholder", "Your name (optional)")}
                          className="w-full px-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t("leadmagnet_form_email_placeholder", "Your email")}
                          required
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-xl shadow-gold hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                      >
                        {isLoading
                          ? t("leadmagnet_form_submit_loading", "Sending...")
                          : t("leadmagnet_form_submit_label", "Send Me Free Materials")}
                      </button>

                      <p className="text-xs text-muted-foreground font-sans text-center">
                        {t("leadmagnet_form_footer_note", "No spam. Unsubscribe anytime. Your data is safe.")}
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadMagnet;
