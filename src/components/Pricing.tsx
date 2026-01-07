import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Basic",
    subtitle: "Essential Foundation",
    monthlyPrice: 27,
    yearlyPrice: 270,
    yearlySavings: "Save €54",
    description: "Perfect for self-guided learning with all core materials.",
    features: [
      "4 video lessons per month",
      "Downloadable worksheets & exercises",
      "Meditation & visualization library",
      "Private community access",
      "Monthly live Q&A session",
    ],
    cta: "Start Basic",
    featured: false,
  },
  {
    name: "Premium",
    subtitle: "Full Transformation",
    monthlyPrice: 47,
    yearlyPrice: 470,
    yearlySavings: "Save €94",
    description: "Complete program with personal guidance and materials.",
    features: [
      "Everything in Basic",
      "4 personal consultations/year (€348 value)",
      "Art therapy materials kit",
      "Priority email support",
      "Exclusive workshops access",
      "Partner & family resources",
    ],
    cta: "Go Premium",
    featured: true,
  },
  {
    name: "1:1 Session",
    subtitle: "Individual Support",
    monthlyPrice: 87,
    yearlyPrice: null,
    yearlySavings: null,
    description: "Deep personal work tailored to your unique needs.",
    features: [
      "60-minute private session",
      "Personalized action plan",
      "Follow-up resources",
      "Email support between sessions",
      "Flexible scheduling",
    ],
    cta: "Book Session",
    featured: false,
  },
];

const Pricing = () => {
  return (
    <section className="py-24 bg-secondary">
      <div className="container px-6">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <p className="text-accent font-sans font-bold uppercase tracking-wide text-sm mb-3">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-display mb-4">
            Invest in Your Wellbeing
          </h2>
          <p className="text-muted-foreground font-sans">
            Choose the membership that fits your needs.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative p-6 border-2 border-foreground ${
                tier.featured
                  ? "bg-accent text-accent-foreground"
                  : "bg-card"
              }`}
              style={{
                boxShadow: tier.featured
                  ? "6px 6px 0 0 hsl(var(--brutal-black))"
                  : "4px 4px 0 0 hsl(var(--brutal-black))",
              }}
            >
              {tier.featured && (
                <div
                  className="absolute -top-4 left-4 inline-flex items-center gap-1 px-4 py-2 bg-brutal-yellow text-foreground text-xs font-sans font-bold uppercase border-2 border-foreground"
                  style={{
                    boxShadow: "2px 2px 0 0 hsl(var(--brutal-black))",
                  }}
                >
                  <Star size={12} />
                  Best Value
                </div>
              )}

              <div className="mb-5 pt-2">
                <p
                  className={`text-xs font-sans font-bold uppercase tracking-wide mb-1 ${
                    tier.featured ? "text-accent-foreground/80" : "text-accent"
                  }`}
                >
                  {tier.subtitle}
                </p>
                <h3 className="text-3xl font-display">
                  {tier.name}
                </h3>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display">
                    €{tier.monthlyPrice}
                  </span>
                  <span
                    className={`text-sm font-sans ${
                      tier.featured ? "text-accent-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {tier.yearlyPrice ? "/month" : "/session"}
                  </span>
                </div>
                {tier.yearlyPrice && (
                  <p
                    className={`text-xs font-sans mt-1 ${
                      tier.featured ? "text-accent-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    or €{tier.yearlyPrice}/year ({tier.yearlySavings})
                  </p>
                )}
              </div>

              <p
                className={`text-sm font-sans mb-5 ${
                  tier.featured ? "text-accent-foreground/90" : "text-muted-foreground"
                }`}
              >
                {tier.description}
              </p>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 border-2 ${
                        tier.featured
                          ? "border-accent-foreground bg-accent-foreground"
                          : "border-foreground bg-foreground"
                      }`}
                    >
                      <Check
                        size={12}
                        className={tier.featured ? "text-accent" : "text-background"}
                      />
                    </div>
                    <span className="text-sm font-sans">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to={tier.name === "1:1 Session" ? "/booking" : "/resilient-hub"}
                className={tier.featured ? "btn-secondary w-full text-center" : "btn-primary w-full text-center"}
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
