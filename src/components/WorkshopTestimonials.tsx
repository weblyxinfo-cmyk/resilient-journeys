import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCms } from "@/hooks/useCms";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  avatar_url: string | null;
}

interface WorkshopTestimonialsProps {
  workshopId: string;
}

/**
 * What people said about a workshop, shown on that workshop's own page.
 *
 * Two kinds of row qualify: those tied to this workshop, and workshop
 * testimonials tied to none — the latter are general praise for the workshops
 * and belong on every one of them. Testimonials about sessions rather than
 * workshops (kind 'general') stay in Stories of Transformation.
 */
const WorkshopTestimonials = ({ workshopId }: WorkshopTestimonialsProps) => {
  const { t } = useCms();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("id, name, role, content, rating, avatar_url")
        .eq("is_visible", true)
        .eq("kind", "workshop")
        .or(`workshop_post_id.eq.${workshopId},workshop_post_id.is.null`)
        .order("sort_order");

      if (data) setTestimonials(data);
    };

    fetchTestimonials();
  }, [workshopId]);

  // A workshop nobody has reviewed yet shows no empty heading.
  if (testimonials.length === 0) return null;

  return (
    <section id="cms-workshoppost-testimonials" className="mt-12">
      <h2 className="text-2xl font-serif font-semibold mb-6">
        {t("workshoppost_testimonials_title", "What people said about this workshop")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-card border border-border/70 rounded-2xl p-7 shadow-soft"
          >
            <Quote size={32} className="text-primary/25 mb-3" fill="currentColor" />

            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} size={15} className="text-primary fill-primary" />
              ))}
            </div>

            <p className="text-foreground/90 font-sans leading-relaxed mb-6">
              "{testimonial.content}"
            </p>

            <div className="flex items-center gap-3 pt-5 border-t border-border/60">
              {testimonial.avatar_url ? (
                <img
                  src={testimonial.avatar_url}
                  alt={testimonial.name}
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-gold text-primary-foreground font-serif font-semibold text-lg flex-shrink-0">
                  {testimonial.name.trim().charAt(0).toUpperCase()}
                </div>
              )}
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
    </section>
  );
};

export default WorkshopTestimonials;
