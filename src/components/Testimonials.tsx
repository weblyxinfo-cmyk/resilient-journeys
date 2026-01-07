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
      <div className="container px-6">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <p className="text-accent font-sans font-bold uppercase tracking-wide text-sm mb-3">
            Testimonials
          </p>
          <h2 className="text-4xl md:text-5xl font-display mb-4">
            Stories of Transformation
          </h2>
          <p className="text-muted-foreground font-sans">
            Hear from other expat families who have walked this path.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="brutal-card p-6"
            >
              <Quote size={32} className="text-accent mb-4" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-brutal-yellow fill-brutal-yellow"
                  />
                ))}
              </div>

              <p className="text-foreground font-sans leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              <div className="border-t-2 border-foreground pt-4">
                <div className="font-display text-lg">
                  {testimonial.name}
                </div>
                <div className="text-sm text-muted-foreground font-sans">
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
