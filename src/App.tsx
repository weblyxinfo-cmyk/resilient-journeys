import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { lazy, Suspense, useEffect, Component, ReactNode } from "react";
import CookieBanner from "./components/CookieBanner";
import { Loader2 } from "lucide-react";

// Eagerly load the homepage (most common entry point)
import Index from "./pages/Index";

// Lazy load all other routes
const About = lazy(() => import("./pages/About"));
const ResilientHub = lazy(() => import("./pages/ResilientHub"));
const ResilientHubs = lazy(() => import("./pages/ResilientHubs"));
const EndometriosisHub = lazy(() => import("./pages/EndometriosisHub"));
const Booking = lazy(() => import("./pages/Booking"));
const BookingSuccess = lazy(() => import("./pages/BookingSuccess"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Workshopy = lazy(() => import("./pages/Workshopy"));
const WorkshopPost = lazy(() => import("./pages/WorkshopPost"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const VideoPlayer = lazy(() => import("./pages/VideoPlayer"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Membership = lazy(() => import("./pages/Membership"));
const Membership2 = lazy(() => import("./pages/Membership2"));
const PricingSuccess = lazy(() => import("./pages/PricingSuccess"));
const Admin = lazy(() => import("./pages/Admin"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const FreeGuide = lazy(() => import("./pages/FreeGuide"));
const FreeGuideThankYou = lazy(() => import("./pages/FreeGuideThankYou"));
const Cookies = lazy(() => import("./pages/Cookies"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-gold" />
  </div>
);

// Error boundary for lazy-loaded chunks that fail to load
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-lg text-foreground mb-4">Something went wrong loading this page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-gold text-white font-semibold rounded-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/resilient-hub" element={<ResilientHub />} />
                <Route path="/resilient-hubs" element={<ResilientHubs />} />
                <Route path="/endometriosis-hub" element={<EndometriosisHub />} />
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
                <Route path="/membership" element={<Membership />} />
                <Route path="/membership2" element={<Membership2 />} />
                <Route path="/pricing/success" element={<PricingSuccess />} />
                <Route path="/thank-you-membership" element={<PricingSuccess />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/free-guide" element={<FreeGuide />} />
                <Route path="/thank-you" element={<FreeGuideThankYou />} />
                <Route path="/cookies" element={<Cookies />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
          <CookieBanner />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
