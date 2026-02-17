import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Hand,
  Moon,
  CheckCircle2,
  Mail,
  Loader2,
  FileText,
  Play
} from 'lucide-react';
import Logo from '@/components/Logo';
import PageHero from '@/components/PageHero';
import SEO from '@/components/SEO';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

interface FormData {
  name: string;
  email: string;
  agreeToEmails: boolean;
}

const FreeGuide = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    agreeToEmails: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

      // Send free guide email + add to Brevo (fire-and-forget)
      await supabase.functions.invoke('send-free-guide', {
        body: { email: formData.email, name: formData.name || undefined },
      });

      supabase.functions.invoke('brevo-add-contact', {
        body: { email: formData.email, name: formData.name || undefined },
      }).catch(() => {});

      toast.success('Your free practice kit is on the way!');
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state — show download links
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-background flex flex-col">
        <header className="p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-xl">
            <div className="flex justify-center mb-8">
              <Link to="/">
                <Logo className="h-16 w-auto" />
              </Link>
            </div>

            <Card className="border-gold/20 shadow-elegant">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-gold/10 p-4">
                    <CheckCircle2 className="h-12 w-12 text-gold" />
                  </div>
                </div>
                <CardTitle className="font-serif text-2xl">
                  Your Free 7-Day Practice Kit Is Ready!
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  We've also sent the kit to <span className="font-medium text-foreground">{formData.email}</span> so you can access it anytime.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Download: Gratitude Workbook */}
                <a
                  href="/assets/7-Day-Gratitude-Workbook.pdf"
                  download
                  className="flex items-center gap-4 p-4 rounded-xl border border-gold/20 bg-cream/30 hover:bg-gold/5 transition-colors group"
                >
                  <div className="rounded-full bg-gold/10 p-3 group-hover:bg-gold/20 transition-colors">
                    <Sun className="h-6 w-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">7-Day Gratitude Workbook</p>
                    <p className="text-sm text-muted-foreground">Morning practice & evening reflection</p>
                  </div>
                  <Download className="h-5 w-5 text-gold" />
                </a>

                {/* Download: EFT Workbook */}
                <a
                  href="/assets/7-Day-EFT-Workbook-for-Expats.pdf"
                  download
                  className="flex items-center gap-4 p-4 rounded-xl border border-gold/20 bg-cream/30 hover:bg-gold/5 transition-colors group"
                >
                  <div className="rounded-full bg-gold/10 p-3 group-hover:bg-gold/20 transition-colors">
                    <Hand className="h-6 w-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">7-Day EFT Tapping Workbook</p>
                    <p className="text-sm text-muted-foreground">Release stress & rebuild confidence</p>
                  </div>
                  <Download className="h-5 w-5 text-gold" />
                </a>

                {/* Video placeholder */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gold/20 bg-cream/30">
                  <div className="rounded-full bg-gold/10 p-3">
                    <Play className="h-6 w-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Guided EFT Tapping Video</p>
                    <p className="text-sm text-muted-foreground">Create a free account at resilientmind.io/auth to access</p>
                  </div>
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="pt-4 border-t border-gold/10">
                  <p className="text-sm text-muted-foreground text-center">
                    💛 Love to share? Send your friends{' '}
                    <span className="font-medium text-gold">resilientmind.io/free-guide</span>{' '}
                    so they can get their own copy.
                  </p>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="w-full border-gold/30 hover:bg-gold/5"
                >
                  <Link to="/">Return to homepage</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

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
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
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
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-gold/10 p-6">
                <Download className="h-12 w-12 text-gold" />
              </div>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 leading-tight">
              3 Tools to Shift Your Energy:<br />
              <span className="text-gold">7 Days to Calm, Clarity & Resilience Overseas</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Practical daily exercises to release stress, calm your nervous system, and regain focus — even during challenging times abroad.
            </p>
          </div>

          {/* What's Included */}
          <div className="grid gap-4 mb-8">
            <Card className="border-gold/20 shadow-elegant">
              <CardContent className="p-6">
                <h2 className="font-serif text-xl mb-6 text-center">Your Free 7-Day Practice Includes</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-gold/10 p-2.5 mt-0.5 flex-shrink-0">
                      <Sun className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium">🌅 Morning Gratitude Workbook</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start your day noticing small wins and strengths. Feel calmer, more grounded, and ready to face the challenges of a new country.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-gold/10 p-2.5 mt-0.5 flex-shrink-0">
                      <Play className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium">🌤 Midday EFT Tapping Video + Workbook</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Release stress, anxiety, and tension from language barriers, job uncertainty, or feeling out of place. Calm your nervous system and regain focus.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-gold/10 p-2.5 mt-0.5 flex-shrink-0">
                      <Moon className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium">🌙 Evening Reflection</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pause, reflect, and gently reframe your thoughts. End the day with clarity and a calmer mindset — ready to rest and recharge.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Proof */}
          <div className="text-center mb-8">
            <p className="text-muted-foreground italic text-lg">
              "In just 30 minutes a day, you'll notice your energy shifting, your nervous system relaxing, and your mind becoming clearer."
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              No perfection, no pressure — just simple, realistic tools for expats who want to feel stronger and more in control.
            </p>
          </div>

          {/* Email Capture Form */}
          <Card className="border-gold/20 shadow-elegant">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-center">
                  Download Your Free Practice Kit
                </CardTitle>
                <CardDescription className="text-center">
                  Get instant access to both workbooks + the guided EFT video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="border-gold/30 focus:border-gold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
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
                    I'd like to receive resilience tips and updates (optional)
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Get My Free 7-Day Practice Kit
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-6 pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> 2 PDF Workbooks
                  </span>
                  <span className="flex items-center gap-1">
                    <Play className="h-3.5 w-3.5" /> Guided Video
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> No spam
                  </span>
                </div>

                <div className="pt-2 text-center text-xs text-muted-foreground">
                  By signing up, you agree to our{' '}
                  <Link to="/terms" className="text-gold hover:underline">Terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>
                </div>
              </CardContent>
            </form>
          </Card>

          {/* Upsell teaser */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Curious to go deeper? This is just the beginning of your <span className="font-medium text-foreground">Resilient Mind</span> journey — designed to show you the kind of transformation possible when you consistently care for your nervous system, mindset, and self-awareness.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FreeGuide;
