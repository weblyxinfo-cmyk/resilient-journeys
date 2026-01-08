import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";
import { Check, Sparkles, Calendar, BookOpen, Video, Users, Palette, Download } from "lucide-react";
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
        <section className="py-16 md:py-24 bg-gradient-warm">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Sparkles size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  12-Month Transformation
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-semibold mb-6">
                Building <span className="text-gradient-gold">Resilient Mind</span>
                <br />12 Months to Inner Strength
              </h1>
              
              <p className="text-lg text-muted-foreground font-sans mb-8 max-w-2xl mx-auto">
                A structured journey through 12 aspects of resilience, combining 
                creative art therapy techniques with evidence-based approaches 
                designed specifically for expat families.
              </p>
              
              <Link
                to="#pricing"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all"
              >
                Start Your Journey
              </Link>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-12 text-center">
                What You Will Receive
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Video, title: "4 Video Lessons", desc: "Each month" },
                  { icon: Download, title: "Worksheets", desc: "Printable PDFs" },
                  { icon: BookOpen, title: "Meditation Library", desc: "Guided audio" },
                  { icon: Users, title: "Community", desc: "Private access" },
                ].map((item, index) => (
                  <div key={index} className="text-center p-6 bg-card rounded-2xl border border-border">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <item.icon size={24} className="text-primary" />
                    </div>
                    <h3 className="font-serif font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-sans">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 12 Month Journey */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <Calendar size={16} className="text-primary" />
                  <span className="text-sm font-sans font-medium text-primary">
                    Your Journey Map
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-semibold">
                  12 Months, 12 Pillars of Resilience
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {months.map((item) => (
                  <div
                    key={item.month}
                    className="p-5 bg-background rounded-xl border border-border hover:shadow-soft transition-all"
                  >
                    <div className="text-xs font-sans font-semibold text-primary mb-2">
                      Month {item.month}
                    </div>
                    <h3 className="font-serif font-semibold text-lg mb-1">
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
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-gold rounded-3xl p-8 md:p-12 text-primary-foreground">
                <div className="flex items-center gap-2 mb-6">
                  <Palette size={24} />
                  <span className="font-sans font-semibold">Premium Exclusive</span>
                </div>
                
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-6">
                  Art Therapy Materials Kit
                </h2>
                
                <p className="text-primary-foreground/80 font-sans mb-8 max-w-2xl">
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
                      <Check size={18} />
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
