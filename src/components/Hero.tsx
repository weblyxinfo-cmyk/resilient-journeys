import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
      </div>

      <div className="container relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-sans font-medium text-primary">
              For Expat Women in Spain
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-semibold leading-tight mb-6 animate-slide-up">
            Build Your{" "}
            <span className="text-gradient-gold">Resilient Mind</span>
            <br />
            <span className="text-foreground/90">Thrive Anywhere You Are</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground font-sans leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            A transformative 12-month journey combining creative art therapy and 
            evidence-based resilience techniques for expat families navigating life abroad.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link
              to="/resilient-hub"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all duration-300 hover:scale-105"
            >
              Start Your Journey
              <ArrowRight size={18} />
            </Link>
            <button
              className="inline-flex items-center gap-2 px-8 py-4 bg-card border border-border text-foreground font-sans font-medium rounded-full hover:bg-secondary transition-all duration-300 group"
            >
              <span className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <Play size={16} className="text-primary ml-0.5" />
              </span>
              Watch My Story
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
            {[
              { number: "500+", label: "Families Helped" },
              { number: "12", label: "Month Program" },
              { number: "10+", label: "Years Experience" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-serif font-bold text-primary mb-1">
                  {stat.number}
                </div>
                <div className="text-xs md:text-sm font-sans text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
