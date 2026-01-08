import { BookOpen, Users, Calendar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: BookOpen,
    title: "Resilient Hub",
    subtitle: "12-Month Program",
    description:
      "A structured journey through 12 aspects of resilience, combining creative techniques with therapeutic approaches.",
    price: "from €27/month",
    href: "/resilient-hub",
    featured: true,
  },
  {
    icon: Users,
    title: "1:1 Sessions",
    subtitle: "Personal Guidance",
    description:
      "Individual consultations tailored to your unique challenges as an expat. Deep work on your personal resilience journey.",
    price: "€87/hour",
    href: "/booking",
    featured: false,
  },
  {
    icon: Calendar,
    title: "Workshops",
    subtitle: "Group Experience",
    description:
      "Interactive workshops for organizations, schools, and community centers. Innovative approaches to mental wellness.",
    price: "Custom pricing",
    href: "/booking",
    featured: false,
  },
];

const Services = () => {
  return (
    <section className="py-24 bg-gradient-warm">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-sans font-medium text-primary">
              What I Offer
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
            Your Path to <span className="text-gradient-gold">Resilience</span>
          </h2>
          <p className="text-muted-foreground font-sans">
            Choose the support that fits your journey. Every option is designed
            to help you and your family thrive in your new home.
          </p>
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
