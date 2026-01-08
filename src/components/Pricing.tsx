import { Check, Sparkles, Star } from "lucide-react";
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
    <section className="py-24 bg-gradient-warm">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-sans font-medium text-primary">
              Simple Pricing
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
            Invest in Your <span className="text-gradient-gold">Wellbeing</span>
          </h2>
          <p className="text-muted-foreground font-sans">
            Choose the membership that fits your needs. All options include access
            to our supportive expat community.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                tier.featured
                  ? "bg-gradient-gold text-primary-foreground shadow-gold scale-105"
                  : "bg-card border border-border hover:shadow-elevated"
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-1 bg-card text-primary text-xs font-sans font-semibold rounded-full shadow-soft">
                  <Star size={12} />
                  Best Value
                </div>
              )}

              <div className="mb-6">
                <div
                  className={`text-sm font-sans font-medium mb-1 ${
                    tier.featured ? "text-primary-foreground/80" : "text-primary"
                  }`}
                >
                  {tier.subtitle}
                </div>
                <h3
                  className={`text-2xl font-serif font-semibold ${
                    tier.featured ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {tier.name}
                </h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-serif font-bold ${
                      tier.featured ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    €{tier.monthlyPrice}
                  </span>
                  <span
                    className={`text-sm font-sans ${
                      tier.featured ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {tier.yearlyPrice ? "/month" : "/session"}
                  </span>
                </div>
                {tier.yearlyPrice && (
                  <div
                    className={`text-sm font-sans mt-1 ${
                      tier.featured ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    or €{tier.yearlyPrice}/year{" "}
                    <span className="text-primary font-semibold">
                      ({tier.yearlySavings})
                    </span>
                  </div>
                )}
              </div>

              <p
                className={`text-sm font-sans mb-6 ${
                  tier.featured ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {tier.description}
              </p>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check
                      size={18}
                      className={`flex-shrink-0 mt-0.5 ${
                        tier.featured ? "text-primary-foreground" : "text-primary"
                      }`}
                    />
                    <span
                      className={`text-sm font-sans ${
                        tier.featured ? "text-primary-foreground/90" : "text-foreground"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to={tier.name === "1:1 Session" ? "/booking" : "/resilient-hub"}
                className={`block w-full py-3.5 text-center font-sans font-semibold rounded-xl transition-all duration-300 ${
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
