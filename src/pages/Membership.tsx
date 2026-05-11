import { Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { breadcrumb, faqPage, product } from "@/lib/schema";
import {
  ArrowRight,
  Brain,
  Heart,
  Sun,
  Home,
  Sparkles,
  Hand,
  BookOpen,
  Globe,
  Zap,
  Clock,
  Star,
  ChevronDown,
  Check,
} from "lucide-react";

const Membership = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Who is this program for?",
      a: "Expat women navigating new cultures while staying connected to who they truly are. Women living abroad who feel emotionally stretched or unsupported, seeking grounded tools they can rely on anywhere. Globally mobile women facing constant change and wanting deeper inner stability, confidence, and clarity.",
    },
    {
      q: "How much time do I need?",
      a: "Around 15–30 minutes a day. Video lessons are 10–15 minutes and the workbook exercises are designed to fit into a busy expat life. Everything is on-demand — no live schedules to worry about.",
    },
    {
      q: "What's the difference between Basic and Premium?",
      a: "The Basic Monthly Membership includes one video each week and four weekly workbooks/exercises. The Premium Membership includes everything from the Basic Membership, plus access to the Additional Hub: The Transformed Self and Endometriosis & Chronic Pain, as well as access to the private Skool community.",
    },
    {
      q: "Is this a subscription?",
      a: "No — every purchase is a one-time payment. Monthly plans give you access for 1 month with no auto-renewal. Yearly plans give you full access for 12 months with a 14-day money-back guarantee. You decide when and if you want to continue.",
    },
    {
      q: "Do I need any prior experience with counselling or expressive art?",
      a: "Not at all. These techniques are gentle and beginner-friendly. EFT tapping, expressive creative art practices, and guided meditations are explained step-by-step. You don't need to be \"artistic\" — this is about expression, not perfection.",
    },
    {
      q: "What if I'm not sure it's right for me?",
      a: "You can start with the Basic Monthly plan — it's a one-time payment with no auto-renewal, so you can simply try it for a month and decide if you want to continue. There's no pressure and no commitment.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Resilient Mind Membership — Feel Like Yourself Again | Online Support for Expat Women"
        description="A gentle online membership for expat women who feel overwhelmed, disconnected, or not quite themselves. EFT tapping, expressive arts and nervous system regulation — feel calm, grounded, and at home within."
        path="/membership"
        keywords="expat women membership, EFT for expats, expat emotional support, feel like yourself abroad, nervous system regulation, expat loneliness, online therapy membership"
        jsonLd={[
          breadcrumb([
            { name: "Home", path: "/" },
            { name: "Membership", path: "/membership" },
          ]),
          product({
            name: "Resilient Mind Membership",
            description:
              "A gentle, structured online membership for expat women combining EFT tapping, expressive art therapy, nervous system regulation, and reflective workbooks. Pay as you go, cancel anytime.",
            url: "https://resilientmind.io/membership",
            offers: [
              {
                name: "Basic Monthly",
                price: "37",
                url: "https://resilientmind.io/pricing",
              },
              {
                name: "Premium Monthly",
                price: "47",
                url: "https://resilientmind.io/pricing",
              },
            ],
          }),
          faqPage(faqs),
        ]}
      />
      <Navbar />

      <main className="pt-20">
        {/* 1. HERO — split layout: text left + photo right */}
        <PageHero>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
            {/* LEFT — text content */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Sparkles size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  Resilient Mind Membership
                </span>
              </div>

              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-5 leading-tight"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
              >
                You moved abroad…<br />
                so why do you still <span className="text-gradient-gold">feel off?</span>
              </h1>

              <p className="text-lg md:text-xl text-foreground/85 font-sans leading-relaxed mb-3 italic">
                Stop feeling overwhelmed and start feeling like <em>yourself</em> again.
              </p>

              <p className="text-base text-muted-foreground font-sans mb-8">
                Feel like yourself again.
              </p>

              {/* 4 mini-benefit pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Brain, label: "Understand your patterns" },
                  { icon: Heart, label: "Regulate emotions" },
                  { icon: Sun, label: "Create inner stability" },
                  { icon: Home, label: "Feel at home within yourself" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <item.icon size={22} className="text-primary" />
                    </div>
                    <span className="text-xs font-sans text-foreground/80 leading-tight text-center">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center md:items-start gap-2">
                <a
                  href="#offer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all hover:scale-105"
                >
                  Start your journey now
                  <ArrowRight size={18} />
                </a>
                <p className="text-xs text-muted-foreground font-sans">
                  Pay as you go · Cancel anytime
                </p>
              </div>
            </div>

            {/* RIGHT — hero photo */}
            <div className="relative order-first md:order-last">
              <img
                src="/membership-hero-photo.jpg"
                alt="A woman writing in her journal, reconnecting with herself while living abroad"
                className="w-full h-auto rounded-2xl shadow-elevated"
                loading="eager"
              />
            </div>
          </div>
        </PageHero>

        {/* 2. PROBLEM */}
        <section className="py-16 md:py-20 bg-card">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-6">
                You thought moving abroad would feel exciting…
              </h2>
              <p className="text-lg md:text-xl text-foreground/85 font-sans leading-relaxed mb-6">
                …but instead, something feels off.
              </p>
              <p className="text-base md:text-lg text-foreground/80 font-sans leading-relaxed">
                You feel disconnected, overwhelmed, or not quite like yourself. Your emotions are all over the place. And no matter where you are… it doesn't fully feel like home.
              </p>
            </div>
          </div>
        </section>

        {/* 3. EMPATHY */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-6">
                Moving abroad is a big emotional shift.
              </h2>
              <p className="text-base md:text-lg text-foreground/80 font-sans leading-relaxed">
                Even when everything looks "right" on the outside, it's completely normal to feel lost, anxious, or disconnected inside.
              </p>
            </div>
          </div>
        </section>

        {/* 4. SOLUTION */}
        <section className="py-16 md:py-20 bg-card">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-6">
                A <span className="text-gradient-gold">gentle, step-by-step space</span> to help you reconnect with yourself again
              </h2>
              <p className="text-lg text-foreground/80 font-sans leading-relaxed">
                A place where you can slow down, understand what's happening inside you, and start feeling grounded and stable again.
              </p>
            </div>
          </div>
        </section>

        {/* 5. WHAT YOU GET */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  Inside, you'll receive simple, <span className="text-gradient-gold">supportive tools</span>
                </h2>
                <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                  Everything is designed to fit into your real life abroad — no pressure, just support.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Hand,
                    title: "EFT tapping & expressive creative art",
                    desc: "Practical techniques to calm your nervous system and gently process what you're feeling.",
                  },
                  {
                    icon: Heart,
                    title: "Guided practices",
                    desc: "Audio and video sessions to help you regulate your emotions, day by day.",
                  },
                  {
                    icon: BookOpen,
                    title: "A workbook to reconnect with yourself",
                    desc: "Reflective exercises that help you understand your patterns and come home to who you are.",
                  },
                  {
                    icon: Clock,
                    title: "A gentle structure at your own pace",
                    desc: "On-demand lessons you can follow whenever life allows — no schedules, no pressure.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-semibold mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. BENEFITS */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-10 text-center">
                What this looks like in <span className="text-gradient-gold">your everyday life</span>
              </h2>

              <ul className="space-y-4">
                {[
                  "Recognise your patterns and respond instead of react.",
                  "Calm your nervous system and feel more in control of your emotions.",
                  "Create lasting inner stability, even during uncertain times.",
                  "Feel grounded, safe, and at home within yourself — wherever you are.",
                ].map((benefit, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 p-5 bg-background rounded-xl border border-border/50"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={16} className="text-primary" />
                    </div>
                    <span className="text-base md:text-lg font-sans text-foreground/85 leading-relaxed">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 7. TRANSFORMATION — Before / After */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  From feeling lost to feeling like <em className="text-gradient-gold not-italic">yourself</em> again
                </h2>
                <p className="text-base md:text-lg text-foreground/80 font-sans max-w-2xl mx-auto leading-relaxed">
                  Resilient Mind is a gentle space to help expat women feel stable, grounded, and at home within themselves.
                </p>
              </div>

              <div className="max-w-5xl mx-auto mb-8 rounded-2xl overflow-hidden shadow-elevated">
                <img
                  src="/membership-transformation.jpg"
                  alt="From feeling lost to feeling like yourself again — a visualization of the inner transformation"
                  className="w-full h-auto block"
                  loading="lazy"
                />
              </div>

              <p className="text-center text-base md:text-lg text-foreground/80 font-sans italic max-w-2xl mx-auto leading-relaxed">
                Instead of feeling overwhelmed and disconnected, you begin to feel calm, grounded, and like yourself again.
              </p>
            </div>
          </div>
        </section>

        {/* 8. ABOUT / BRIDGE */}
        <section className="py-16 md:py-20 bg-card">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-base md:text-lg text-foreground/85 font-sans leading-relaxed mb-6">
                Created for expat women who feel overwhelmed or disconnected, and are ready to reconnect with themselves, understand their inner patterns, and build a sense of calm, resilience, and home within — wherever they are in the world.
              </p>
              <p className="text-base text-muted-foreground font-sans leading-relaxed mb-8">
                Developed by <span className="text-foreground font-medium">Silvie</span>, an expatriate of 13+ years, this approach blends lived experience with personal development, expressive arts, and holistic therapies — creating a supportive, practical path to navigate life abroad with greater ease and inner stability.
              </p>
              <a
                href="#offer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all hover:scale-105"
              >
                See Plans &amp; Pricing
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>

        {/* 9. OFFER */}
        <section id="offer" className="py-16 md:py-24 bg-gradient-warm">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  Choose your <span className="text-gradient-gold">path</span>
                </h2>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-sm font-sans">
                  {["Pay as you go", "Cancel anytime", "No pressure — just support"].map(
                    (text, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-2 text-foreground/80"
                      >
                        <Check size={14} className="text-primary" />
                        {text}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic */}
                <div className="p-8 bg-card rounded-2xl border border-border flex flex-col">
                  <h3 className="text-xl font-serif font-semibold mb-2">Basic</h3>
                  <p className="text-sm text-muted-foreground font-sans mb-6">
                    Self-paced guidance you can follow in your own time.
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-serif font-bold text-foreground">€37</span>
                    <span className="text-sm text-muted-foreground font-sans"> /month</span>
                  </div>
                  <ul className="space-y-2 mb-8 flex-1">
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>4 weekly videos</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>4 weekly workbooks &amp; reflective exercises</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>Guided meditations</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>Unlocks one month at a time</span>
                    </li>
                  </ul>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-card border border-primary/30 text-primary font-sans font-medium rounded-full hover:bg-primary/5 transition-all"
                  >
                    Start Basic Monthly
                  </Link>
                </div>

                {/* Premium */}
                <div className="p-8 bg-card rounded-2xl border-2 border-primary/40 flex flex-col relative shadow-md">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-gold text-primary-foreground rounded-full text-xs font-sans font-semibold">
                    Most Popular
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-2">Premium</h3>
                  <p className="text-sm text-muted-foreground font-sans mb-6">
                    Everything in Basic, plus a private community of like-minded women on the same path.
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-serif font-bold text-foreground">€47</span>
                    <span className="text-sm text-muted-foreground font-sans"> /month</span>
                  </div>
                  <ul className="space-y-2 mb-8 flex-1">
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>Everything in Basic</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>Access to the private Skool community</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>Additional Hub: The Transformed Self</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>Additional Hub: Navigating Expat Life with Chronic Pain</span>
                    </li>
                  </ul>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all"
                  >
                    Go Premium Monthly
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="text-center mt-10">
                <Link
                  to="/resilient-hubs"
                  className="text-sm text-primary font-sans underline underline-offset-4 hover:text-primary/80"
                >
                  Explore the full 12-month Membership
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 10. WHY DIFFERENT — preserved from /resilient-hubs */}
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
                  {
                    title: "Built by someone who's lived it",
                    desc: "Silvie has 13+ years of expatriate experience across multiple countries. Every technique in this program was forged in real life — not a textbook.",
                    icon: Globe,
                  },
                  {
                    title: "Three proven methods, one program",
                    desc: "We combine EFT tapping (evidence-based stress relief), expressive art therapy (emotional processing), and guided meditation (inner calm) into a single, cohesive journey.",
                    icon: Zap,
                  },
                  {
                    title: "Made for busy expat lives",
                    desc: "15–30 minutes daily. No live schedules. Group calls included with Premium membership. Watch when you want, practice at your own pace.",
                    icon: Clock,
                  },
                  {
                    title: "Not just coping — transforming",
                    desc: "Other programs teach you to 'manage' challenges. We help you turn uncertainty, cultural stress, and identity shifts into actual sources of strength and growth.",
                    icon: Star,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 11. FAQ — preserved from /resilient-hubs */}
        <section className="py-16 md:py-24 bg-card">
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
                    className="border border-border rounded-xl overflow-hidden bg-background"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                    >
                      <span className="font-sans font-medium text-foreground pr-4">
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-muted-foreground flex-shrink-0 transition-transform ${
                          openFaq === i ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-5 -mt-1">
                        <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 12. FINAL CTA */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={36} className="text-white" />
              </div>
              <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4">
                Ready to feel like
                <br />
                <span className="text-gradient-gold">yourself</span> again?
              </h2>
              <p className="text-base md:text-lg text-muted-foreground font-sans mb-8 max-w-2xl mx-auto">
                Take the first gentle step today. No pressure — just support.
              </p>
              <a
                href="#offer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all hover:scale-105"
              >
                Start your journey
                <ArrowRight size={18} />
              </a>
              <p className="text-xs text-muted-foreground font-sans mt-4">
                Pay as you go · Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Membership;
