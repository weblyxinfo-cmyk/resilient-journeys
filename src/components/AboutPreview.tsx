import { ArrowRight, MapPin, Heart, Palette } from "lucide-react";
import { Link } from "react-router-dom";

const AboutPreview = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-elevated">
                <img
                  src="/silvie.jpg"
                  alt="Silvie Bogdanova - Art Expressive Therapist"
                  className="w-full h-auto aspect-[4/5] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-6 -right-6 md:right-6 bg-card rounded-2xl p-4 shadow-elevated max-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-sans font-semibold">Based in</div>
                    <div className="text-xs text-muted-foreground">Spain</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  Previously Australia
                </p>
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Heart size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  About Me
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl font-serif font-semibold mb-6">
                Hi, I'm <span className="text-gradient-gold">Silvie</span>
              </h2>

              <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                I help expatriates and globally mobile individuals build mental resilience, blending proven personal development techniques with insights from my own 13 years of living and thriving abroad.
              </p>

              <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                My journey began in the Czech Republic, where I completed my Master's degree in Economics and Management. Life presented me with unexpected challenges: a diagnosis of endometriosis, multiple surgeries, and navigating new cultures and healthcare systems far from home.
              </p>

              <p className="text-muted-foreground font-sans leading-relaxed mb-8">
                Over the years, I've devoted myself to holistic approaches, obtaining a Certificate in Holistic Counselling, an Art Therapy Diploma (HH Dip A.Th), and Reiki Master certification. Through Resilient Mind, I guide individuals—especially women living abroad—toward inner strength and clarity.
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: Heart, label: "Holistic Counselling" },
                  { icon: Palette, label: "Art Therapy Diploma" },
                  { icon: MapPin, label: "Reiki Master" },
                ].map((skill, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full"
                  >
                    <skill.icon size={14} className="text-primary" />
                    <span className="text-sm font-sans font-medium text-secondary-foreground">
                      {skill.label}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-primary font-sans font-semibold hover:underline"
              >
                Read My Full Story
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
