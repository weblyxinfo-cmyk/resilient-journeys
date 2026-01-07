import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-16 bg-foreground text-background">
      <div className="container px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="font-display text-3xl tracking-tight">RESILIENT MIND</Link>
            <p className="text-background/70 font-sans mt-4 max-w-xs">
              Helping expat families build resilience through creative art therapy and evidence-based techniques.
            </p>
          </div>
          <div>
            <h4 className="font-display text-lg mb-4">EXPLORE</h4>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Resilient Hub", href: "/resilient-hub" },
                { label: "Booking", href: "/booking" },
                { label: "Blog", href: "/blog" },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-background/70 font-sans text-sm uppercase tracking-wide hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg mb-4">CONTACT</h4>
            <ul className="space-y-3 text-background/70 font-sans text-sm">
              <li>hello@resilientmind.com</li>
              <li>Spain (GMT+1)</li>
            </ul>
            <Link to="/booking" className="inline-block mt-6 px-6 py-3 bg-background text-foreground font-sans font-semibold text-sm uppercase tracking-wide border-2 border-background hover:bg-accent hover:border-accent hover:text-background transition-all">
              Book a Call
            </Link>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t-2 border-background/20">
          <p className="text-xs text-background/50 font-sans uppercase tracking-wide">© {new Date().getFullYear()} Resilient Mind. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-xs text-background/50 font-sans uppercase tracking-wide hover:text-background transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs text-background/50 font-sans uppercase tracking-wide hover:text-background transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;