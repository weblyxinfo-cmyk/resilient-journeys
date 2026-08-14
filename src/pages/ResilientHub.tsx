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
import { breadcrumb, course, service } from "@/lib/schema";
import { useCms } from "@/hooks/useCms";

const ResilientHub = () => {
  const location = useLocation();
  const { t } = useCms();

  // Icons and ids stay in code; every string is editable in the admin.
  const programs = [
    {
      id: 1,
      title: t("hub_program_q1_title", "Adaptation in a Foreign Country"),
      months: t("hub_program_q1_months", "Months 1-3"),
      focus: t("hub_program_q1_focus", "Nervous system regulation, daily safety rituals, inner home, identity beyond location"),
      quote: t("hub_program_q1_quote", "Fear doesn't mean I made a mistake – it means I left the familiar."),
      modules: [
        {
          name: t("hub_program_q1_module_1_name", "1st Month"),
          title: t("hub_program_q1_module_1_title", "First Steps: Finding Solid Ground When Everything is New"),
          description: t("hub_program_q1_module_1_description", "Practical techniques for calming your nervous system while navigating cultural differences, building daily certainty in an unfamiliar environment.")
        },
        {
          name: t("hub_program_q1_module_2_name", "2nd Month"),
          title: t("hub_program_q1_module_2_title", "Creating Your New Roots: Identity Beyond Borders"),
          description: t("hub_program_q1_module_2_description", "The profound process of identity transformation during cultural transition. Practical steps for creating an 'inner home' that remains stable regardless of geographic location.")
        },
        {
          name: t("hub_program_q1_module_3_name", "3rd Month"),
          title: t("hub_program_q1_module_3_title", "The Integration Path: Becoming Part of Your New World"),
          description: t("hub_program_q1_module_3_description", "The art of balancing preservation of your cultural identity while opening to new ways of being across cultural differences.")
        }
      ]
    },
    {
      id: 2,
      title: t("hub_program_q2_title", "Navigating Inner Landscapes: From Loneliness to Self-Discovery"),
      months: t("hub_program_q2_months", "Months 4-6"),
      focus: t("hub_program_q2_focus", "Loneliness, emotional phases, identity collapse and reconstruction, purpose, vision"),
      quote: t("hub_program_q2_quote", "I am not broken – I am in transition."),
      modules: [
        {
          name: t("hub_program_q2_module_1_name", "4th Month"),
          title: t("hub_program_q2_module_1_title", "The Emotional Terrain of Expatriation: You Are Not Alone"),
          description: t("hub_program_q2_module_1_description", "Uncovering the hidden emotional phases most expats experience. Practical techniques for transforming isolation into deeper self-knowledge.")
        },
        {
          name: t("hub_program_q2_module_2_name", "5th Month"),
          title: t("hub_program_q2_module_2_title", "Reclaiming Your Authentic Self: Identity Beyond Cultural Labels"),
          description: t("hub_program_q2_module_2_description", "Discovering new dimensions of your identity that awaken only through living between cultures. Transformational work with the Byron Katie method.")
        },
        {
          name: t("hub_program_q2_module_3_name", "6th Month"),
          title: t("hub_program_q2_module_3_title", "Soul Alignment: Finding Meaning in Your Expat Journey"),
          description: t("hub_program_q2_module_3_description", "Revealing the hidden meaning and purpose behind your expatriation journey through intuitive practices.")
        }
      ]
    },
    {
      id: 3,
      title: t("hub_program_q3_title", "Financial Freedom Abroad: Navigate Financial Uncertainty with Ease"),
      months: t("hub_program_q3_months", "Months 7-9"),
      focus: t("hub_program_q3_focus", "Money beliefs, self-trust, financial calm, opportunity awareness, intuitive decisions"),
      quote: t("hub_program_q3_quote", "I don't rely on certainty—I rely on my own inner guidance."),
      modules: [
        {
          name: t("hub_program_q3_module_1_name", "7th Month"),
          title: t("hub_program_q3_module_1_title", "Money Energy Mastery: Uncovering Your Expat Money Story"),
          description: t("hub_program_q3_module_1_description", "Practical techniques for identifying inherited money beliefs, understanding how your financial mindset shifts when navigating different cultural money values.")
        },
        {
          name: t("hub_program_q3_module_2_name", "8th Month"),
          title: t("hub_program_q3_module_2_title", "Trust & Abundance: Creating Financial Security Anywhere"),
          description: t("hub_program_q3_module_2_description", "Building inner certainty independent of external circumstances, how to develop trust in yourself and your ability to thrive in any environment.")
        },
        {
          name: t("hub_program_q3_module_3_name", "9th Month"),
          title: t("hub_program_q3_module_3_title", "Prosperity Consciousness: Living in Alignment with Abundance"),
          description: t("hub_program_q3_module_3_description", "Creating a personal manifestation process for attracting opportunities, techniques for recognizing and utilizing hidden financial opportunities.")
        }
      ]
    },
    {
      id: 4,
      title: t("hub_program_q4_title", "Life Beyond Family Borders: Redefining Family When Worlds Apart"),
      months: t("hub_program_q4_months", "Months 10-12"),
      focus: t("hub_program_q4_focus", "Guilt release, emotional closeness, building authentic community, integration, life vision"),
      quote: t("hub_program_q4_quote", "Belonging isn't found, it's created—through your courageous presence, the seeds of trust, and the daily tending of meaningful connections."),
      modules: [
        {
          name: t("hub_program_q4_module_1_name", "10th Month"),
          title: t("hub_program_q4_module_1_title", "Heart Bridges: Nurturing Love Across Distances"),
          description: t("hub_program_q4_module_1_description", "Rituals for maintaining deep emotional closeness despite physical distance, creative ways of sharing life beyond texts and calls.")
        },
        {
          name: t("hub_program_q4_module_2_name", "11th Month"),
          title: t("hub_program_q4_module_2_title", "Soul Family: Creating Your Tribe in a New Land"),
          description: t("hub_program_q4_module_2_description", "Strategies for finding authentic friendships in a foreign environment, recognizing potential 'kindred spirits,' courage to be vulnerable.")
        },
        {
          name: t("hub_program_q4_module_3_name", "12th Month"),
          title: t("hub_program_q4_module_3_title", "The Integrated Self: Embracing Your Multi-Dimensional Life"),
          description: t("hub_program_q4_module_3_description", "The culmination of your transformation journey, where separate skills integrate into your new resilient identity.")
        }
      ]
    }
  ];

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
        title="Resilient Hub — A Guided 12-Month Membership for Expat Women | Resilient Mind"
        description="A structured 12-month online membership combining EFT, nervous system regulation and reflective tools. Monthly themes, video lessons, and guided practices to support your emotional wellbeing while living abroad."
        path="/resilient-hub"
        keywords="12-month membership, expat women, EFT tapping, nervous system regulation, expressive art therapy, expatriate wellbeing, online program for expats"
        jsonLd={[
          breadcrumb([
            { name: "Home", path: "/" },
            { name: "Resilient Hub", path: "/resilient-hub" },
          ]),
          service({
            name: "Resilient Hub — 12-month Membership",
            description:
              "A structured 12-month online membership combining EFT (Emotional Freedom Techniques), nervous system regulation practices and reflective tools to support emotional wellbeing while living abroad.",
            url: "https://resilientmind.io/resilient-hub",
            serviceType: "Online membership program",
          }),
          course({
            name: "Resilient Hub — 12-Month Program for Expat Women",
            description:
              "A 12-month structured program combining EFT, expressive arts, guided meditation and nervous system regulation. Monthly themes covering loneliness, cultural stress, identity, financial uncertainty, boundaries, and emotional stability.",
            url: "https://resilientmind.io/resilient-hub",
          }),
        ]}
      />
      <Navbar />
      
      <main className="pt-20">
        {/* Hero */}
        <PageHero>
            <div id="cms-hub-hero" className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Sparkles size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  {t("hub_hero_badge", "Building Resilient Mind")}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-semibold mb-6">
                <span className="text-gradient-gold">{t("hub_hero_title", "A guided 12-month membership")}</span>
                <br />{t("hub_hero_title_line2", "for expat women")}
              </h1>

              <p className="text-lg text-foreground/90 font-sans mb-8 max-w-3xl mx-auto leading-relaxed">
                {t("hub_hero_subtitle", "Supporting your emotional wellbeing, helping you regulate your nervous system and build inner stability while living abroad.")}
              </p>

              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all"
              >
                {t("hub_hero_cta", "Start Your Journey")}
              </button>
            </div>
        </PageHero>

        {/* Intro video from Silvie */}
        <section id="cms-hub-intro_video" className="py-12 md:py-16 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <div className="relative w-full overflow-hidden rounded-2xl border border-border shadow-soft" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={t("hub_intro_video", "https://www.youtube.com/embed/O2plWw__ciY")}
                  title="Resilient Hub — A message from Silvie"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* What if resilience... */}
        <section id="cms-hub-intro" className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-8 italic text-foreground/90 leading-relaxed">
                {t("hub_intro_question", "What if resilience wasn't about pushing harder — but about learning how to care for your mind and nervous system, step by step?")}
              </h2>
              <p className="text-lg text-foreground/85 font-sans leading-relaxed mb-6">
                {t("hub_intro_text_1_prefix", "Inside ")}<strong className="text-foreground">{t("hub_intro_text_1_highlight", "Resilient Hub")}</strong>{t("hub_intro_text_1_suffix", ", you learn how to care for your mind and nervous system — step by step.")}
              </p>
              <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-8">
                {t("hub_intro_text_2", "Resilient Hub is built on a simple idea: you don't need more information — you need practical tools you can actually use when life feels overwhelming.")}
              </p>
              <div className="text-left max-w-2xl mx-auto mb-8">
                <p className="text-base text-foreground/80 font-sans mb-4">
                  {t("hub_intro_list_label", "Instead of trying to \"fix yourself,\" you begin to:")}
                </p>
                <ul className="space-y-3">
                  {[
                    t("hub_intro_item_1", "Understand your reactions"),
                    t("hub_intro_item_2", "Regulate stress and emotions"),
                    t("hub_intro_item_3", "Build self-awareness and confidence"),
                    t("hub_intro_item_4", "Respond to challenges with more calm and clarity"),
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Check size={12} className="text-primary" />
                      </div>
                      <span className="text-foreground/85 font-sans">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-base md:text-lg text-foreground/85 font-sans font-medium italic">
                {t("hub_intro_closing", "This is where resilience becomes something you practise, not something you force.")}
              </p>
            </div>
          </div>
        </section>

        {/* What is Resilient Hub? */}
        <section id="cms-hub-what" className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-8">
                {t("hub_what_title_prefix", "What is ")}<span className="text-gradient-gold">{t("hub_what_title_highlight", "Resilient Hub?")}</span>
              </h2>
              <p className="text-lg text-foreground/85 font-sans leading-relaxed mb-6">
                {t("hub_what_text_1", "Resilient Hub is a structured 12-month online membership combining EFT (Emotional Freedom Techniques), nervous system regulation practices and reflective tools to support your emotional wellbeing while living abroad.")}
              </p>
              <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-6">
                {t("hub_what_text_2", "Living abroad can be enriching, but it can also bring loneliness, uncertainty and emotional challenges.")}
              </p>
              <p className="text-lg text-foreground/85 font-sans leading-relaxed mb-10">
                {t("hub_what_text_3", "Resilient Hub was created to offer steady support, practical tools and a gentle structure to help you feel more grounded and at home within yourself.")}
              </p>

              <div className="text-left max-w-md mx-auto">
                <p className="text-lg font-sans font-semibold text-foreground mb-3">{t("hub_what_list_label", "This is for you if:")}</p>
                <ul className="space-y-2 text-muted-foreground font-sans">
                  <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span> {t("hub_what_item_1", "you live abroad and feel emotionally overwhelmed")}</li>
                  <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span> {t("hub_what_item_2", "you miss stability and inner safety")}</li>
                  <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span> {t("hub_what_item_3", "you want gentle, practical tools")}</li>
                  <li className="flex items-start gap-2"><span className="text-gold mt-1">•</span> {t("hub_what_item_4", "you value continuity over quick fixes")}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section id="cms-hub-receive" className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-12 text-center">
                {t("hub_receive_title", "What You Will Receive")}
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Video, title: t("hub_receive_1_title", "4 Video Lessons"), desc: t("hub_receive_1_desc", "Each month") },
                  { icon: Download, title: t("hub_receive_2_title", "Worksheets"), desc: t("hub_receive_2_desc", "Printable PDFs") },
                  { icon: BookOpen, title: t("hub_receive_3_title", "Meditation"), desc: t("hub_receive_3_desc", "Guided audio") },
                  { icon: Users, title: t("hub_receive_4_title", "Community"), desc: t("hub_receive_4_desc", "Private access") },
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
        <section id="cms-hub-program" className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <Tabs defaultValue="videos" className="w-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                      <Play size={16} className="text-primary" />
                      <span className="text-sm font-sans font-medium text-primary">
                        {t("hub_program_badge", "Program Content")}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-serif font-semibold">
                      {t("hub_program_title", "12 Months, 12 Pillars of Resilience")}
                    </h2>
                  </div>

                  <TabsList className="bg-cream-dark/50 self-start">
                    <TabsTrigger value="videos" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                      <Video size={16} className="mr-2" />
                      {t("hub_program_tab_videos", "Video Lessons")}
                    </TabsTrigger>
                    <TabsTrigger value="overview" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                      <Calendar size={16} className="mr-2" />
                      {t("hub_program_tab_overview", "Overview")}
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
        <section id="cms-hub-additional" className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Sparkles size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  {t("hub_additional_badge", "Premium Membership Bonus")}
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                {t("hub_additional_title_prefix", "Additional ")}<span className="text-gradient-gold">{t("hub_additional_title_highlight", "Resilient Hubs")}</span>
              </h2>
              <p className="text-muted-foreground font-sans max-w-2xl mx-auto mb-3">
                {t("hub_additional_subtitle", "Specialized modules that go beyond the core 12-month program. These additional hubs are included in the Premium Membership at no extra cost.")}
              </p>
              <p className="text-sm text-muted-foreground/80 font-sans max-w-2xl mx-auto">
                {t("hub_additional_note", "Each additional hub contains 2 specialized video lessons and 2 workbooks with reflective exercises.")}
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6 mt-12">
              {/* The Transformed Self */}
              <div className="bg-background rounded-2xl border border-border overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-serif font-semibold mb-1">
                        {t("hub_additional_1_title", "The Transformed Self: Carrying Your Strength Across Borders")}
                      </h3>
                      <p className="text-sm italic text-foreground/70 font-sans">
                        "{t("hub_additional_1_quote", "My journey makes sense when I stop judging the timeline.")}"
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground font-sans mb-5 leading-relaxed">
                    {t("hub_additional_1_description", "Recognizing the profound inner transformation that occurs through expatriation challenges. Embracing your newfound resilience, courage and boundary-setting abilities as permanent aspects of your identity. Honoring how difficult moments shaped your capacity for gratitude and appreciation of everyday joys. Developing a global mindset that sees possibilities rather than obstacles in new beginnings. Creating a personal manifesto that anchors your hard-won wisdom as you navigate future transitions with confidence.")}
                  </p>

                  <div className="flex flex-wrap gap-4 mb-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Video size={16} className="text-primary" />
                      <span>{t("hub_additional_videos_label", "2 specialized videos")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen size={16} className="text-primary" />
                      <span>{t("hub_additional_workbooks_label", "2 workbooks")}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-warm rounded-xl p-4">
                    <p className="text-sm font-sans">
                      <span className="font-semibold text-foreground">{t("hub_additional_outcome_label", "Outcome:")}</span>{" "}
                      <span className="text-foreground/80">{t("hub_additional_1_outcome_text", "You carry resilience, clarity, and self-trust into any future transition.")}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Endometriosis & Chronic Pain */}
              <div className="bg-background rounded-2xl border border-border overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-serif font-semibold mb-1">
                        {t("hub_additional_2_title", "Navigating Expat Life with Endometriosis & Chronic Pain")}
                      </h3>
                      <p className="text-sm italic text-foreground/70 font-sans">
                        {t("hub_additional_2_quote", "This optional module is not a medical or therapeutic treatment.")}
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground font-sans mb-5 leading-relaxed">
                    {t("hub_additional_2_description", "Designed for women living abroad while managing endometriosis or chronic pain. The focus is on nervous system regulation, emotional resilience, self-trust, and identity integrity while living with pain.")}
                  </p>

                  <div className="flex flex-wrap gap-4 mb-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Video size={16} className="text-primary" />
                      <span>{t("hub_additional_videos_label", "2 specialized videos")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen size={16} className="text-primary" />
                      <span>{t("hub_additional_workbooks_label", "2 workbooks")}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-warm rounded-xl p-4">
                    <p className="text-sm font-sans">
                      <span className="font-semibold text-foreground">{t("hub_additional_outcome_label", "Outcome:")}</span>{" "}
                      <span className="text-foreground/80">{t("hub_additional_2_outcome_text", "You navigate life abroad with chronic pain from a place of inner stability and self-compassion.")}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary note */}
            <div className="max-w-4xl mx-auto mt-10 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-warm rounded-full">
                <Video size={16} className="text-primary" />
                <span className="text-sm font-sans text-foreground/80">
                  <span className="font-semibold">{t("hub_additional_summary_count", "52 video lessons in total")}</span>{t("hub_additional_summary_detail", " — 48 core program + 4 from Additional Hubs")}
                </span>
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
