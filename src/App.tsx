import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import About from "./pages/About";
import ResilientHub from "./pages/ResilientHub";
import ResilientHubs from "./pages/ResilientHubs";
import EndometriosisHub from "./pages/EndometriosisHub";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Workshopy from "./pages/Workshopy";
import WorkshopPost from "./pages/WorkshopPost";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import VideoPlayer from "./pages/VideoPlayer";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Pricing from "./pages/Pricing";
import PricingSuccess from "./pages/PricingSuccess";
import Admin from "./pages/Admin";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import FreeGuide from "./pages/FreeGuide";
import Cookies from "./pages/Cookies";
import NotFound from "./pages/NotFound";
import CookieBanner from "./components/CookieBanner";
import { useEffect } from "react";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/resilient-hub" element={<ResilientHub />} />
            <Route path="/resilient-hubs" element={<ResilientHubs />} />
            <Route path="/endometriosis-hub" element={new Date() >= new Date('2026-06-01T00:00:00') ? <EndometriosisHub /> : <NotFound />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/success" element={<BookingSuccess />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/workshopy" element={<Workshopy />} />
            <Route path="/workshopy/:slug" element={<WorkshopPost />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/video/:videoId" element={<VideoPlayer />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/pricing/success" element={<PricingSuccess />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/free-guide" element={<FreeGuide />} />
            <Route path="/cookies" element={<Cookies />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieBanner />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
