import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCms } from "@/hooks/useCms";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
}

const Testimonials = () => {
  const { t } = useCms();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        // Workshop testimonials are shown on the workshop pages instead of here.
        .eq('is_visible', true)
        .eq('kind', 'general')
        .order('sort_order');
      
      if (data && data.length > 0) {
        setTestimonials(data);
      }
      setLoading(false);
    };

    fetchTestimonials();
  }, []);

  // Don't show section if loading or no testimonials
  if (loading || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="cms-shared-testimonials" className="py-24 bg-background">
      <div className="container px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
            {t("shared_testimonials_title_prefix", "Stories of")} <span className="text-gradient-gold">{t("shared_testimonials_title_highlight", "Transformation")}</span>
          </h2>
          <p className="text-muted-foreground font-sans">
            {t("shared_testimonials_subtitle", "Hear from other expat families who have walked this path.")}
          </p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 max-w-5xl mx-auto [column-fill:_balance]">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative break-inside-avoid mb-6 bg-card border border-border/70 rounded-2xl p-7 shadow-soft hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
            >
              <Quote size={36} className="text-primary/25 mb-3" fill="currentColor" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={15} className="text-primary fill-primary" />
                ))}
              </div>

              <p className="text-foreground/90 font-sans leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3 pt-5 border-t border-border/60">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-gold text-primary-foreground font-serif font-semibold text-lg flex-shrink-0">
                  {testimonial.name.trim().charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-serif font-semibold text-foreground leading-tight">
                    {testimonial.name}
                  </div>
                  {testimonial.role && (
                    <div className="text-sm font-sans text-muted-foreground">
                      {testimonial.role}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
