import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";

const LeadMagnet = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    setIsSubmitted(true);
  };

  return (
    <section className="py-24 bg-brutal-yellow">
      <div className="container px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <p className="text-foreground font-sans font-bold uppercase tracking-wide text-sm mb-3">
                Free Resource
              </p>

              <h2 className="text-4xl md:text-5xl font-display mb-5">
                Start Your Resilience Journey Today
              </h2>

              <p className="text-foreground/80 font-sans mb-6">
                Get your free mini e-book & video course with practical exercises
                to begin building your resilient mind immediately.
              </p>

              <ul className="space-y-3">
                {[
                  "5 Essential Resilience Techniques",
                  "Guided Meditation Audio",
                  "Printable Workbook (PDF)",
                  "Video Lessons",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-sans font-medium">
                    <div className="w-6 h-6 bg-foreground flex items-center justify-center">
                      <Check size={14} className="text-brutal-yellow" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form */}
            <div
              className="bg-card p-8 border-2 border-foreground"
              style={{
                boxShadow: "6px 6px 0 0 hsl(var(--brutal-black))",
              }}
            >
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-accent border-2 border-foreground flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-accent-foreground" />
                  </div>
                  <h3 className="text-2xl font-display mb-2">
                    Thank You!
                  </h3>
                  <p className="text-muted-foreground font-sans">
                    Check your inbox for your free resources.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-display mb-2">
                    Get Free Access
                  </h3>
                  <p className="text-muted-foreground font-sans text-sm mb-6">
                    Enter your email to receive your free mini-course.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 border-2 border-foreground bg-background font-sans focus:outline-none focus:ring-0 focus:bg-secondary transition-all"
                    />

                    <button
                      type="submit"
                      className="btn-primary w-full gap-2"
                    >
                      Send Me Free Resources
                      <ArrowRight size={18} />
                    </button>

                    <p className="text-xs text-muted-foreground font-sans text-center">
                      No spam. Unsubscribe anytime.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadMagnet;
