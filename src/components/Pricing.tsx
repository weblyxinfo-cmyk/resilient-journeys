import { Check, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Basic Monthly",
    subtitle: "27 EUR/month",
    price: 27,
    period: "month",
    description: "Access to foundational Module A of current program theme each month.",
    features: [
      "Monthly foundational module (Module A)",
      "Downloadable worksheets for Module A",
      "Access to meditation library",
      "Monthly content updates",
    ],
    cta: "Start Basic Monthly",
    featured: false,
  },
  {
    name: "Basic Yearly",
    subtitle: "270 EUR/year",
    price: 270,
    period: "year",
    savings: "Save €54",
    description: "Complete access to all 4 programs (12 months) with all modules.",
    features: [
      "All 4 transformational programs (12 months)",
      "Complete access to all modules (A, B, C)",
      "All downloadable worksheets & exercises",
      "Full meditation & visualization library",
    ],
    cta: "Start Basic Yearly",
    featured: false,
  },
  {
    name: "Premium Monthly",
    subtitle: "47 EUR/month",
    price: 47,
    period: "month",
    description: "Enhanced access to foundational and advanced modules (A & B).",
    features: [
      "Modules A & B of current month",
      "All Basic Monthly benefits",
      "Access to additional Resilient Hub (Module A)",
      "Priority support",
    ],
    cta: "Go Premium Monthly",
    featured: false,
  },
  {
    name: "Premium Yearly",
    subtitle: "470 EUR/year",
    price: 470,
    period: "year",
    savings: "Save €94",
    description: "Complete program access with personal consultations and materials kit.",
    features: [
      "All 4 programs with all modules (A, B, C)",
      "4 hours personal consultations (€348 value)",
      "Art expressive therapy materials kit",
      "Additional Resilient Hubs access",
      "All worksheets, meditations & exercises",
    ],
    cta: "Go Premium Yearly",
    featured: true,
  },
  {
    name: "1:1 Session",
    subtitle: "87 EUR/session",
    price: 87,
    period: "session",
    description: "Personalised one-on-one guidance tailored to your unique experience.",
    features: [
      "60-minute private session",
      "Personalized action plan",
      "Follow-up resources",
      "Online or in-person (Spain)",
      "Flexible scheduling",
    ],
    cta: "Book Session",
    featured: false,
  },
];

const Pricing = () => {
  return (
    <section className="py-24 bg-gradient-warm">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-sans font-medium text-primary">
              Simple Pricing
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
            Invest in Your <span className="text-gradient-gold">Wellbeing</span>
          </h2>
          <p className="text-lg text-foreground/90 font-sans mb-3">
            <strong>4 Transformational Programs</strong> (12 Months Total) with <strong>12 Modules</strong> (A, B, C)
          </p>
          <p className="text-muted-foreground font-sans">
            Choose the membership that fits your needs. All options include access
            to our supportive expat community.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-6 transition-all duration-300 ${
                tier.featured
                  ? "bg-gradient-gold text-primary-foreground shadow-gold md:scale-105"
                  : "bg-card border border-border hover:shadow-elevated"
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 bg-card text-primary text-xs font-sans font-semibold rounded-full shadow-soft">
                  <Star size={12} />
                  Best Value
                </div>
              )}

              <div className="mb-4">
                <h3
                  className={`text-xl font-serif font-semibold mb-2 ${
                    tier.featured ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {tier.name}
                </h3>
                <div
                  className={`text-sm font-sans font-medium ${
                    tier.featured ? "text-primary-foreground/80" : "text-primary"
                  }`}
                >
                  {tier.subtitle}
                </div>
                {tier.savings && (
                  <div
                    className={`text-xs font-sans font-semibold mt-1 ${
                      tier.featured ? "text-primary-foreground" : "text-gold"
                    }`}
                  >
                    {tier.savings}
                  </div>
                )}
              </div>

              <p
                className={`text-xs font-sans mb-4 ${
                  tier.featured ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {tier.description}
              </p>

              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check
                      size={16}
                      className={`flex-shrink-0 mt-0.5 ${
                        tier.featured ? "text-primary-foreground" : "text-primary"
                      }`}
                    />
                    <span
                      className={`text-xs font-sans ${
                        tier.featured ? "text-primary-foreground/90" : "text-foreground"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to={
                  tier.name === "1:1 Session"
                    ? "/booking"
                    : tier.period === "year"
                      ? tier.name.includes("Premium")
                        ? "/checkout?plan=premium_yearly"
                        : "/checkout?plan=basic_yearly"
                      : tier.name.includes("Premium")
                        ? "/checkout?plan=premium_monthly"
                        : "/checkout?plan=basic_monthly"
                }
                className={`block w-full py-3 text-center text-sm font-sans font-semibold rounded-xl transition-all duration-300 ${
                  tier.featured
                    ? "bg-card text-primary hover:bg-card/90"
                    : "bg-gradient-gold text-primary-foreground shadow-gold hover:shadow-elevated"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
