import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center pt-16 border-b-2 border-foreground">
      <div className="container px-6 py-20 md:py-32">
        <div className="max-w-5xl">
          <div className="inline-block px-4 py-2 bg-accent text-accent-foreground text-sm font-sans font-semibold uppercase tracking-wide border-2 border-foreground mb-8 animate-fade-in"
            style={{ boxShadow: '4px 4px 0 0 hsl(0 0% 5%)' }}>
            For Expat Women in Spain
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display leading-[0.9] mb-8 animate-slide-up">
            BUILD YOUR<br />
            <span className="text-accent">RESILIENT</span><br />
            MIND
          </h1>

          <p className="text-lg md:text-xl font-sans leading-relaxed max-w-2xl mb-12 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            A 12-month journey combining creative art therapy and evidence-based 
            techniques for expat families navigating life abroad.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Link to="/resilient-hub" className="btn-primary gap-2">
              Start Your Journey
              <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="btn-secondary">
              Learn More
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-20 pt-8 border-t-2 border-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {[
              { number: "500+", label: "FAMILIES HELPED" },
              { number: "12", label: "MONTH PROGRAM" },
              { number: "10+", label: "YEARS EXPERIENCE" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl md:text-5xl font-display text-foreground mb-2">{stat.number}</div>
                <div className="text-xs font-sans uppercase tracking-wide text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;