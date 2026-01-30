import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Crown, Loader2, ArrowRight, Video, FileText, Calendar } from "lucide-react";

const PricingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      setProcessing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16">
        <section className="py-12">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              {processing ? (
                <Card className="border-primary/20 text-center">
                  <CardContent className="py-16">
                    <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-6" />
                    <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                      Processing Your Payment...
                    </h1>
                    <p className="text-muted-foreground">
                      Please wait while we activate your membership.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {/* Success Message */}
                  <Card className="border-primary/20 bg-gradient-warm">
                    <CardContent className="py-12 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>

                      <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
                        Welcome to Your Journey!
                      </h1>

                      <p className="text-lg text-muted-foreground mb-6">
                        Your payment was successful and your membership is now active.
                      </p>

                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                        <Crown size={16} className="text-primary" />
                        <span className="text-sm font-medium text-primary">
                          Membership Activated
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* What Happens Next */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl font-serif">
                        What Happens Next?
                      </CardTitle>
                      <CardDescription>
                        Here's what you can expect in the coming moments
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            <span className="text-primary font-semibold">1</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Email Confirmation</h3>
                          <p className="text-sm text-muted-foreground">
                            You'll receive a confirmation email with your membership details and receipt within the next few minutes.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            <span className="text-primary font-semibold">2</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Dashboard Access</h3>
                          <p className="text-sm text-muted-foreground">
                            Your dashboard is now unlocked with all the content available for your membership tier.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            <span className="text-primary font-semibold">3</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Start Learning</h3>
                          <p className="text-sm text-muted-foreground">
                            Begin with the introduction videos and explore your personalized 12-month program.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Access Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-primary/20 hover:shadow-elevated transition-all">
                      <CardHeader>
                        <div className="p-3 bg-primary/10 rounded-full w-fit mb-2">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg font-serif">
                          Watch Videos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Access your weekly video content and start your transformation journey.
                        </p>
                        <Link to="/dashboard">
                          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                            Go to Dashboard
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/20 hover:shadow-elevated transition-all">
                      <CardHeader>
                        <div className="p-3 bg-primary/10 rounded-full w-fit mb-2">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg font-serif">
                          Download Resources
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Get your workbooks, worksheets, and meditation guides.
                        </p>
                        <Link to="/dashboard?tab=resources">
                          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                            View Resources
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/20 hover:shadow-elevated transition-all">
                      <CardHeader>
                        <div className="p-3 bg-primary/10 rounded-full w-fit mb-2">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg font-serif">
                          Book a Session
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Premium members can schedule their consultation sessions.
                        </p>
                        <Link to="/booking">
                          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                            Book Now
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>

                  {/* CTA */}
                  <Card className="bg-gradient-gold text-white border-0">
                    <CardContent className="py-8 text-center">
                      <h2 className="text-2xl font-serif font-semibold mb-4">
                        Ready to Start Your Transformation?
                      </h2>
                      <p className="mb-6 opacity-90">
                        Head to your dashboard and begin exploring your personalized program.
                      </p>
                      <Link to="/dashboard">
                        <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                          Go to Dashboard
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Support Info */}
                  <Card className="bg-muted/30">
                    <CardContent className="py-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Need help getting started? Have questions?{" "}
                        <Link to="/booking" className="text-primary hover:underline font-medium">
                          Book a free discovery call
                        </Link>{" "}
                        or reach out to us at{" "}
                        <a href="mailto:support@resilient-journeys.com" className="text-primary hover:underline font-medium">
                          support@resilient-journeys.com
                        </a>
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingSuccess;
