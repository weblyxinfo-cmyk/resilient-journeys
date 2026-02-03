import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgramOverview from "@/components/ProgramOverview";
import { Check, Sparkles, Download, ArrowRight, Heart, Brain, Users, Globe, Crown, Star, Zap, Video, FileText, Headphones, Shield, Clock, ChevronDown, MessageCircle, Palette, Activity } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import PricingCards, { PricingTrustSignals } from "@/components/PricingCards";

const ResilientHubs = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Who is this program for?",
      a: "This program is designed specifically for expatriates — people living abroad who face unique challenges like cultural displacement, loneliness, identity shifts, and building a new life far from home. Whether you just moved or have lived abroad for years, this program meets you where you are."
    },
    {
      q: "How much time do I need per week?",
      a: "Each weekly session takes about 15–30 minutes. The video lessons are 10–15 minutes, and the workbook exercises can be done at your own pace. Everything is on-demand — no live schedules to worry about."
    },
    {
      q: "What's the difference between Basic and Premium?",
      a: "Basic gives you the foundational module each month — perfect for self-guided learners. Premium unlocks all modules (A, B, C), gives you 4 hours of personal consultations with Silvie, an art therapy materials kit, and access to all Specialized Hubs. It's the full transformation experience."
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes, absolutely. Monthly plans can be cancelled anytime with no penalties. Yearly plans are a one-time payment with full access for 12 months."
    },
    {
      q: "Do I need any prior experience with therapy or art?",
      a: "Not at all! The techniques are designed for beginners. EFT tapping, art therapy exercises, and guided meditations are all explained step-by-step. You don't need to be 'artistic' — the creative exercises are about expression, not perfection."
    },
    {
      q: "What if I'm not sure it's right for me?",
      a: "Download our free guide first — it includes 3 of our core techniques so you can experience the approach before committing. You'll know within minutes if this resonates with you."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="12-Month Membership Program to Inner Strength | Resilient Mind"
        description="Join a 12-month guided program with video lessons, workbooks and community support designed for expatriates seeking inner strength. From €27/month."
        path="/resilient-hubs"
      />
      <Navbar />

      <main className="pt-20">
        {/* Hero Section — Emotional hook */}
        <PageHero>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm font-sans font-medium text-primary">
                For Expats Ready to Thrive
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-6" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
              Stop Surviving Abroad.
              <br />
              <span className="text-gradient-gold">Start Thriving.</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/85 font-sans leading-relaxed mb-4 max-w-3xl mx-auto">
              A 12-month guided program that transforms the loneliness, uncertainty, and cultural stress of expat life into your greatest strengths.
            </p>

            <p className="text-base text-muted-foreground font-sans mb-8 max-w-2xl mx-auto">
              Created by Silvie — an expatriate of 13+ years who turned her own struggles into a proven methodology combining EFT, art therapy, and energy work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all hover:scale-105"
              >
                See Plans & Pricing
                <ArrowRight size={18} />
              </a>
              <Link
                to="/free-guide"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card/80 backdrop-blur-sm border border-border text-foreground font-sans font-medium rounded-full hover:bg-card transition-all"
              >
                <Download size={18} />
                Try Free Guide First
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-8 text-sm text-foreground/70">
              <span className="flex items-center gap-1.5"><Video size={14} className="text-primary" /> 48 video lessons</span>
              <span className="flex items-center gap-1.5"><FileText size={14} className="text-primary" /> 48 workbooks</span>
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> 15 min/week</span>
            </div>
          </div>
        </PageHero>

        {/* Pain Points — "Does this sound like you?" */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4 text-center">
                Does This Sound Like You?
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12 max-w-2xl mx-auto">
                If you're nodding to any of these, this program was built for you.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "You feel like you don't fully belong — not here, not back home",
                  "Loneliness hits you at unexpected moments, even in a crowd",
                  "You struggle to explain what you're going through to people who haven't lived abroad",
                  "Cultural differences exhaust you — small things feel overwhelming",
                  "You miss your support network and feel isolated in health challenges",
                  "You've lost parts of your identity and don't know who you're becoming",
                ].map((pain, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border/50">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={14} className="text-primary" />
                    </div>
                    <span className="text-foreground/90 font-sans text-sm leading-relaxed">{pain}</span>
                  </div>
                ))}
              </div>

              <div className="text-center mt-10">
                <p className="text-lg font-serif text-foreground/80 italic max-w-2xl mx-auto">
                  "You don't need to figure this out alone. I've been exactly where you are — and I built this program to be the guide I wished I had."
                </p>
                <p className="text-sm text-primary font-sans font-medium mt-3">— Silvie, Founder</p>
              </div>
            </div>
          </div>
        </section>

        {/* What You Get — The Transformation */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  Your <span className="text-gradient-gold">12-Month Transformation</span>
                </h2>
                <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                  Each month tackles a different dimension of expat resilience. By the end, you'll have an unshakable inner foundation.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                  { icon: Heart, title: "Inner Stability", desc: "Build emotional resilience that doesn't depend on your external circumstances", color: "bg-rose-50 text-rose-600" },
                  { icon: Brain, title: "Stress Management", desc: "Master EFT tapping, Byron Katie's method, and mindfulness for real-world challenges", color: "bg-blue-50 text-blue-600" },
                  { icon: Globe, title: "Cultural Navigation", desc: "Turn cultural differences from a source of stress into a source of strength", color: "bg-emerald-50 text-emerald-600" },
                  { icon: Users, title: "Relationships", desc: "Strengthen bonds with loved ones — both far away and in your new home", color: "bg-amber-50 text-amber-600" },
                  { icon: Palette, title: "Creative Expression", desc: "Process complex emotions through art therapy — no artistic talent needed", color: "bg-purple-50 text-purple-600" },
                  { icon: Activity, title: "Identity & Growth", desc: "Transform your expatriate identity into your greatest asset", color: "bg-teal-50 text-teal-600" },
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-background rounded-2xl border border-border hover:border-primary/30 transition-all hover:shadow-md group">
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <item.icon size={24} />
                    </div>
                    <h3 className="text-lg font-serif font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-sans leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Numbers strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-gradient-warm rounded-2xl">
                {[
                  { num: "48", label: "Video Lessons", sub: "10-15 min each" },
                  { num: "48", label: "Workbooks", sub: "With practical exercises" },
                  { num: "12", label: "Monthly Themes", sub: "Comprehensive journey" },
                  { num: "3", label: "Therapy Methods", sub: "EFT, Art, Meditation" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl md:text-4xl font-serif font-bold text-primary mb-1">{stat.num}</div>
                    <div className="text-sm font-sans font-semibold text-foreground/80">{stat.label}</div>
                    <div className="text-xs font-sans text-muted-foreground">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works — Simple steps */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-12 text-center">
                How It Works
              </h2>

              <div className="space-y-8">
                {[
                  { step: "1", title: "Choose Your Plan", desc: "Pick Basic for self-guided learning or Premium for the full experience with personal consultations and art therapy kit.", icon: Crown },
                  { step: "2", title: "Start This Month's Theme", desc: "Each month, a new module unlocks with video lessons, workbooks, and guided exercises tailored to a specific aspect of resilience.", icon: Video },
                  { step: "3", title: "Practice at Your Own Pace", desc: "Watch 1-2 videos per week (15 min each), complete the workbook exercises, and integrate the techniques into your daily life.", icon: FileText },
                  { step: "4", title: "Transform Over 12 Months", desc: "By month 12, you'll have a complete toolkit of resilience techniques and an unshakable inner foundation — your 'inner home' that travels with you.", icon: Heart },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-gold rounded-2xl flex items-center justify-center shadow-md">
                        <span className="text-xl font-bold text-white">{item.step}</span>
                      </div>
                    </div>
                    <div className="pt-1">
                      <h3 className="text-xl font-serif font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground font-sans leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Program Content Preview */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4 text-center">
                Explore the <span className="text-gradient-gold">Program Content</span>
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-8">
                Preview the monthly video lessons, workbooks, and exercises included in your membership.
              </p>
              <ProgramOverview />
            </div>
          </div>
        </section>

        {/* Why Resilient Mind — Differentiators */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4 text-center">
                Why Resilient Mind Is <span className="text-gradient-gold">Different</span>
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12 max-w-2xl mx-auto">
                This isn't generic self-help. It's a program built from real expatriate experience.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "Built by someone who's lived it", desc: "Silvie has 13+ years of expatriate experience across multiple countries. Every technique in this program was forged in real life — not a textbook.", icon: Globe },
                  { title: "Three proven methods, one program", desc: "We combine EFT tapping (evidence-based stress relief), expressive art therapy (emotional processing), and guided meditation (inner calm) into a single, cohesive journey.", icon: Zap },
                  { title: "Made for busy expat lives", desc: "15 minutes per week. No live schedules. No group calls to coordinate across time zones. Watch when you want, practice at your own pace.", icon: Clock },
                  { title: "Not just coping — transforming", desc: "Other programs teach you to 'manage' challenges. We help you turn uncertainty, cultural stress, and identity shifts into actual sources of strength and growth.", icon: Star },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground font-sans leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 md:py-24 bg-gradient-warm" id="pricing">
          <div className="container px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <Crown size={16} className="text-primary" />
                  <span className="text-sm font-sans font-medium text-primary">Choose Your Path</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  Invest in Your <span className="text-gradient-gold">Transformation</span>
                </h2>
                <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                  Less than the cost of one therapy session per month — with tools you'll use for the rest of your life.
                </p>
              </div>

              <PricingCards cancelUrl="/resilient-hubs" />
              <PricingTrustSignals />

              {/* Free guide nudge */}
              <div className="text-center mt-8">
                <p className="text-sm text-muted-foreground font-sans">
                  💛 Not sure yet? <Link to="/free-guide" className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium">Download our free guide</Link> and experience the program first.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4 text-center">
                Frequently Asked Questions
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12">
                Everything you need to know before starting your journey.
              </p>

              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="border border-border rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                    >
                      <span className="font-sans font-medium text-foreground pr-4">{faq.q}</span>
                      <ChevronDown size={20} className={`text-muted-foreground flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-5 -mt-1">
                        <p className="text-sm text-muted-foreground font-sans leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart size={36} className="text-white" />
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4">
                  Your Inner Strength Goes
                  <br />
                  <span className="text-gradient-gold">Wherever Life Takes You</span>
                </h2>
                <p className="text-lg text-muted-foreground font-sans mb-3 max-w-2xl mx-auto">
                  You moved abroad for a reason. You took one of the bravest steps most people never will. Now it's time to build the resilience that matches your courage.
                </p>
                <p className="text-base text-foreground/80 font-sans italic max-w-xl mx-auto">
                  "The moment I stopped fighting against my expatriate challenges and started transforming them instead, everything changed."
                </p>
                <p className="text-sm text-primary font-sans font-medium mt-2">— Silvie, Founder of Resilient Mind</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all hover:scale-105"
                >
                  Start Your Transformation Today
                  <ArrowRight size={18} />
                </a>
                <Link
                  to="/free-guide"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card border border-border font-sans font-medium rounded-full hover:bg-secondary transition-all"
                >
                  <Download size={18} />
                  Download Free Guide First
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

export default ResilientHubs;
