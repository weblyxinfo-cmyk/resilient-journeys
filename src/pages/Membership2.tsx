import { Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { useCms } from "@/hooks/useCms";
import { useFaqItems, FaqItem } from "@/hooks/useFaqItems";
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
  Compass,
  Globe,
  Zap,
  Clock,
  Star,
  ChevronDown,
  Check,
} from "lucide-react";

// Fallback for useFaqItems('membership', ...) — kept identical to Membership.tsx
// since both pages share the same faq_items group. See that file's comment.
const fallbackFaqs: FaqItem[] = [
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

const Membership2 = () => {
  const { t } = useCms();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = useFaqItems('membership', fallbackFaqs);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("membership2_seo_title", "Resilient Mind Membership (backup) | Resilient Mind")}
        description={t("membership2_seo_description", "Backup version of the Resilient Mind Membership sales page.")}
        path="/membership2"
        noindex
        jsonLd={[
          breadcrumb([
            { name: "Home", path: "/" },
            { name: "Membership", path: "/membership2" },
          ]),
          product({
            name: "Resilient Mind Membership",
            description:
              "A gentle, structured online membership for expat women combining EFT tapping, expressive art therapy, nervous system regulation, and reflective workbooks. Pay as you go, cancel anytime.",
            url: "https://resilientmind.io/membership2",
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
        {/* 1. HERO — Headline + Subheadline + mini benefits + CTA */}
        <PageHero>
          <div id="cms-membership-hero" className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm font-sans font-medium text-primary">
                {t("membership_hero_badge", "Resilient Mind Membership")}
              </span>
            </div>

            <h1
              className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-5"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
            >
              {t("membership_hero_title_prefix", "You moved abroad…")}<br />
              {t("membership_hero_title_suffix", "so why do you still")} <span className="text-gradient-gold">{t("membership_hero_title_highlight", "feel off?")}</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/85 font-sans leading-relaxed mb-3 max-w-2xl mx-auto italic">
              {t("membership_hero_subtitle_prefix", "Stop feeling overwhelmed and start feeling like ")}<em>{t("membership_hero_subtitle_em", "yourself")}</em>{t("membership_hero_subtitle_suffix", " again.")}
            </p>

            <p className="text-base text-muted-foreground font-sans mb-10 max-w-2xl mx-auto">
              {t("membership_hero_description", "Feel like yourself again.")}
            </p>

            {/* 4 mini-benefit pillars */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
              {[
                { icon: Brain, label: t("membership_hero_pillar_1", "Understand your patterns") },
                { icon: Heart, label: t("membership_hero_pillar_2", "Regulate emotions") },
                { icon: Sun, label: t("membership_hero_pillar_3", "Create inner stability") },
                { icon: Home, label: t("membership_hero_pillar_4", "Feel at home within yourself") },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <item.icon size={22} className="text-primary" />
                  </div>
                  <span className="text-xs md:text-sm font-sans text-foreground/80 leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2">
              <a
                href="#offer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all hover:scale-105"
              >
                {t("membership_hero_cta", "Start your journey now")}
                <ArrowRight size={18} />
              </a>
              <p className="text-xs text-muted-foreground font-sans">
                {t("membership_hero_cta_note", "Pay as you go · Cancel anytime")}
              </p>
            </div>
          </div>
        </PageHero>

        {/* 2. PROBLEM */}
        <section id="cms-membership-problem" className="py-16 md:py-20 bg-card">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-6">
                {t("membership_problem_title", "You thought moving abroad would feel exciting…")}
              </h2>
              <p className="text-lg md:text-xl text-foreground/85 font-sans leading-relaxed mb-6">
                {t("membership_problem_lead", "…but instead, something feels off.")}
              </p>
              <p className="text-base md:text-lg text-foreground/80 font-sans leading-relaxed">
                {t("membership_problem_body", "You feel disconnected, overwhelmed, or not quite like yourself. Your emotions are all over the place. And no matter where you are… it doesn't fully feel like home.")}
              </p>
            </div>
          </div>
        </section>

        {/* 3. EMPATHY */}
        <section id="cms-membership-empathy" className="py-16 md:py-20 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-6">
                {t("membership_empathy_title", "Moving abroad is a big emotional shift.")}
              </h2>
              <p className="text-base md:text-lg text-foreground/80 font-sans leading-relaxed">
                {t("membership_empathy_body", "Even when everything looks \"right\" on the outside, it's completely normal to feel lost, anxious, or disconnected inside.")}
              </p>
            </div>
          </div>
        </section>

        {/* 4. SOLUTION */}
        <section id="cms-membership-solution" className="py-16 md:py-20 bg-card">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Compass size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  {t("membership2_solution_badge", "The gentle path home")}
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-6">
                {t("membership_solution_title_prefix", "A ")}<span className="text-gradient-gold">{t("membership_solution_title_highlight", "gentle, step-by-step space")}</span>{t("membership_solution_title_suffix", " to help you reconnect with yourself again")}
              </h2>
              <p className="text-lg text-foreground/80 font-sans leading-relaxed">
                {t("membership_solution_body", "A place where you can slow down, understand what's happening inside you, and start feeling grounded and stable again.")}
              </p>
            </div>
          </div>
        </section>

        {/* 5. WHAT YOU GET */}
        <section id="cms-membership-getitems" className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  {t("membership_getitems_title_prefix", "Inside, you'll receive simple, ")}<span className="text-gradient-gold">{t("membership_getitems_title_highlight", "supportive tools")}</span>
                </h2>
                <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                  {t("membership_getitems_subtitle", "Everything is designed to fit into your real life abroad — no pressure, just support.")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Hand,
                    title: t("membership_getitems_1_title", "EFT tapping & expressive creative art"),
                    desc: t("membership_getitems_1_desc", "Practical techniques to calm your nervous system and gently process what you're feeling."),
                  },
                  {
                    icon: Heart,
                    title: t("membership_getitems_2_title", "Guided practices"),
                    desc: t("membership_getitems_2_desc", "Audio and video sessions to help you regulate your emotions, day by day."),
                  },
                  {
                    icon: BookOpen,
                    title: t("membership_getitems_3_title", "A workbook to reconnect with yourself"),
                    desc: t("membership_getitems_3_desc", "Reflective exercises that help you understand your patterns and come home to who you are."),
                  },
                  {
                    icon: Clock,
                    title: t("membership_getitems_4_title", "A gentle structure at your own pace"),
                    desc: t("membership_getitems_4_desc", "On-demand lessons you can follow whenever life allows — no schedules, no pressure."),
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
        <section id="cms-membership-benefits" className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-10 text-center">
                {t("membership_benefits_title_prefix", "What this looks like in ")}<span className="text-gradient-gold">{t("membership_benefits_title_highlight", "your everyday life")}</span>
              </h2>

              <ul className="space-y-4">
                {[
                  t("membership_benefits_1", "Recognise your patterns and respond instead of react."),
                  t("membership_benefits_2", "Calm your nervous system and feel more in control of your emotions."),
                  t("membership_benefits_3", "Create lasting inner stability, even during uncertain times."),
                  t("membership_benefits_4", "Feel grounded, safe, and at home within yourself — wherever you are."),
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
        <section id="cms-membership-transformation2" className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  {t("membership2_transformation_title_prefix", "From feeling lost to feeling like ")}<em className="text-gradient-gold not-italic">{t("membership2_transformation_title_em", "yourself")}</em>{t("membership2_transformation_title_suffix", " again")}
                </h2>
                <p className="text-base md:text-lg text-foreground/80 font-sans max-w-2xl mx-auto leading-relaxed">
                  {t("membership2_transformation_subtitle", "Resilient Mind is a gentle space to help expat women feel stable, grounded, and at home within themselves.")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {/* BEFORE */}
                <div className="p-8 bg-card rounded-2xl border border-border">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-foreground/5 rounded-full mb-5">
                    <span className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("membership2_transformation_before_label", "Before")}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-5 text-foreground/85">
                    {t("membership2_transformation_before_title", "Feeling overwhelmed & disconnected")}
                  </h3>
                  <ul className="space-y-3">
                    {[
                      t("membership2_transformation_before_1", "Lonely, even in a crowd"),
                      t("membership2_transformation_before_2", "Not fully belonging anywhere"),
                      t("membership2_transformation_before_3", "Overthinking & emotionally drained"),
                      t("membership2_transformation_before_4", "Lost parts of yourself"),
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm md:text-base text-muted-foreground font-sans">
                        <span className="text-foreground/30 mt-1">◦</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AFTER */}
                <div className="p-8 bg-gradient-warm rounded-2xl border border-primary/20">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/15 rounded-full mb-5">
                    <Sparkles size={12} className="text-primary" />
                    <span className="text-xs font-sans font-semibold text-primary uppercase tracking-wider">
                      {t("membership2_transformation_after_label", "After")}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-5">
                    {t("membership2_transformation_after_title", "Feeling calm, grounded & connected")}
                  </h3>
                  <ul className="space-y-3">
                    {[
                      t("membership2_transformation_after_1", "Feel at home within yourself"),
                      t("membership2_transformation_after_2", "Emotional stability & inner safety"),
                      t("membership2_transformation_after_3", "Understand yourself & your patterns"),
                      t("membership2_transformation_after_4", "Stronger relationships & real connection"),
                      t("membership2_transformation_after_5", "Living with purpose & self-trust"),
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm md:text-base text-foreground/85 font-sans">
                        <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-center text-base md:text-lg text-foreground/80 font-sans italic max-w-2xl mx-auto leading-relaxed">
                {t("membership_transformation_caption", "Instead of feeling overwhelmed and disconnected, you begin to feel calm, grounded, and like yourself again.")}
              </p>
            </div>
          </div>
        </section>

        {/* 8. ABOUT / BRIDGE */}
        <section id="cms-membership-about" className="py-16 md:py-20 bg-card">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-base md:text-lg text-foreground/85 font-sans leading-relaxed mb-6">
                {t("membership_about_body", "Created for expat women who feel overwhelmed or disconnected, and are ready to reconnect with themselves, understand their inner patterns, and build a sense of calm, resilience, and home within — wherever they are in the world.")}
              </p>
              <p className="text-base text-muted-foreground font-sans leading-relaxed mb-8">
                {t("shared_silvie_bio_short", "Developed by Silvie, an expatriate of 13+ years, this approach blends lived experience with personal development, expressive arts, and holistic therapies — creating a supportive, practical path to navigate life abroad with greater ease and inner stability.")}
              </p>
              <a
                href="#offer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all hover:scale-105"
              >
                {t("membership_about_cta", "See Plans & Pricing")}
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>

        {/* 9. OFFER */}
        <section id="offer" className="py-16 md:py-24 bg-gradient-warm">
          <div className="container px-4">
            <div id="cms-membership-offer" className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  {t("membership_offer_title_prefix", "Choose your ")}<span className="text-gradient-gold">{t("membership_offer_title_highlight", "path")}</span>
                </h2>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-sm font-sans">
                  {[
                    t("membership_offer_badge_1", "Pay as you go"),
                    t("membership_offer_badge_2", "Cancel anytime"),
                    t("membership_offer_badge_3", "No pressure — just support"),
                  ].map(
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
                <div id="cms-membership-teaser_basic" className="p-8 bg-card rounded-2xl border border-border flex flex-col">
                  <h3 className="text-xl font-serif font-semibold mb-2">{t("membership_teaser_basic_title", "Basic")}</h3>
                  <p className="text-sm text-muted-foreground font-sans mb-6">
                    {t("membership_teaser_basic_subtitle", "Self-paced guidance you can follow in your own time.")}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-serif font-bold text-foreground">€37</span>
                    <span className="text-sm text-muted-foreground font-sans"> {t("membership_teaser_basic_period", "/month")}</span>
                  </div>
                  <ul className="space-y-2 mb-8 flex-1">
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("membership_teaser_basic_feature_1", "4 weekly videos")}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("membership_teaser_basic_feature_2", "4 weekly workbooks & reflective exercises")}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("membership_teaser_basic_feature_3", "Guided meditations")}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("membership_teaser_basic_feature_4", "Unlocks one month at a time")}</span>
                    </li>
                  </ul>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-card border border-primary/30 text-primary font-sans font-medium rounded-full hover:bg-primary/5 transition-all"
                  >
                    {t("membership_teaser_basic_cta", "Start Basic Monthly")}
                  </Link>
                </div>

                {/* Premium */}
                <div id="cms-membership-teaser_premium" className="p-8 bg-card rounded-2xl border-2 border-primary/40 flex flex-col relative shadow-md">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-gold text-primary-foreground rounded-full text-xs font-sans font-semibold">
                    {t("membership_teaser_premium_badge", "Most Popular")}
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-2">{t("membership_teaser_premium_title", "Premium")}</h3>
                  <p className="text-sm text-muted-foreground font-sans mb-6">
                    {t("membership_teaser_premium_subtitle", "Everything in Basic, plus a private community of like-minded women on the same path.")}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-serif font-bold text-foreground">€47</span>
                    <span className="text-sm text-muted-foreground font-sans"> {t("membership_teaser_premium_period", "/month")}</span>
                  </div>
                  <ul className="space-y-2 mb-8 flex-1">
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("membership_teaser_premium_feature_1", "Everything in Basic")}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("membership_teaser_premium_feature_2", "Access to the private Skool community")}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("membership_teaser_premium_feature_3", "Additional Hub: The Transformed Self")}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-sans text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{t("membership_teaser_premium_feature_4", "Additional Hub: Navigating Expat Life with Chronic Pain")}</span>
                    </li>
                  </ul>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all"
                  >
                    {t("membership_teaser_premium_cta", "Go Premium Monthly")}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="text-center mt-10">
                <Link
                  to="/resilient-hubs"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all hover:scale-105"
                >
                  {t("membership_offer_explore_cta", "Explore the full 12-month Membership")}
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
                {t("membership_whydifferent_title_prefix", "Why Resilient Mind Is ")}<span className="text-gradient-gold">{t("membership_whydifferent_title_highlight", "Different")}</span>
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12 max-w-2xl mx-auto">
                {t("membership_whydifferent_subtitle", "This isn't generic self-help. It's a program built from real expatriate experience.")}
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: t("membership_whydifferent_1_title", "Built by someone who's lived it"),
                    desc: t("shared_silvie_bio_long", "Silvie has 13+ years of expatriate experience across multiple countries. Every technique in this program was forged in real life — not a textbook."),
                    icon: Globe,
                  },
                  {
                    title: t("membership_whydifferent_2_title", "Three proven methods, one program"),
                    desc: t("membership_whydifferent_2_desc", "We combine EFT tapping (evidence-based stress relief), expressive art therapy (emotional processing), and guided meditation (inner calm) into a single, cohesive journey."),
                    icon: Zap,
                  },
                  {
                    title: t("membership_whydifferent_3_title", "Made for busy expat lives"),
                    desc: t("membership_whydifferent_3_desc", "15–30 minutes daily. No live schedules. Group calls included with Premium membership. Watch when you want, practice at your own pace."),
                    icon: Clock,
                  },
                  {
                    title: t("membership_whydifferent_4_title", "Not just coping — transforming"),
                    desc: t("membership_whydifferent_4_desc", "Other programs teach you to 'manage' challenges. We help you turn uncertainty, cultural stress, and identity shifts into actual sources of strength and growth."),
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
                {t("membership_faq_title", "Frequently Asked Questions")}
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12">
                {t("membership_faq_subtitle", "Everything you need to know before starting your journey.")}
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
        <section id="cms-membership-final_cta" className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={36} className="text-white" />
              </div>
              <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4">
                {t("membership_final_title_prefix", "Ready to feel like")}
                <br />
                <span className="text-gradient-gold">{t("membership_final_title_highlight", "yourself")}</span>{t("membership_final_title_suffix", " again?")}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground font-sans mb-8 max-w-2xl mx-auto">
                {t("membership_final_body", "Take the first gentle step today. No pressure — just support.")}
              </p>
              <a
                href="#offer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all hover:scale-105"
              >
                {t("membership_final_cta", "Start your journey")}
                <ArrowRight size={18} />
              </a>
              <p className="text-xs text-muted-foreground font-sans mt-4">
                {t("membership_final_cta_note", "Pay as you go · Cancel anytime")}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Membership2;
