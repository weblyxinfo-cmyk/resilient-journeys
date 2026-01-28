import { BookOpen, Users, Calendar, Sparkles, Target, Palette, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: BookOpen,
    title: "Resilient Hubs",
    subtitle: "Membership Programs",
    description:
      "4 transformational programs combining evidence-based techniques, expressive arts, and energy work for lasting resilience.",
    price: "from €27/month",
    href: "/resilient-hub",
    featured: true,
  },
  {
    icon: Users,
    title: "Individual Consultations",
    subtitle: "1:1 Personalized Guidance",
    description:
      "Personalized one-on-one guidance tailored to your unique experience. Book your session through our calendar.",
    price: "€87/hour",
    href: "/booking",
    featured: false,
  },
  {
    icon: Calendar,
    title: "Workshops",
    subtitle: "Contact by Email",
    description:
      "Interactive workshops for organizations and groups. Innovative approaches to building resilience abroad.",
    price: "Contact for details",
    href: "mailto:silvie@resilientmind.io",
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
  "Women navigating new cultures while maintaining their sense of self",
  "Expatriates managing health challenges far from their support systems",
  "Global professionals seeking deeper stability despite constant change",
];

const Services = () => {
  return (
    <section className="py-24 bg-gradient-warm">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-sans font-medium text-primary">
              Why Our Approach Works
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold mb-6">
            Transform Your <span className="text-gradient-gold">Expat Experience</span>
          </h2>
          <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-8">
            At Resilient Mind, we guide expatriates through this alchemical process, turning the challenges of cultural transition into your most powerful assets. Through our signature blend of evidence-based techniques, expressive arts, and energy work, you'll develop an unshakable "inner home" that travels with you anywhere.
          </p>
          <p className="text-base text-foreground/80 font-sans italic">
            Because true resilience isn't about resisting change — it's about learning to flow with it and grow stronger.
          </p>
        </div>

        {/* Why Our Approach Works */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
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
