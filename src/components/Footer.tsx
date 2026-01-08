import { Link } from "react-router-dom";
import { Mail, Instagram, Facebook, Linkedin } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <Logo />
            </div>
            <p className="text-muted-foreground font-sans max-w-sm mb-6">
              Helping expat families build resilience through creative art therapy
              and evidence-based techniques. Based in Spain, serving worldwide.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Instagram, href: "#" },
                { icon: Facebook, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Mail, href: "mailto:hello@resilientmind.com" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4">Explore</h4>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "About Me", href: "/about" },
                { label: "Resilient Hub", href: "/resilient-hub" },
                { label: "Book a Session", href: "/booking" },
                { label: "Blog", href: "/blog" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground font-sans hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-3 text-muted-foreground font-sans">
              <li>hello@resilientmind.com</li>
              <li>Spain (GMT+1)</li>
              <li className="pt-4">
                <Link
                  to="/booking"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-gold text-primary-foreground font-semibold text-sm rounded-full shadow-gold hover:shadow-elevated transition-all duration-300"
                >
                  Book a Call
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground font-sans">
            © {new Date().getFullYear()} Resilient Mind. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground font-sans hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground font-sans hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
