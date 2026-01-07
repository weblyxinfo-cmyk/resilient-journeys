import { BookOpen, Users, Calendar, ArrowRight } from "lucide-react";
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
    <section className="py-24 bg-background">
      <div className="container px-6">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <p className="text-accent font-sans font-bold uppercase tracking-wide text-sm mb-3">
            Services
          </p>
          <h2 className="text-4xl md:text-5xl font-display mb-4">
            Your Path to Resilience
          </h2>
          <p className="text-muted-foreground font-sans">
            Choose the support that fits your journey.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Link
              key={index}
              to={service.href}
              className={`group p-6 border-2 border-foreground transition-all duration-150 ${
                service.featured
                  ? "bg-accent text-accent-foreground"
                  : "bg-card hover:bg-secondary"
              }`}
              style={{
                boxShadow: "4px 4px 0 0 hsl(var(--brutal-black))",
              }}
            >
              <div
                className={`w-12 h-12 flex items-center justify-center border-2 border-foreground mb-5 ${
                  service.featured ? "bg-background" : "bg-brutal-yellow"
                }`}
              >
                <service.icon
                  size={24}
                  className={service.featured ? "text-foreground" : "text-foreground"}
                />
              </div>

              <p
                className={`text-xs font-sans font-bold uppercase tracking-wide mb-1 ${
                  service.featured ? "text-accent-foreground/80" : "text-accent"
                }`}
              >
                {service.subtitle}
              </p>

              <h3 className="text-2xl font-display mb-3">
                {service.title}
              </h3>

              <p
                className={`text-sm font-sans leading-relaxed mb-5 ${
                  service.featured
                    ? "text-accent-foreground/90"
                    : "text-muted-foreground"
                }`}
              >
                {service.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm font-sans font-bold">
                  {service.price}
                </span>
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
