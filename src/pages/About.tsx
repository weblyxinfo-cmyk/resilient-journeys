import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Heart, MapPin, Palette, Award, Users } from "lucide-react";
import { Link } from "react-router-dom";
import portrait from "@/assets/about-portrait.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container px-6">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative order-2 lg:order-1">
                <div
                  className="relative overflow-hidden border-2 border-foreground"
                  style={{
                    boxShadow: "8px 8px 0 0 hsl(var(--brutal-black))",
                  }}
                >
                  <img
                    src={portrait}
                    alt="Your resilience coach"
                    className="w-full h-auto aspect-[4/5] object-cover"
                  />
                </div>

                {/* Floating element */}
                <div
                  className="absolute -bottom-6 -right-6 md:right-6 bg-brutal-yellow border-2 border-foreground p-4"
                  style={{
                    boxShadow: "4px 4px 0 0 hsl(var(--brutal-black))",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-foreground flex items-center justify-center">
                      <MapPin size={18} className="text-brutal-yellow" />
                    </div>
                    <div>
                      <div className="font-sans font-bold text-sm">Based in Spain</div>
                      <div className="text-xs font-sans text-foreground/70">Previously Australia</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground border-2 border-foreground mb-6"
                  style={{
                    boxShadow: "2px 2px 0 0 hsl(var(--brutal-black))",
                  }}
                >
                  <Heart size={16} />
                  <span className="text-sm font-sans font-bold uppercase tracking-wide">
                    About Me
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-display mb-6">
                  Your Guide to Building a Resilient Mind
                </h1>

                <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-6">
                  I understand the unique challenges of expat life because I have lived it.
                  From the excitement of new beginnings to the quiet moments of missing
                  home—I have experienced it all.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-display mb-8 text-center">
                My Journey
              </h2>

              <div className="space-y-6">
                <p className="text-muted-foreground font-sans leading-relaxed">
                  My journey into resilience coaching began in Australia, where I first
                  experienced what it means to rebuild your life in a completely new
                  environment. The language was familiar, but the culture, the social
                  norms, and the sheer distance from family tested me in ways I never
                  anticipated.
                </p>

                <p className="text-muted-foreground font-sans leading-relaxed">
                  Now living in Spain, I face new challenges—learning Spanish, navigating
                  a different bureaucratic system, and helping my family adapt to yet
                  another culture. These experiences have taught me that resilience is
                  not about being unbreakable; it is about learning to bend without
                  breaking.
                </p>

                <p className="text-muted-foreground font-sans leading-relaxed">
                  Through my work with art therapy and creative expression, I discovered
                  that resilience can be cultivated through intentional practice. The
                  combination of evidence-based psychological techniques with creative
                  expression—like silk painting—creates a powerful pathway to inner strength.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Expertise Section */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-display mb-12 text-center">
                What I Bring to Your Journey
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Palette,
                    title: "Art Therapy",
                    description: "Creative techniques including silk painting to process emotions and build resilience through artistic expression.",
                  },
                  {
                    icon: Award,
                    title: "Evidence-Based Methods",
                    description: "Psychological techniques grounded in research, adapted specifically for the expat experience.",
                  },
                  {
                    icon: Users,
                    title: "Family-Centered Approach",
                    description: "Programs designed for both parents and children, recognizing that resilience is a family affair.",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="brutal-card p-6 text-center"
                  >
                    <div
                      className="w-16 h-16 bg-brutal-yellow border-2 border-foreground flex items-center justify-center mx-auto mb-6"
                      style={{
                        boxShadow: "3px 3px 0 0 hsl(var(--brutal-black))",
                      }}
                    >
                      <item.icon size={28} className="text-foreground" />
                    </div>
                    <h3 className="text-2xl font-display mb-3">{item.title}</h3>
                    <p className="text-muted-foreground font-sans">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-accent">
          <div className="container px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-display mb-4 text-accent-foreground">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-accent-foreground/80 font-sans mb-8">
                Whether you are new to expat life or have been abroad for years,
                it is never too late to build your resilient mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/resilient-hub"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  Explore Resilient Hub
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/booking"
                  className="inline-flex items-center justify-center px-6 py-3 bg-accent-foreground text-accent font-sans font-semibold text-sm uppercase tracking-wide border-2 border-accent-foreground transition-all duration-150 hover:bg-transparent hover:text-accent-foreground"
                  style={{
                    boxShadow: "4px 4px 0 0 hsl(var(--brutal-black))",
                  }}
                >
                  Book a Free Call
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
