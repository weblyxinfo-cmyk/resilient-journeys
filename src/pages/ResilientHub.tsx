import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";
import ProgramOverview from "@/components/ProgramOverview";
import { Check, Sparkles, Calendar, BookOpen, Video, Users, Palette, Download, Play, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";

const programs = [
  {
    id: 1,
    title: "Adaptation in a Foreign Country",
    months: "Months 1-3",
    focus: "Nervous system regulation, daily safety rituals, inner home, identity beyond location",
    quote: "Fear doesn't mean I made a mistake – it means I left the familiar.",
    modules: [
      {
        name: "Module A",
        title: "First Steps: Finding Solid Ground When Everything is New",
        description: "Practical techniques for calming your nervous system while navigating cultural differences, building daily certainty in an unfamiliar environment."
      },
      {
        name: "Module B",
        title: "Creating Your New Roots: Identity Beyond Borders",
        description: "The profound process of identity transformation during cultural transition. Practical steps for creating an 'inner home' that remains stable regardless of geographic location."
      },
      {
        name: "Module C",
        title: "The Integration Path: Becoming Part of Your New World",
        description: "The art of balancing preservation of your cultural identity while opening to new ways of being across cultural differences."
      }
    ]
  },
  {
    id: 2,
    title: "Navigating Inner Landscapes: From Loneliness to Self-Discovery",
    months: "Months 4-6",
    focus: "Loneliness, emotional phases, identity collapse and reconstruction, purpose, vision",
    quote: "I am not broken – I am in transition.",
    modules: [
      {
        name: "Module A",
        title: "The Emotional Terrain of Expatriation: You Are Not Alone",
        description: "Uncovering the hidden emotional phases most expats experience. Practical techniques for transforming isolation into deeper self-knowledge."
      },
      {
        name: "Module B",
        title: "Reclaiming Your Authentic Self: Identity Beyond Cultural Labels",
        description: "Discovering new dimensions of your identity that awaken only through living between cultures. Transformational work with the Byron Katie method."
      },
      {
        name: "Module C",
        title: "Soul Alignment: Finding Meaning in Your Expat Journey",
        description: "Revealing the hidden meaning and purpose behind your expatriation journey through intuitive practices."
      }
    ]
  },
  {
    id: 3,
    title: "Financial Freedom Abroad: Navigate Financial Uncertainty with Ease",
    months: "Months 7-9",
    focus: "Money beliefs, self-trust, financial calm, opportunity awareness, intuitive decisions",
    quote: "I don't rely on certainty—I rely on my own inner guidance.",
    modules: [
      {
        name: "Module A",
        title: "Money Energy Mastery: Uncovering Your Expat Money Story",
        description: "Practical techniques for identifying inherited money beliefs, understanding how your financial mindset shifts when navigating different cultural money values."
      },
      {
        name: "Module B",
        title: "Trust & Abundance: Creating Financial Security Anywhere",
        description: "Building inner certainty independent of external circumstances, how to develop trust in yourself and your ability to thrive in any environment."
      },
      {
        name: "Module C",
        title: "Prosperity Consciousness: Living in Alignment with Abundance",
        description: "Creating a personal manifestation process for attracting opportunities, techniques for recognizing and utilizing hidden financial opportunities."
      }
    ]
  },
  {
    id: 4,
    title: "Life Beyond Family Borders: Redefining Family When Worlds Apart",
    months: "Months 10-12",
    focus: "Guilt release, emotional closeness, building authentic community, integration, life vision",
    quote: "Belonging isn't found, it's created—through your courageous presence, the seeds of trust, and the daily tending of meaningful connections.",
    modules: [
      {
        name: "Module A",
        title: "Heart Bridges: Nurturing Love Across Distances",
        description: "Rituals for maintaining deep emotional closeness despite physical distance, creative ways of sharing life beyond texts and calls."
      },
      {
        name: "Module B",
        title: "Soul Family: Creating Your Tribe in a New Land",
        description: "Strategies for finding authentic friendships in a foreign environment, recognizing potential 'kindred spirits,' courage to be vulnerable."
      },
      {
        name: "Module C",
        title: "The Integrated Self: Embracing Your Multi-Dimensional Life",
        description: "The culmination of your transformation journey, where separate skills integrate into your new resilient identity."
      }
    ]
  }
];

const ResilientHub = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Resilient Hub — Monthly Video Lessons & Workbooks for Expats | Resilient Mind"
        description="Access monthly video lessons, guided workbooks and creative exercises to build resilience as an expatriate. Start your journey today."
        path="/resilient-hub"
      />
      <Navbar />
      
      <main className="pt-20">
        {/* Hero */}
        <PageHero>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Sparkles size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  Building Resilient Mind
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-semibold mb-6">
                <span className="text-gradient-gold">12 Months Program</span>
                <br />to Inner Strength
              </h1>

              <p className="text-lg text-muted-foreground font-sans mb-4 max-w-3xl mx-auto">
                Expat life can be rewarding, but it also comes with challenges—loneliness, cultural differences, uncertainty, and navigating health challenges while away from your familiar support network.
              </p>

              <p className="text-lg text-foreground/90 font-sans mb-8 max-w-3xl mx-auto">
                Using my 13 years of experience living abroad and my expertise in personal development, expressive arts, and holistic therapies, I created a program that turns these challenges into opportunities for growth and inner strength.
              </p>
              
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all"
              >
                Start Your Journey
              </button>
            </div>
        </PageHero>

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

        {/* Program Content with Tabs */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <Tabs defaultValue="videos" className="w-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                      <Play size={16} className="text-primary" />
                      <span className="text-sm font-sans font-medium text-primary">
                        Program Content
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-serif font-semibold">
                      12 Months, 12 Pillars of Resilience
                    </h2>
                  </div>
                  
                  <TabsList className="bg-cream-dark/50 self-start">
                    <TabsTrigger value="videos" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                      <Video size={16} className="mr-2" />
                      Video Lessons
                    </TabsTrigger>
                    <TabsTrigger value="overview" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                      <Calendar size={16} className="mr-2" />
                      Overview
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="videos" className="mt-0">
                  <ProgramOverview />
                </TabsContent>

                <TabsContent value="overview" className="mt-0">
                  <div className="space-y-6">
                    {programs.map((program) => (
                      <div
                        key={program.id}
                        className="bg-background rounded-2xl border border-border overflow-hidden hover:shadow-soft transition-all"
                      >
                        <div className="bg-gradient-warm p-6">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <div className="text-xs font-sans font-semibold text-primary mb-2">
                                {program.months}
                              </div>
                              <h3 className="font-serif font-semibold text-2xl mb-2 text-foreground">
                                {program.title}
                              </h3>
                              <p className="text-sm text-muted-foreground font-sans mb-3">
                                <strong>Focus:</strong> {program.focus}
                              </p>
                              <p className="text-sm italic text-foreground/80 font-sans">
                                "{program.quote}"
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 p-6">
                          {program.modules.map((module, idx) => (
                            <div key={idx} className="p-4 bg-card rounded-xl border border-border">
                              <div className="text-xs font-sans font-semibold text-gold mb-2">
                                {module.name}
                              </div>
                              <h4 className="font-serif font-semibold text-base mb-2">
                                {module.title}
                              </h4>
                              <p className="text-xs text-muted-foreground font-sans">
                                {module.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Additional Resilient Hubs */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                Additional <span className="text-gradient-gold">Resilient Hubs</span>
              </h2>
              <p className="text-muted-foreground font-sans">
                Specialized programs for specific challenges
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Link
                to="/endometriosis-hub"
                className="block bg-background rounded-2xl p-8 border border-border hover:shadow-soft transition-all group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-serif font-semibold mb-3 group-hover:text-gold transition-colors">
                      Navigating Expat Life with Endometriosis & Chronic Pain
                    </h3>
                    <p className="text-muted-foreground font-sans mb-4">
                      Specialized support for women managing chronic conditions like endometriosis while living abroad. Focus on nervous system regulation, emotional resilience, and identity integrity.
                    </p>
                    <ul className="space-y-2 mb-4">
                      {[
                        "1 hour individual session",
                        "1 hour Reiki treatment",
                        "Art Therapy tool kit for chronic pain",
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-3xl font-serif font-bold text-gold mb-2">€147</div>
                    <div className="text-xs text-muted-foreground">One-time fee</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary font-sans font-medium group-hover:underline">
                  Learn more
                  <ArrowRight size={18} />
                </div>
              </Link>
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
