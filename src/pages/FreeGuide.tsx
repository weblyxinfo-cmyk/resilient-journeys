import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Download,
  Sun,
  Moon,
  Mail,
  Loader2,
  FileText,
  Play
} from 'lucide-react';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import { z } from 'zod';
import { useCms } from '@/hooks/useCms';

const emailSchema = z.string().email('Please enter a valid email address');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

interface FormData {
  name: string;
  email: string;
  agreeToEmails: boolean;
}

const FreeGuide = () => {
  const navigate = useNavigate();
  const { t } = useCms();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    agreeToEmails: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      nameSchema.parse(formData.name);
      emailSchema.parse(formData.email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        setIsLoading(false);
        return;
      }
    }

    try {
      // Save lead to database
      await supabase
        .from('lead_magnets')
        .insert({ email: formData.email, name: formData.name, source: 'free_guide' })
        .then(({ error }) => {
          // Ignore duplicate email errors (23505)
          if (error && !error.message?.includes('duplicate') && error.code !== '23505') {
            console.error('Lead save error:', error);
          }
        });

      // Add contact to Brevo. In DOI mode, Brevo sends a confirmation email and
      // only adds the contact to List 2 (which triggers the welcome automation)
      // after they click the link. In legacy single-opt-in mode it adds directly.
      const { data } = await supabase.functions.invoke('brevo-add-contact', {
        body: { email: formData.email, name: formData.name || undefined, listIds: [2] },
      });
      const isDoi = data?.mode === 'double-opt-in';

      if (isDoi) {
        toast.success(
          'Please check your inbox and click the confirmation link to receive your kit.'
        );
        // Stay on this page — Brevo will redirect them to /thank-you after they confirm.
      } else {
        toast.success('Your free practice kit is on the way!');
        navigate('/thank-you');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Main form UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-background flex flex-col">
      <SEO
        title="Free 7-Day Practice Kit — Calm, Clarity & Resilience Overseas | Resilient Mind"
        description="Download a free 7-day EFT practice kit with workbooks and guided exercises. Build calm and clarity as an expatriate."
        path="/free-guide"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Free 7-Day Practice Kit",
          "description": "A free 7-day EFT practice kit with workbooks and guided exercises for expatriates.",
          "brand": {
            "@type": "Organization",
            "name": "Resilient Mind"
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock",
            "url": "https://resilientmind.io/free-guide"
          }
        }}
      />
      <header id="cms-freeguide-back" className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t("freeguide_back_link", "Back to home")}
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 pb-16">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/">
              <Logo className="h-16 w-auto" />
            </Link>
          </div>

          {/* Hero */}
          <div id="cms-freeguide-hero" className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-gold/10 p-6">
                <Download className="h-12 w-12 text-gold" />
              </div>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 leading-tight">
              {t("freeguide_hero_title_line1", "3 Tools to Shift Your Energy:")}<br />
              <span className="text-gold">{t("freeguide_hero_title_line2", "7 Days to Calm, Clarity & Resilience Overseas")}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              {t("freeguide_hero_subtitle", "Practical daily exercises to release stress, calm your nervous system, and regain focus — even during challenging times abroad.")}
            </p>
          </div>

          {/* What's Included */}
          <div id="cms-freeguide-included" className="grid gap-4 mb-8">
            <Card className="border-gold/20 shadow-elegant">
              <CardContent className="p-6">
                <h2 className="font-serif text-xl mb-6 text-center">{t("freeguide_included_title", "Your Free 7-Day Practice Includes")}</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-gold/10 p-2.5 mt-0.5 flex-shrink-0">
                      <Sun className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium">{t("freeguide_included_1_title", "🌅 Morning Gratitude Workbook")}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("freeguide_included_1_description", "Start your day noticing small wins and strengths. Feel calmer, more grounded, and ready to face the challenges of a new country.")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-gold/10 p-2.5 mt-0.5 flex-shrink-0">
                      <Play className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium">{t("freeguide_included_2_title", "🌤 Midday EFT Tapping Video + Workbook")}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("freeguide_included_2_description", "Release stress, anxiety, and tension from language barriers, job uncertainty, or feeling out of place. Calm your nervous system and regain focus.")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-gold/10 p-2.5 mt-0.5 flex-shrink-0">
                      <Moon className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium">{t("freeguide_included_3_title", "🌙 Evening Reflection")}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("freeguide_included_3_description", "Pause, reflect, and gently reframe your thoughts. End the day with clarity and a calmer mindset — ready to rest and recharge.")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Proof */}
          <div id="cms-freeguide-social_proof" className="text-center mb-8">
            <p className="text-muted-foreground italic text-lg">
              {t("freeguide_social_quote", "\"In just 30 minutes a day, you'll notice your energy shifting, your nervous system relaxing, and your mind becoming clearer.\"")}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t("freeguide_social_note", "No perfection, no pressure — just simple, realistic tools for expats who want to feel stronger and more in control.")}
            </p>
          </div>

          {/* Email Capture Form */}
          <Card id="cms-freeguide-form" className="border-gold/20 shadow-elegant">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-center">
                  {t("freeguide_form_title", "Download Your Free Practice Kit")}
                </CardTitle>
                <CardDescription className="text-center">
                  {t("freeguide_form_subtitle", "Get instant access to both workbooks + the guided EFT video")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("freeguide_form_name_label", "Your Name")}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("freeguide_form_name_placeholder", "Jane Doe")}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="border-gold/30 focus:border-gold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("freeguide_form_email_label", "Email Address")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("freeguide_form_email_placeholder", "you@example.com")}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="border-gold/30 focus:border-gold"
                  />
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <Checkbox
                    id="agree"
                    checked={formData.agreeToEmails}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, agreeToEmails: checked as boolean })
                    }
                    className="border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:border-gold mt-1"
                  />
                  <Label htmlFor="agree" className="text-sm text-muted-foreground font-normal cursor-pointer">
                    {t("freeguide_form_agree_label", "I'd like to receive resilience tips and updates (optional)")}
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gold hover:bg-gold-dark text-white text-lg py-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {t("freeguide_form_submit_loading", "Sending...")}
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      {t("freeguide_form_submit_label", "Get My Free 7-Day Practice Kit")}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-6 pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> {t("freeguide_form_badge_pdfs", "2 PDF Workbooks")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Play className="h-3.5 w-3.5" /> {t("freeguide_form_badge_video", "Guided Video")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {t("freeguide_form_badge_nospam", "No spam")}
                  </span>
                </div>

                <div className="mt-5 rounded-xl border-2 border-gold/50 bg-gold/10 p-4 text-center shadow-sm">
                  <p className="text-sm font-bold text-foreground">
                    {t("freeguide_form_spam_notice_title", "📧 Important: Check your Promotions or Spam folder")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("freeguide_form_spam_notice_text_pre", "Add")} <span className="font-semibold text-gold">{t("freeguide_form_spam_notice_email", "contact@resilientmind.io")}</span> {t("freeguide_form_spam_notice_text_post", "to your contacts so you don't miss your free practice materials.")}
                  </p>
                </div>

                <div className="pt-2 text-center text-xs text-muted-foreground">
                  {t("freeguide_form_legal_pre", "By signing up, you agree to our")}{' '}
                  <Link to="/terms" className="text-gold hover:underline">{t("freeguide_form_legal_terms", "Terms")}</Link>
                  {' '}{t("freeguide_form_legal_and", "and")}{' '}
                  <Link to="/privacy" className="text-gold hover:underline">{t("freeguide_form_legal_privacy", "Privacy Policy")}</Link>
                </div>
              </CardContent>
            </form>
          </Card>

          {/* Upsell teaser */}
          <div id="cms-freeguide-upsell" className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("freeguide_upsell_text_pre", "Curious to go deeper? This is just the beginning of your")} <span className="font-medium text-foreground">{t("freeguide_upsell_brand", "Resilient Mind")}</span> {t("freeguide_upsell_text_post", "journey — designed to show you the kind of transformation possible when you consistently care for your nervous system, mindset, and self-awareness.")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FreeGuide;
