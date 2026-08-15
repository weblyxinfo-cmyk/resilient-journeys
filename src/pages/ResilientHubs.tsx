import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgramOverview from "@/components/ProgramOverview";
import { Check, Sparkles, Download, ArrowRight, Heart, Brain, Users, Globe, Crown, Star, Zap, Video, FileText, Headphones, Shield, Clock, ChevronDown, MessageCircle, Palette, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import PricingCards, { PricingTrustSignals } from "@/components/PricingCards";
import { useCms } from "@/hooks/useCms";
import { useFaqItems, FaqItem } from "@/hooks/useFaqItems";

const scrollToPricing = (e?: React.MouseEvent) => {
  if (e) e.preventDefault();
  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
};

// Fallback for useFaqItems('hubs', ...) — the array this page shipped with
// before the FAQ moved into the faq_items table.
const fallbackFaqs: FaqItem[] = [
  {
    q: "Who is this program for?",
    a: "Expat women navigating new cultures while staying connected to who they truly are. Women living abroad who feel emotionally stretched or unsupported, seeking grounded tools they can rely on anywhere. Globally mobile women facing constant change and wanting deeper inner stability, confidence, and clarity."
  },
  {
    q: "How much time do I need per week?",
    a: "Each weekly session takes about 15–30 minutes. The video lessons are 10–15 minutes, and the workbook exercises can be done at your own pace. Everything is on-demand — no live schedules to worry about."
  },
  {
    q: "What's the difference between Basic and Premium?",
    a: "The Basic Monthly Membership includes one video each week and four weekly workbooks/exercises. The Premium Membership includes everything from the Basic Membership, plus access to the Additional Hub: The Transformed Self and Endometriosis & Chronic Pain, as well as access to the private Skool community."
  },
  {
    q: "Is this a subscription?",
    a: "No — every purchase is a one-time payment. Monthly plans give you access for 1 month with no auto-renewal. Yearly plans give you full access for 12 months with a 14-day money-back guarantee. You decide when and if you want to continue."
  },
  {
    q: "Do I need any prior experience with counselling or expressive art?",
    a: "Not at all. These techniques are gentle and beginner-friendly. EFT tapping, expressive creative art practices, and guided meditations are explained step-by-step. You don't need to be \"artistic\" — this is about expression, not perfection."
  },
  {
    q: "What if I'm not sure it's right for me?",
    a: "Download our free guide first — it includes 3 of our core techniques so you can experience the approach before committing. You'll know within minutes if this resonates with you."
  },
];

const ResilientHubs = () => {
  const { t } = useCms();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const location = useLocation();
  const faqs = useFaqItems('hubs', fallbackFaqs);

  useEffect(() => {
    if (location.hash === '#pricing') {
      setTimeout(() => scrollToPricing(), 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("resilient_hubs_seo_title", "12-Month Membership Program to Inner Strength | Resilient Mind")}
        description={t("resilient_hubs_seo_description", "Join a 12-month guided membership program with video lessons, workbooks and community support designed for expatriates seeking inner strength. From €37 — pay as you go.")}
        path="/resilient-hubs"
      />
      <Navbar />

      <main className="pt-20">
        {/* Hero Section — Emotional hook */}
        <PageHero>
          <div id="cms-hubs-hero" className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm font-sans font-medium text-primary">
                {t("hubs_hero_badge", "For Expats Ready to Thrive")}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-6" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
              {t("hubs_hero_title_prefix", "From Navigating Life Abroad to")}{" "}
              <span className="text-gradient-gold">{t("hubs_hero_title_highlight", "Truly Thriving")}</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/85 font-sans leading-relaxed mb-4 max-w-3xl mx-auto">
              {t("hubs_hero_lead", "Expat life can be rewarding, but it also comes with challenges—loneliness, cultural differences, uncertainty, and navigating health challenges while away from your familiar support network.")}
            </p>
            <p className="text-base text-foreground/75 font-sans leading-relaxed mb-4 max-w-3xl mx-auto">
              {t("hubs_hero_body", "Using my 13 years of experience living abroad and my expertise in personal development, expressive arts, and holistic therapies, I created an online membership program that transforms these challenges into opportunities for growth and inner strength.")}
            </p>

            <p className="text-base text-muted-foreground font-sans mb-8 max-w-2xl mx-auto">
              {t("hubs_hero_created_by", "Created by Silvie — an expatriate of 13+ years who developed a practical, accessible methodology designed to support people globally through an online membership and educational programs.")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={scrollToPricing}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all hover:scale-105"
              >
                {t("hubs_hero_cta_primary", "See Plans & Pricing")}
                <ArrowRight size={18} />
              </button>
              <Link
                to="/free-guide"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card/80 backdrop-blur-sm border border-border text-foreground font-sans font-medium rounded-full hover:bg-card transition-all"
              >
                <Download size={18} />
                {t("hubs_hero_cta_secondary", "Try Free Guide First")}
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-8 text-sm text-foreground/70">
              <span className="flex items-center gap-1.5"><Video size={14} className="text-primary" /> {t("hubs_hero_stat_1", "48 video lessons")}</span>
              <span className="flex items-center gap-1.5"><FileText size={14} className="text-primary" /> {t("hubs_hero_stat_2", "48 workbooks")}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> {t("hubs_hero_stat_3", "15 min/week")}</span>
            </div>
          </div>
        </PageHero>

        {/* Membership Details */}
        <section id="cms-hubs-details" className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-lg text-foreground/85 font-sans leading-relaxed mb-6 max-w-3xl mx-auto">
                  {t("hubs_details_intro", "I offer a gentle online membership combining Emotional Freedom Techniques (EFT) and other holistic practices, with practical PDF tools for daily practice.")}
                </p>
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  {t("hubs_details_title_prefix", "A 12-Month Online Membership for ")}<span className="text-gradient-gold">{t("hubs_details_title_highlight", "Expat Women")}</span>
                </h2>
                <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto mb-6">
                  {t("hubs_details_subtitle", "Steady emotional support, nervous system regulation and gentle structure while living abroad.")}
                </p>
                <p className="text-base text-foreground/80 font-sans leading-relaxed max-w-3xl mx-auto mb-8">
                  {t("hubs_details_body", "This ongoing membership supports you month by month as you transform loneliness, uncertainty and cultural stress into emotional stability, self-trust and inner safety.")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-background rounded-2xl p-8 border border-border">
                  <h3 className="text-xl font-serif font-semibold mb-4 text-gradient-gold">{t("hubs_details_foryou_title", "This is for you if:")}</h3>
                  <ul className="space-y-3">
                    {[
                      t("hubs_details_foryou_1", "You live abroad and feel emotionally overwhelmed"),
                      t("hubs_details_foryou_2", "You miss stability and inner safety"),
                      t("hubs_details_foryou_3", "You want gentle, practical tools"),
                      t("hubs_details_foryou_4", "You value continuity over quick fixes"),
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={12} className="text-primary" />
                        </div>
                        <span className="text-foreground/80 font-sans text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-background rounded-2xl p-8 border border-border">
                  <h3 className="text-xl font-serif font-semibold mb-4 text-gradient-gold">{t("hubs_details_theme_title", "Each month focuses on one core theme:")}</h3>
                  <ul className="space-y-3">
                    {[
                      t("hubs_details_theme_1", "Emotional overwhelm"),
                      t("hubs_details_theme_2", "Loneliness and belonging"),
                      t("hubs_details_theme_3", "Boundaries and self-trust"),
                      t("hubs_details_theme_4", "Stability during constant change"),
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={12} className="text-primary" />
                        </div>
                        <span className="text-foreground/80 font-sans text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground font-sans mt-4">
                    <Link to="/resilient-hub" className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium">{t("hubs_details_theme_link", "See the full 12-month overview")}</Link> {t("hubs_details_theme_link_suffix", "for details on each month.")}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-base text-foreground/80 font-sans leading-relaxed max-w-2xl mx-auto mb-8">
                  {t("membership_howto_note", "The Membership program teaches you how to look after your mind, regulate stress, and grow self-awareness — one gentle practice at a time.")}
                </p>

                <p className="text-lg text-foreground/80 font-sans font-medium leading-relaxed max-w-2xl mx-auto mb-6">
                  {t("hubs_details_closing", "This membership helps you feel more stable, supported and at home within yourself — wherever you live.")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What if resilience... */}
        <section id="cms-hubs-resilience" className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-6 italic text-foreground/90">
                {t("hubs_resilience_title", "What if resilience wasn't about pushing harder — but about learning how to care for your mind and nervous system, step by step?")}
              </h2>
              <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-8 max-w-3xl mx-auto">
                {t("hubs_resilience_body", "The Membership Online Program is built on a simple idea: you don't need more information — you need practical tools you can actually use when life feels overwhelming.")}
              </p>
              <div className="max-w-2xl mx-auto text-left mb-8">
                <p className="text-base text-foreground/80 font-sans mb-4">{t("hubs_resilience_lead", "Instead of trying to \"fix yourself,\" you learn how to:")}</p>
                <ul className="space-y-3">
                  {[
                    t("hubs_resilience_item_1", "Understand your reactions"),
                    t("hubs_resilience_item_2", "Regulate stress and emotions"),
                    t("hubs_resilience_item_3", "Build self-awareness and confidence"),
                    t("hubs_resilience_item_4", "Respond to challenges with more calm and clarity"),
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} className="text-primary" />
                      </div>
                      <span className="text-foreground/80 font-sans">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-base text-foreground/80 font-sans font-medium italic">
                {t("hubs_resilience_closing", "This is where resilience becomes something you practice, not something you force.")}
              </p>
            </div>
          </div>
        </section>

        {/* Resilient Mind Membership details */}
        <section id="cms-hubs-membership" className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                {t("hubs_membership_title_prefix", "Resilient Mind ")}<span className="text-gradient-gold">{t("hubs_membership_title_highlight", "Membership")}</span>
              </h2>
              <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-4 max-w-3xl mx-auto">
                {t("hubs_membership_body", "Ongoing emotional support and nervous system regulation for expat women. An online membership with guided practical tools and video support within a holistic approach. Pay as you go — no auto-renewal.")}
              </p>
              <div className="max-w-2xl mx-auto text-left mb-8">
                <p className="text-base text-foreground/80 font-sans font-medium mb-4">{t("hubs_membership_lead", "Every month you receive:")}</p>
                <ul className="space-y-3">
                  {[
                    t("hubs_membership_item_1", "Guided EFT sessions and other holistic practices (audio & video)"),
                    t("hubs_membership_item_2", "Expressive creative tools (no artistic experience needed)"),
                    t("hubs_membership_item_3", "Simple integration practices (journaling & reflection)"),
                    t("hubs_membership_item_4", "Access to a private community for Premium members"),
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} className="text-primary" />
                      </div>
                      <span className="text-foreground/80 font-sans">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-base text-foreground/80 font-sans italic">
                {t("hubs_membership_closing", "Resilience isn't something you're born with — it's something you practice gently, one month at a time.")}
              </p>
            </div>
          </div>
        </section>

        {/* Pain Points — "Does this sound like you?" */}
        <section id="cms-hubs-pain" className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4 text-center">
                {t("hubs_pain_title", "Does This Sound Like You?")}
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12 max-w-2xl mx-auto">
                {t("hubs_pain_subtitle", "If you're nodding to any of these, this program was built for you.")}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  t("hubs_pain_item_1", "You feel like you don't fully belong — not here, not back home"),
                  t("hubs_pain_item_2", "Loneliness hits you at unexpected moments, even in a crowd"),
                  t("hubs_pain_item_3", "You struggle to explain what you're going through to people who haven't lived abroad"),
                  t("hubs_pain_item_4", "Cultural differences exhaust you — small things feel overwhelming"),
                  t("hubs_pain_item_5", "You miss your support network and feel isolated in health challenges"),
                  t("hubs_pain_item_6", "You've lost parts of your identity and don't know who you're becoming"),
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
                  {t("hubs_pain_quote", "\"You don't need to figure this out alone. I've been exactly where you are — and I built this program to be the guide I wished I had.\"")}
                </p>
                <p className="text-sm text-primary font-sans font-medium mt-3">{t("hubs_pain_attribution", "— Silvie, Founder")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* What You Get — The Transformation */}
        <section id="cms-hubs-transform" className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  {t("hubs_transform_title_prefix", "Your ")}<span className="text-gradient-gold">{t("hubs_transform_title_highlight", "12-Month Transformation")}</span>
                </h2>
                <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                  {t("hubs_transform_subtitle", "Each month tackles a different dimension of expat resilience. By the end, you'll have an unshakable inner foundation.")}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                  { icon: Heart, title: t("hubs_transform_item_1_title", "Inner Stability"), desc: t("hubs_transform_item_1_desc", "Build emotional resilience that doesn't depend on your external circumstances"), color: "bg-rose-50 text-rose-600" },
                  { icon: Brain, title: t("hubs_transform_item_2_title", "Stress Management"), desc: t("hubs_transform_item_2_desc", "Master EFT tapping, Byron Katie's method, and mindfulness for real-world challenges"), color: "bg-blue-50 text-blue-600" },
                  { icon: Globe, title: t("hubs_transform_item_3_title", "Cultural Navigation"), desc: t("hubs_transform_item_3_desc", "Turn cultural differences from a source of stress into a source of strength"), color: "bg-emerald-50 text-emerald-600" },
                  { icon: Users, title: t("hubs_transform_item_4_title", "Relationships"), desc: t("hubs_transform_item_4_desc", "Strengthen bonds with loved ones — both far away and in your new home"), color: "bg-amber-50 text-amber-600" },
                  { icon: Palette, title: t("hubs_transform_item_5_title", "Creative Expression"), desc: t("hubs_transform_item_5_desc", "Process complex emotions through art therapy — no artistic talent needed"), color: "bg-purple-50 text-purple-600" },
                  { icon: Activity, title: t("hubs_transform_item_6_title", "Identity & Growth"), desc: t("hubs_transform_item_6_desc", "Transform your expatriate identity into your greatest asset"), color: "bg-teal-50 text-teal-600" },
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
                  { num: "48", label: t("hubs_transform_stat_1_label", "Video Lessons"), sub: t("hubs_transform_stat_1_sub", "10-15 min each") },
                  { num: "48", label: t("hubs_transform_stat_2_label", "Workbooks"), sub: t("hubs_transform_stat_2_sub", "With practical exercises") },
                  { num: "12", label: t("hubs_transform_stat_3_label", "Monthly Themes"), sub: t("hubs_transform_stat_3_sub", "Comprehensive journey") },
                  { num: "3", label: t("hubs_transform_stat_4_label", "Therapy Methods"), sub: t("hubs_transform_stat_4_sub", "EFT, Art, Meditation") },
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
        <section id="cms-hubs-howworks" className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-12 text-center">
                {t("hubs_howworks_title", "How It Works")}
              </h2>

              <div className="space-y-8">
                {[
                  { step: "1", title: t("hubs_howworks_step_1_title", "Choose Your Plan"), desc: t("hubs_howworks_step_1_desc", "Pick Basic for self-guided learning or Premium for the full experience with personal consultations and art therapy kit."), icon: Crown },
                  { step: "2", title: t("hubs_howworks_step_2_title", "Start This Month's Theme"), desc: t("hubs_howworks_step_2_desc", "Each month, a new module unlocks with video lessons, workbooks, and guided exercises tailored to a specific aspect of resilience."), icon: Video },
                  { step: "3", title: t("hubs_howworks_step_3_title", "Practice at Your Own Pace"), desc: t("hubs_howworks_step_3_desc", "Watch 1 video per week (5-10 min), complete the workbook exercises, and integrate the techniques into your daily life. (4 x videos per month)"), icon: FileText },
                  { step: "4", title: t("hubs_howworks_step_4_title", "Transform Over 12 Months"), desc: t("hubs_howworks_step_4_desc", "By month 12, you'll have a complete toolkit of resilience techniques and an unshakable inner foundation — your 'inner home' that travels with you."), icon: Heart },
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
        <section id="cms-hubs-content" className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4 text-center">
                {t("hubs_content_title_prefix", "Explore the ")}<span className="text-gradient-gold">{t("hubs_content_title_highlight", "Program Content")}</span>
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-8">
                {t("hubs_content_subtitle", "Preview the monthly video lessons, workbooks, and exercises included in your membership.")}
              </p>
              <ProgramOverview />
            </div>
          </div>
        </section>

        {/* Why Resilient Mind — Differentiators (text preserved 1:1 with Membership.tsx §10, reuses same CMS keys) */}
        <section id="cms-hubs-whydifferent" className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4 text-center">
                {t("membership_whydifferent_title_prefix", "Why Resilient Mind Is ")}<span className="text-gradient-gold">{t("membership_whydifferent_title_highlight", "Different")}</span>
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12 max-w-2xl mx-auto">
                {t("membership_whydifferent_subtitle", "This isn't generic self-help. It's a program built from real expatriate experience.")}
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: t("membership_whydifferent_1_title", "Built by someone who's lived it"), desc: t("shared_silvie_bio_long", "Silvie has 13+ years of expatriate experience across multiple countries. Every technique in this program was forged in real life — not a textbook."), icon: Globe },
                  { title: t("membership_whydifferent_2_title", "Three proven methods, one program"), desc: t("membership_whydifferent_2_desc", "We combine EFT tapping (evidence-based stress relief), expressive art therapy (emotional processing), and guided meditation (inner calm) into a single, cohesive journey."), icon: Zap },
                  { title: t("membership_whydifferent_3_title", "Made for busy expat lives"), desc: t("membership_whydifferent_3_desc", "15–30 minutes daily. No live schedules. Group calls included with Premium membership. Watch when you want, practice at your own pace."), icon: Clock },
                  { title: t("membership_whydifferent_4_title", "Not just coping — transforming"), desc: t("membership_whydifferent_4_desc", "Other programs teach you to 'manage' challenges. We help you turn uncertainty, cultural stress, and identity shifts into actual sources of strength and growth."), icon: Star },
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
            <div id="cms-hubs-pricing" className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <Crown size={16} className="text-primary" />
                  <span className="text-sm font-sans font-medium text-primary">{t("hubs_pricing_badge", "Choose Your Path")}</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  {t("hubs_pricing_title_prefix", "Invest in Your ")}<span className="text-gradient-gold">{t("hubs_pricing_title_highlight", "Transformation")}</span>
                </h2>
                <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                  {t("hubs_pricing_subtitle", "Now is your moment to invest in your body, mind, and resilience — and step into a life of clarity, calm and confidence, no matter where the world takes you.")}
                </p>
              </div>

              <PricingCards cancelUrl="/resilient-hubs" />

              {/* How to get started — right below pricing cards (text preserved 1:1 with Membership.tsx §9b, reuses same CMS keys) */}
              <div className="max-w-2xl mx-auto mt-10 p-8 bg-card rounded-2xl border border-border">
                <h3 className="text-xl md:text-2xl font-serif font-semibold mb-6 text-center">
                  {t("membership_howto_title", "How to Get Started")}
                </h3>
                <div className="space-y-4">
                  {[
                    { step: "1", text: t("membership_howto_step_1", "Choose the membership that suits you.") },
                    { step: "2", text: t("membership_howto_step_2", "Click Sign Up to create your personal account.") },
                    { step: "3", text: t("membership_howto_step_3", "Complete your secure payment via Stripe.") },
                    { step: "4", text: t("membership_howto_step_4", "You'll receive a welcome email and instant access to your private Dashboard with the full 12-month programme.") },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">{item.step}</span>
                      </div>
                      <p className="text-foreground/80 font-sans pt-1">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-center text-foreground/80 font-sans leading-relaxed max-w-3xl mx-auto mt-8 mb-4">
                {t("membership_howto_note", "The Membership program teaches you how to look after your mind, regulate stress, and grow self-awareness — one gentle practice at a time.")}
              </p>
              <PricingTrustSignals />

              {/* Free guide nudge */}
              <div className="text-center mt-8">
                <p className="text-sm text-muted-foreground font-sans">
                  {t("hubs_pricing_freeguide_prefix", "Not sure yet? ")}<Link to="/free-guide" className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium">{t("hubs_pricing_freeguide_link", "Download our free guide")}</Link> {t("hubs_pricing_freeguide_suffix", "and experience the program first.")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="cms-hubs-faq" className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4 text-center">
                {t("membership_faq_title", "Frequently Asked Questions")}
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12">
                {t("membership_faq_subtitle", "Everything you need to know before starting your journey.")}
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
        <section id="cms-hubs-finalcta" className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart size={36} className="text-white" />
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4">
                  {t("hubs_finalcta_title_line1", "Your Inner Strength Goes")}
                  <br />
                  <span className="text-gradient-gold">{t("hubs_finalcta_title_highlight", "Wherever Life Takes You")}</span>
                </h2>
                <p className="text-lg text-muted-foreground font-sans mb-3 max-w-2xl mx-auto">
                  {t("hubs_finalcta_body", "You moved abroad for a reason. You took one of the bravest steps most people never will. Now it's time to build the resilience that matches your courage.")}
                </p>
                <p className="text-base text-foreground/80 font-sans italic max-w-xl mx-auto">
                  {t("hubs_finalcta_quote", "\"The moment I stopped fighting against my expatriate challenges and started transforming them instead, everything changed.\"")}
                </p>
                <p className="text-sm text-primary font-sans font-medium mt-2">{t("hubs_finalcta_attribution", "— Silvie, Founder of Resilient Mind")}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={scrollToPricing}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all hover:scale-105"
                >
                  {t("hubs_finalcta_cta_primary", "Start Your Transformation Today")}
                  <ArrowRight size={18} />
                </button>
                <Link
                  to="/free-guide"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card border border-border font-sans font-medium rounded-full hover:bg-secondary transition-all"
                >
                  <Download size={18} />
                  {t("hubs_finalcta_cta_secondary", "Download Free Guide First")}
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
