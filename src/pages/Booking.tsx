import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Clock, Video, MapPin, Check, ArrowRight } from "lucide-react";

const sessionTypes = [
  {
    title: "Discovery Call",
    duration: "30 min",
    price: "Free",
    description: "A free introductory call to discuss your needs and see if we're a good fit.",
    features: ["Understand your challenges", "Explore working together", "No commitment"],
  },
  {
    title: "1:1 Session",
    duration: "60 min",
    price: "€87",
    description: "Deep personal work tailored to your unique situation and goals.",
    features: ["Personalized approach", "Action plan", "Follow-up resources", "Email support"],
  },
  {
    title: "Family Session",
    duration: "90 min",
    price: "€120",
    description: "Work together as a family to build collective resilience.",
    features: ["Parent & child focused", "Creative activities", "Family action plan", "Take-home exercises"],
  },
];

const Booking = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground border-2 border-foreground mb-6"
                style={{
                  boxShadow: "2px 2px 0 0 hsl(var(--brutal-black))",
                }}
              >
                <Calendar size={16} />
                <span className="text-sm font-sans font-bold uppercase tracking-wide">
                  Book a Session
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-display mb-6">
                Let's Work Together
              </h1>

              <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                Whether you prefer online sessions or in-person meetings in Spain,
                I am here to support your journey to resilience.
              </p>
            </div>
          </div>
        </section>

        {/* Session Types */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-display mb-12 text-center">
                Choose Your Session Type
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {sessionTypes.map((session, index) => (
                  <div
                    key={index}
                    className="brutal-card p-8"
                  >
                    <div className="flex items-center gap-2 text-sm font-sans text-muted-foreground mb-4">
                      <Clock size={14} />
                      <span>{session.duration}</span>
                    </div>

                    <h3 className="text-2xl font-display mb-2">
                      {session.title}
                    </h3>

                    <div className="text-3xl font-display text-accent mb-4">
                      {session.price}
                    </div>

                    <p className="text-muted-foreground font-sans text-sm mb-6">
                      {session.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {session.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm font-sans">
                          <div className="w-5 h-5 bg-foreground flex items-center justify-center flex-shrink-0">
                            <Check size={12} className="text-background" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button className="btn-primary w-full">
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-display mb-12 text-center">
                How Sessions Work
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div
                  className="flex items-start gap-4 p-6 bg-card border-2 border-foreground"
                  style={{
                    boxShadow: "4px 4px 0 0 hsl(var(--brutal-black))",
                  }}
                >
                  <div className="w-12 h-12 bg-brutal-yellow border-2 border-foreground flex items-center justify-center flex-shrink-0">
                    <Video size={24} className="text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl mb-2">Online Sessions</h3>
                    <p className="text-muted-foreground font-sans text-sm">
                      Connect from anywhere in the world via secure video call.
                      Perfect for busy schedules and families across time zones.
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-start gap-4 p-6 bg-card border-2 border-foreground"
                  style={{
                    boxShadow: "4px 4px 0 0 hsl(var(--brutal-black))",
                  }}
                >
                  <div className="w-12 h-12 bg-brutal-yellow border-2 border-foreground flex items-center justify-center flex-shrink-0">
                    <MapPin size={24} className="text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl mb-2">In-Person Sessions</h3>
                    <p className="text-muted-foreground font-sans text-sm">
                      Available in select locations in Spain. In-person sessions
                      allow for deeper hands-on creative work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Calendar Placeholder */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div
                className="p-12 bg-card border-2 border-foreground"
                style={{
                  boxShadow: "6px 6px 0 0 hsl(var(--brutal-black))",
                }}
              >
                <div className="w-20 h-20 bg-accent border-2 border-foreground flex items-center justify-center mx-auto mb-6">
                  <Calendar size={40} className="text-accent-foreground" />
                </div>
                <h2 className="text-3xl font-display mb-4">
                  Booking Calendar Coming Soon
                </h2>
                <p className="text-muted-foreground font-sans mb-8">
                  Our online booking system is being set up. In the meantime,
                  please email me directly to schedule your session.
                </p>
                <a
                  href="mailto:hello@resilientmind.com"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Email to Book
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;
