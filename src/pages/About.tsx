import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Heart, MapPin, Palette, Award, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import portrait from "@/assets/about-portrait.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-warm">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative order-2 lg:order-1">
                <div className="relative rounded-3xl overflow-hidden shadow-elevated">
                  <img
                    src={portrait}
                    alt="Your resilience coach"
                    className="w-full h-auto aspect-[4/5] object-cover"
                  />
                </div>
                
                {/* Floating elements */}
                <div className="absolute -bottom-6 -right-6 md:right-6 bg-card rounded-2xl p-4 shadow-elevated">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin size={18} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-sans font-semibold">Based in Spain</div>
                      <div className="text-xs text-muted-foreground">Previously Australia</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <Heart size={16} className="text-primary" />
                  <span className="text-sm font-sans font-medium text-primary">
                    About Me
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-6">
                  Your Guide to Building a{" "}
                  <span className="text-gradient-gold">Resilient Mind</span>
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
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-8 text-center">
                My Journey
              </h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                  My journey into resilience coaching began in Australia, where I first 
                  experienced what it means to rebuild your life in a completely new 
                  environment. The language was familiar, but the culture, the social 
                  norms, and the sheer distance from family tested me in ways I never 
                  anticipated.
                </p>
                
                <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                  Now living in Spain, I face new challenges—learning Spanish, navigating 
                  a different bureaucratic system, and helping my family adapt to yet 
                  another culture. These experiences have taught me that resilience is 
                  not about being unbreakable; it is about learning to bend without 
                  breaking.
                </p>

                <p className="text-muted-foreground font-sans leading-relaxed mb-6">
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
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-12 text-center">
                What I Bring to Your Journey
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
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
                  <div key={index} className="text-center p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <item.icon size={28} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground font-sans">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-warm">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto text-center">
              <BookOpen size={48} className="text-primary mx-auto mb-6" />
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-muted-foreground font-sans mb-8">
                Whether you are new to expat life or have been abroad for years, 
                it is never too late to build your resilient mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/resilient-hub"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all"
                >
                  Explore Resilient Hub
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/booking"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card border border-border font-sans font-medium rounded-full hover:bg-secondary transition-all"
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
