import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCms } from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "./Logo";

const navLinks = [
  { href: "/", key: "navbar_link_home", label: "Home" },
  { href: "/about", key: "navbar_link_about", label: "About" },
  { href: "/resilient-hub", key: "navbar_link_resilient_hub", label: "Resilient Hub" },
  { href: "/membership", key: "navbar_link_membership", label: "Membership" },
  { href: "/blog", key: "navbar_link_blog", label: "Blog" },
  { href: "/workshopy", key: "navbar_link_workshops", label: "Workshops" },
  { href: "/booking", key: "navbar_link_booking", label: "Booking" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, profile, isAdmin, signOut, loading } = useAuth();
  const { t } = useCms();

  const handleSignOut = () => {
    // Fire and forget — don't wait for API
    supabase.auth.signOut().catch(() => {});
    // Clear auth storage directly
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
    } catch {}
    // Hard redirect immediately
    window.location.href = '/';
  };

  return (
    <nav id="cms-navbar-menu" className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-sans text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/80"
                }`}
              >
                {t(link.key, link.label)}
              </Link>
            ))}
          </div>

          {/* Auth/CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-gold/30 hover:bg-gold/10">
                    <User className="h-4 w-4 mr-2" />
                    {profile?.full_name?.split(' ')[0] || t("navbar_account_fallback_label", "Account")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer text-gold">
                          <Shield className="h-4 w-4 mr-2" />
                          {t("navbar_account_admin_panel", "Admin Panel")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      {t("navbar_account_dashboard", "Dashboard")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      {t("navbar_account_profile_settings", "Profile Settings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button type="button" onClick={handleSignOut} className="w-full text-left cursor-pointer text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("navbar_account_sign_out", "Sign Out")}
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !loading ? (
              <>
                <Button asChild variant="ghost" className="text-foreground/80 hover:text-foreground">
                  <Link to="/auth">
                    {t("navbar_account_sign_in", "Sign In")}
                  </Link>
                </Button>
                <Link
                  to="/membership"
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-gold text-primary-foreground font-sans font-semibold text-sm rounded-full shadow-gold hover:shadow-elevated transition-all duration-300 hover:scale-105"
                >
                  {t("navbar_account_get_started", "Get Started")}
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`font-sans text-base font-medium transition-colors hover:text-primary px-2 py-2 ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-foreground/80"
                  }`}
                >
                  {t(link.key, link.label)}
                </Link>
              ))}

              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="font-sans text-base font-medium px-2 py-2 text-gold flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      {t("navbar_account_admin_panel", "Admin Panel")}
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="font-sans text-base font-medium px-2 py-2 text-foreground/80"
                  >
                    {t("navbar_account_dashboard", "Dashboard")}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="font-sans text-base font-medium px-2 py-2 text-foreground/80"
                  >
                    {t("navbar_account_profile_settings", "Profile Settings")}
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="font-sans text-base font-medium px-2 py-2 text-left text-destructive"
                  >
                    {t("navbar_account_sign_out", "Sign Out")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="font-sans text-base font-medium px-2 py-2 text-foreground/80"
                  >
                    {t("navbar_account_sign_in", "Sign In")}
                  </Link>
                  <Link
                    to="/membership"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-gold text-primary-foreground font-sans font-semibold text-sm rounded-full mt-2"
                  >
                    {t("navbar_account_get_started", "Get Started")}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
