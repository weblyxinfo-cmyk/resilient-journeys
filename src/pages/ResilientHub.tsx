import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";
import { Check, Sparkles, Calendar, Video, Users, Palette, Download } from "lucide-react";
import { Link } from "react-router-dom";

const months = [
  { month: 1, title: "Foundation", focus: "Understanding Resilience" },
  { month: 2, title: "Self-Awareness", focus: "Knowing Your Patterns" },
  { month: 3, title: "Emotional Regulation", focus: "Managing Big Feelings" },
  { month: 4, title: "Connection", focus: "Building Support Networks" },
  { month: 5, title: "Adaptability", focus: "Embracing Change" },
  { month: 6, title: "Problem Solving", focus: "Creative Solutions" },
  { month: 7, title: "Self-Care", focus: "Nurturing Yourself" },
  { month: 8, title: "Communication", focus: "Expressing Your Needs" },
  { month: 9, title: "Boundaries", focus: "Protecting Your Energy" },
  { month: 10, title: "Purpose", focus: "Finding Meaning" },
  { month: 11, title: "Gratitude", focus: "Cultivating Joy" },
  { month: 12, title: "Integration", focus: "Living Resiliently" },
];

const ResilientHub = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground border-2 border-foreground mb-6"
                style={{
                  boxShadow: "2px 2px 0 0 hsl(var(--brutal-black))",
                }}
              >
                <Sparkles size={16} />
                <span className="text-sm font-sans font-bold uppercase tracking-wide">
                  12-Month Transformation
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display mb-6">
                Building Resilient Mind
                <br />12 Months to Inner Strength
              </h1>

              <p className="text-lg text-muted-foreground font-sans mb-8 max-w-2xl mx-auto">
                A structured journey through 12 aspects of resilience, combining
                creative art therapy techniques with evidence-based approaches
                designed specifically for expat families.
              </p>

              <Link
                to="#pricing"
                className="btn-primary inline-flex items-center gap-2"
              >
                Start Your Journey
              </Link>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-display mb-12 text-center">
                What You Will Receive
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Video, title: "4 Video Lessons", desc: "Each month" },
                  { icon: Download, title: "Worksheets", desc: "Printable PDFs" },
                  { icon: Calendar, title: "Meditation Library", desc: "Guided audio" },
                  { icon: Users, title: "Community", desc: "Private access" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="text-center p-6 border-2 border-foreground bg-card"
                    style={{
                      boxShadow: "4px 4px 0 0 hsl(var(--brutal-black))",
                    }}
                  >
                    <div
                      className="w-14 h-14 bg-brutal-yellow border-2 border-foreground flex items-center justify-center mx-auto mb-4"
                      style={{
                        boxShadow: "2px 2px 0 0 hsl(var(--brutal-black))",
                      }}
                    >
                      <item.icon size={24} className="text-foreground" />
                    </div>
                    <h3 className="font-display text-xl mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-sans">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 12 Month Journey */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brutal-yellow border-2 border-foreground mb-6"
                  style={{
                    boxShadow: "2px 2px 0 0 hsl(var(--brutal-black))",
                  }}
                >
                  <Calendar size={16} />
                  <span className="text-sm font-sans font-bold uppercase tracking-wide">
                    Your Journey Map
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-display">
                  12 Months, 12 Pillars of Resilience
                </h2>
              </div>

              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {months.map((item) => (
                  <div
                    key={item.month}
                    className="p-5 bg-card border-2 border-foreground hover:bg-brutal-yellow transition-colors"
                    style={{
                      boxShadow: "3px 3px 0 0 hsl(var(--brutal-black))",
                    }}
                  >
                    <div className="text-xs font-sans font-bold uppercase text-accent mb-2">
                      Month {item.month}
                    </div>
                    <h3 className="font-display text-xl mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-sans">
                      {item.focus}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Premium Benefits */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-6">
            <div className="max-w-4xl mx-auto">
              <div
                className="p-8 md:p-12 bg-accent text-accent-foreground border-2 border-foreground"
                style={{
                  boxShadow: "8px 8px 0 0 hsl(var(--brutal-black))",
                }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Palette size={24} />
                  <span className="font-sans font-bold uppercase tracking-wide">Premium Exclusive</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-display mb-6">
                  Art Therapy Materials Kit
                </h2>

                <p className="text-accent-foreground/80 font-sans mb-8 max-w-2xl">
                  Premium members receive a curated art therapy materials kit delivered
                  to their home, including supplies for silk painting and other creative
                  exercises featured in the program.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Silk painting supplies",
                    "Quality art paper",
                    "Specialty pens & markers",
                    "Guided project cards",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-accent-foreground flex items-center justify-center">
                        <Check size={14} className="text-accent" />
                      </div>
                      <span className="font-sans">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <div id="pricing">
          <Pricing />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResilientHub;
