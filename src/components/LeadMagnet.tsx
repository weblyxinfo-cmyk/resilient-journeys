import { useState } from "react";
import { Download, CheckCircle, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email('Zadejte platnou emailovou adresu');

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
        title: 'Chyba',
        description: 'Zadejte platnou emailovou adresu',
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
          title: 'Již jste registrováni',
          description: 'Tento email je již v našem seznamu'
        });
        setIsSubmitted(true);
      } else {
        toast({
          title: 'Chyba',
          description: 'Něco se pokazilo. Zkuste to prosím znovu.',
          variant: 'destructive'
        });
      }
    } else {
      setIsSubmitted(true);
      toast({
        title: 'Děkujeme!',
        description: 'Brzy obdržíte email s materiály'
      });
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
                    Zdarma ke stažení
                  </span>
                </div>

                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  Začněte svou cestu k odolnosti
                </h2>

                <p className="text-muted-foreground font-sans mb-6">
                  Získejte zdarma mini e-book a video kurz s praktickými cvičeními
                  pro budování vaší mentální odolnosti.
                </p>

                <ul className="space-y-3 mb-6">
                  {[
                    "5 základních technik resilience",
                    "Řízená meditace (audio)",
                    "Tisknutelný pracovní sešit (PDF)",
                    "Video lekce",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 font-sans text-sm">
                      <CheckCircle size={18} className="text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Form */}
              <div className="bg-card rounded-2xl p-6 shadow-elevated">
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold mb-2">
                      Děkujeme!
                    </h3>
                    <p className="text-muted-foreground font-sans text-sm">
                      Podívejte se do své schránky na materiály zdarma.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-serif font-semibold mb-2">
                      Získejte přístup zdarma
                    </h3>
                    <p className="text-muted-foreground font-sans text-sm mb-6">
                      Zadejte svůj email a ihned obdržíte materiály.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Vaše jméno (volitelné)"
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
                          placeholder="Váš email"
                          required
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-xl shadow-gold hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                      >
                        {isLoading ? 'Odesílám...' : 'Poslat mi materiály zdarma'}
                      </button>

                      <p className="text-xs text-muted-foreground font-sans text-center">
                        Žádný spam. Odhlášení kdykoliv. Vaše data jsou v bezpečí.
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
