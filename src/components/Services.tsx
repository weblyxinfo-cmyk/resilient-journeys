import { BookOpen, Users, Calendar, Sparkles, Target, Palette, Heart, Check, Globe, Briefcase, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const services = [
  {
    icon: BookOpen,
    title: "Resilient Hubs",
    subtitle: "Membership Programs",
    description:
      "4 transformational programs combining evidence-based techniques, expressive arts, and energy work for lasting resilience.",
    price: "from €27",
    href: "/membership",
    featured: true,
  },
  {
    icon: Users,
    title: "Individual Consultations",
    subtitle: "1:1 Personalized Guidance",
    description:
      "Personalized one-on-one guidance tailored to your unique experience. Book your session through our calendar.",
    price: "€107/hour",
    href: "/booking",
    featured: false,
  },
  {
    icon: Calendar,
    title: "Workshops",
    subtitle: "For Groups & Organizations",
    description:
      "Interactive workshops for organizations and groups. Innovative approaches to building resilience abroad.",
    price: "Contact for details",
    href: "/workshopy",
    featured: false,
  },
];

const approaches = [
  {
    icon: Target,
    title: "Expatriate-Specific Techniques",
    description: "Strategies developed specifically for the unique challenges of living abroad",
  },
  {
    icon: Palette,
    title: "Creative Expression",
    description: "Process complex emotions through art and expressive techniques when words aren't enough",
  },
  {
    icon: Heart,
    title: "Holistic Integration",
    description: "Combining mind, body, and energy work for complete resilience",
  },
];

const whoItsFor = [
  "Expat women navigating new cultures while staying connected to who they truly are",
  "Women living abroad who feel emotionally stretched or unsupported, seeking grounded tools they can rely on anywhere",
  "Globally mobile women facing constant change and wanting deeper inner stability, confidence, and clarity",
];

const whyJoin = [
  {
    icon: Heart,
    title: "Learn to regulate your nervous system",
    description: "and create a greater sense of calm and emotional safety.",
  },
  {
    icon: Globe,
    title: "Develop practical tools",
    description: "to navigate life's challenges with more confidence, clarity, and resilience.",
  },
  {
    icon: Briefcase,
    title: "Discover EFT, expressive art, meditation,",
    description: "and other holistic practices you can use in everyday life.",
  },
  {
    icon: Users,
    title: "Join a supportive community",
    description: "of like-minded expat women from around the world.",
  },
  {
    icon: Sprout,
    title: "Follow a step-by-step journey",
    description:
      "that helps you build lasting emotional resilience, deepen your self-awareness, and reconnect with who you truly are.",
  },
];

const waysToWork = [
  {
    title: "Resilient Hub Membership",
    description:
      "Ongoing guidance, practical tools, and self-paced learning to build emotional resilience.",
  },
  {
    title: "Individual Consultations",
    description:
      "Personalised one-to-one holistic counselling tailored to your unique needs and goals.",
  },
  {
    title: "Workshops & Group Sessions",
    description:
      "Interactive wellbeing experiences featuring Expressive Art, Silk Painting, EFT Tapping, and mindfulness for communities and organisations.",
  },
];

const Services = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        <div className="absolute inset-0 bg-foreground/5" />
      </div>

      <div className="container relative z-10 px-4">
        {/* Header — Why Join Resilient Mind? */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-semibold mb-10 text-center">
            Why Join <span className="text-gradient-gold">Resilient Mind?</span>
          </h2>
          <ul className="space-y-6 max-w-2xl mx-auto">
            {whyJoin.map((item, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <item.icon size={22} className="text-primary" />
                </div>
                <p className="text-foreground/85 font-sans leading-relaxed pt-1">
                  <span className="font-serif font-semibold text-foreground">
                    {item.title}
                  </span>{" "}
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-lg md:text-xl text-gradient-gold font-serif italic text-center mt-12 max-w-2xl mx-auto leading-relaxed">
            Because you deserve to feel emotionally safe, supported, and truly at home — wherever life takes you. ♡
          </p>
        </div>

        {/* Why Our Approach Works */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-12 text-center">
            Why Our Approach Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {approaches.map((approach, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <approach.icon size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-3 text-foreground">
                  {approach.title}
                </h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                  {approach.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Who It's For */}
        <div className="max-w-3xl mx-auto mb-20 bg-card rounded-2xl p-8 border border-border">
          <h3 className="text-2xl font-serif font-semibold mb-6 text-center text-gradient-gold">
            For Expats Ready to Thrive
          </h3>
          <ul className="space-y-4">
            {whoItsFor.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="w-2 h-2 bg-gold rounded-full" />
                </div>
                <p className="text-foreground/80 font-sans">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Ways to Work Together */}
        <div className="max-w-3xl mx-auto mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-sans font-medium text-primary">
              How We Can Work Together
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
            Ways to <span className="text-gradient-gold">Work Together</span>
          </h2>
          <p className="text-lg text-muted-foreground font-sans mb-10">
            Choose the support that's right for your journey.
          </p>
          <ul className="space-y-5 text-left max-w-2xl mx-auto">
            {waysToWork.map((way, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="w-7 h-7 bg-gradient-gold rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 shadow-soft">
                  <Check size={16} className="text-primary-foreground" strokeWidth={3} />
                </div>
                <p className="text-foreground/85 font-sans leading-relaxed">
                  <span className="font-serif font-semibold text-foreground">
                    {way.title}
                  </span>{" "}
                  – {way.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <Link
              key={index}
              to={service.href}
              className={`group relative p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 ${
                service.featured
                  ? "bg-gradient-gold text-primary-foreground shadow-gold"
                  : "bg-card border border-border hover:shadow-elevated"
              }`}
            >
              {service.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-card text-primary text-xs font-sans font-semibold rounded-full shadow-soft">
                  Most Popular
                </div>
              )}

              <div
                className={`w-14 h-14 flex items-center justify-center rounded-xl mb-6 ${
                  service.featured
                    ? "bg-primary-foreground/20"
                    : "bg-primary/10"
                }`}
              >
                <service.icon
                  size={28}
                  className={service.featured ? "text-primary-foreground" : "text-primary"}
                />
              </div>

              <div
                className={`text-sm font-sans font-medium mb-2 ${
                  service.featured ? "text-primary-foreground/80" : "text-primary"
                }`}
              >
                {service.subtitle}
              </div>

              <h3
                className={`text-2xl font-serif font-semibold mb-3 ${
                  service.featured ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                {service.title}
              </h3>

              <p
                className={`text-sm font-sans leading-relaxed mb-6 ${
                  service.featured
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                }`}
              >
                {service.description}
              </p>

              <div
                className={`text-lg font-serif font-semibold ${
                  service.featured ? "text-primary-foreground" : "text-primary"
                }`}
              >
                {service.price}
              </div>

              <div
                className={`mt-6 pt-6 border-t ${
                  service.featured
                    ? "border-primary-foreground/20"
                    : "border-border"
                }`}
              >
                <span
                  className={`text-sm font-sans font-medium group-hover:underline ${
                    service.featured ? "text-primary-foreground" : "text-primary"
                  }`}
                >
                  Learn more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
