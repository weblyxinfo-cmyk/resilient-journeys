import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import portrait from "@/assets/about-portrait.jpg";

const AboutPreview = () => {
  return (
    <section className="py-24 bg-secondary">
      <div className="container px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div
              className="aspect-[4/5] overflow-hidden border-2 border-foreground bg-muted"
              style={{
                boxShadow: "8px 8px 0 0 hsl(var(--brutal-black))",
              }}
            >
              <img
                src={portrait}
                alt="Your resilience coach"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Accent decoration */}
            <div
              className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent border-2 border-foreground -z-10"
              style={{
                boxShadow: "4px 4px 0 0 hsl(var(--brutal-black))",
              }}
            />
          </div>

          {/* Content */}
          <div>
            <p className="text-accent font-sans font-bold uppercase tracking-wide text-sm mb-3">
              About Me
            </p>

            <h2 className="text-4xl md:text-5xl font-display mb-6">
              I Know What It Feels Like to Start Over
            </h2>

            <p className="text-muted-foreground font-sans leading-relaxed mb-5">
              Having lived as an expat in Australia and now Spain, I intimately
              understand the challenges of building a new life abroad. The language
              barriers, the cultural differences, and the constant feeling of being
              slightly out of place.
            </p>

            <p className="text-muted-foreground font-sans leading-relaxed mb-8">
              Through my journey, I discovered the power of creative art therapy
              and evidence-based resilience techniques. Now I help other expat
              families develop the inner strength to truly thrive.
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {["Art Therapy", "Resilience Coaching", "Expat Experience"].map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-brutal-yellow border-2 border-foreground text-sm font-sans font-bold uppercase"
                  style={{
                    boxShadow: "2px 2px 0 0 hsl(var(--brutal-black))",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>

            <Link
              to="/about"
              className="btn-secondary inline-flex items-center gap-2"
            >
              Read My Full Story
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
