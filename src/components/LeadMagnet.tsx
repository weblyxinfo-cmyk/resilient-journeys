import { useState } from "react";
import { Download, CheckCircle, Mail } from "lucide-react";

const LeadMagnet = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here would be the SmartEmailing integration
    console.log("Email submitted:", email);
    setIsSubmitted(true);
  };

  return (
    <section className="py-24 bg-card">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              {/* Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <Download size={16} className="text-primary" />
                  <span className="text-sm font-sans font-medium text-primary">
                    Free Resource
                  </span>
                </div>

                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  Start Your Resilience Journey Today
                </h2>

                <p className="text-muted-foreground font-sans mb-6">
                  Get your free mini e-book &amp; video course with practical exercises
                  to begin building your resilient mind immediately.
                </p>

                <ul className="space-y-3 mb-6">
                  {[
                    "5 Essential Resilience Techniques",
                    "Guided Meditation Audio",
                    "Printable Workbook (PDF)",
                    "Video Lessons",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 font-sans text-sm">
                      <CheckCircle size={18} className="text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Form */}
              <div className="bg-card rounded-2xl p-6 shadow-elevated">
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold mb-2">
                      Thank You!
                    </h3>
                    <p className="text-muted-foreground font-sans text-sm">
                      Check your inbox for your free resources.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-serif font-semibold mb-2">
                      Get Free Access
                    </h3>
                    <p className="text-muted-foreground font-sans text-sm mb-6">
                      Enter your email to receive your free mini-course instantly.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Your email address"
                          required
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-xl shadow-gold hover:shadow-elevated transition-all duration-300 hover:scale-[1.02]"
                      >
                        Send Me Free Resources
                      </button>

                      <p className="text-xs text-muted-foreground font-sans text-center">
                        No spam. Unsubscribe anytime. Your data is safe with me.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadMagnet;
