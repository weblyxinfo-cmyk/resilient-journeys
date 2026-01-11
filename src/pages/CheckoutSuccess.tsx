import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, PartyPopper } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const { refreshProfile, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh the profile to get updated membership
    const refreshMembership = async () => {
      await refreshProfile();
      setLoading(false);
    };
    
    // Wait a bit for webhook to process
    const timer = setTimeout(refreshMembership, 2000);
    return () => clearTimeout(timer);
  }, [refreshProfile]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container px-4">
          <div className="max-w-lg mx-auto text-center">
            <Card className="border-gold/30 overflow-hidden">
              <div className="bg-gradient-gold p-8">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto">
                  {loading ? (
                    <Loader2 className="h-10 w-10 text-gold animate-spin" />
                  ) : (
                    <CheckCircle className="h-10 w-10 text-gold" />
                  )}
                </div>
              </div>
              
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <PartyPopper className="h-6 w-6 text-gold" />
                  <span className="text-gold font-semibold">Děkujeme!</span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                  Platba byla úspěšná
                </h1>
                
                <p className="text-muted-foreground mb-6">
                  {loading 
                    ? 'Aktivujeme vaše členství...'
                    : 'Vaše členství bylo aktivováno. Nyní máte přístup k veškerému obsahu podle vaší úrovně členství.'
                  }
                </p>

                {!loading && profile && (
                  <div className="mb-6 p-4 bg-gradient-warm rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Vaše členství</p>
                    <p className="font-serif font-semibold text-lg capitalize">
                      {profile.membership_type}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild className="bg-gradient-gold text-white">
                    <Link to="/dashboard">Přejít do dashboardu</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/resilient-hub">Prozkoumat program</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
