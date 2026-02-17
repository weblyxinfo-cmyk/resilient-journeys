import { useState } from "react";
import { Download, CheckCircle, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email('Please enter a valid email address');

const LeadMagnet = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
    } catch {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
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
          title: 'Already registered',
          description: 'This email is already in our list'
        });
        setIsSubmitted(true);
      } else {
        toast({
          title: 'Error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive'
        });
      }
    } else {
      setIsSubmitted(true);
      toast({
        title: 'Thank you!',
        description: 'You will receive an email with the materials soon'
      });

      // Fire-and-forget: add contact to Brevo list
      try {
        await supabase.functions.invoke('brevo-add-contact', {
          body: { email, name: name || undefined, listIds: [2] },
        });
      } catch {
        // Non-blocking — Brevo failure should not affect user flow
      }
    }

    setIsLoading(false);
  };

  return (
    <section className="py-24 bg-card">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              {/* Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <Download size={16} className="text-primary" />
                  <span className="text-sm font-sans font-medium text-primary">
                    Free Download
                  </span>
                </div>

                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  Shift Your Energy & Calm Your Mind in Just 30 Minutes a Day
                </h2>

                <p className="text-muted-foreground font-sans mb-4">
                  Feeling anxious, stressed, or stuck while living abroad? Struggling with work, language barriers, or just fitting into a new life?
                </p>

                <p className="text-muted-foreground font-sans mb-6">
                  This free 7-day practice is designed specifically for expats like you. In just 30 minutes a day, you'll:
                </p>

                <ul className="space-y-3 mb-6">
                  {[
                    "Ground your energy with morning gratitude",
                    "Release stress and tension with a simple EFT tapping practice",
                    "Quiet your mind and reflect in the evening to end the day calmer and more in control",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 font-sans text-sm">
                      <CheckCircle size={18} className="text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-muted-foreground font-sans text-sm italic mb-6">
                  Even after the first day, you'll notice: "Wow, I feel lighter. I can handle this. I'm not ruled by anxiety."
                </p>
              </div>

              {/* Form */}
              <div className="bg-card rounded-2xl p-6 shadow-elevated">
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold mb-2">
                      Thank you!
                    </h3>
                    <p className="text-muted-foreground font-sans text-sm">
                      Check your inbox for your free materials and access link.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-serif font-semibold mb-2">
                      Get Free Access
                    </h3>
                    <p className="text-muted-foreground font-sans text-sm mb-6">
                      Enter your email and receive the materials instantly.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name (optional)"
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
                          placeholder="Your email"
                          required
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-xl shadow-gold hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                      >
                        {isLoading ? 'Sending...' : 'Send Me Free Materials'}
                      </button>

                      <p className="text-xs text-muted-foreground font-sans text-center">
                        No spam. Unsubscribe anytime. Your data is safe.
                      </p>
                    </form>
                  </>
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
