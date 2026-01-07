import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-6">
        <div
          className="inline-block mb-8 px-8 py-4 bg-brutal-yellow border-2 border-foreground"
          style={{
            boxShadow: "6px 6px 0 0 hsl(var(--brutal-black))",
          }}
        >
          <span className="text-8xl md:text-9xl font-display">404</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-display mb-4">
          Page Not Found
        </h1>

        <p className="text-muted-foreground font-sans mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Home size={18} />
            Return to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
