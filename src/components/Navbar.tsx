import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/resilient-hub", label: "Resilient Hub" },
  { href: "/resilient-hubs", label: "Membership" },
  { href: "/blog", label: "Blog" },
  { href: "/workshopy", label: "Workshops" },
  { href: "/booking", label: "Booking" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
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
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth/CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-24 h-10 bg-muted animate-pulse rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-gold/30 hover:bg-gold/10">
                    <User className="h-4 w-4 mr-2" />
                    {profile?.full_name?.split(' ')[0] || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer text-gold">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-foreground/80 hover:text-foreground">
                  <Link to="/auth">
                    Sign In
                  </Link>
                </Button>
                <Link
                  to="/resilient-hubs"
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-gold text-primary-foreground font-sans font-semibold text-sm rounded-full shadow-gold hover:shadow-elevated transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </Link>
              </>
            )}
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
                  {link.label}
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
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="font-sans text-base font-medium px-2 py-2 text-foreground/80"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="font-sans text-base font-medium px-2 py-2 text-foreground/80"
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="font-sans text-base font-medium px-2 py-2 text-left text-destructive"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="font-sans text-base font-medium px-2 py-2 text-foreground/80"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/resilient-hubs"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-gold text-primary-foreground font-sans font-semibold text-sm rounded-full mt-2"
                  >
                    Get Started
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
