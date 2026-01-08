import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Moving to Spain was overwhelming until I found Resilient Mind. The creative techniques helped both me and my daughter process our feelings about the move.",
    name: "Sarah M.",
    role: "Expat Mom, Madrid",
    rating: 5,
  },
  {
    quote:
      "The 12-month program gave me structure when everything else felt chaotic. I finally feel like I belong here.",
    name: "Jennifer K.",
    role: "Expat Mom, Barcelona",
    rating: 5,
  },
  {
    quote:
      "The art therapy sessions opened up conversations with my kids that we never would have had otherwise. Truly transformative.",
    name: "Emma T.",
    role: "Expat Mom, Valencia",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
            Stories of <span className="text-gradient-gold">Transformation</span>
          </h2>
          <p className="text-muted-foreground font-sans">
            Hear from other expat families who have walked this path.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-card border border-border rounded-2xl p-8 hover:shadow-elevated transition-all duration-300"
            >
              <Quote size={32} className="text-primary/20 mb-4" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-primary fill-primary"
                  />
                ))}
              </div>

              <p className="text-foreground font-sans leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              <div>
                <div className="font-serif font-semibold text-foreground">
                  {testimonial.name}
                </div>
                <div className="text-sm font-sans text-muted-foreground">
                  {testimonial.role}
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
