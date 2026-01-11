import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Lock, Crown, Play, Clock, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Video = Database['public']['Tables']['videos']['Row'];
type MembershipType = Database['public']['Enums']['membership_type'];

const membershipLabels: Record<MembershipType, string> = {
  free: 'Zdarma',
  basic: 'Basic',
  premium: 'Premium',
};

const membershipHierarchy: Record<MembershipType, number> = {
  free: 0,
  basic: 1,
  premium: 2,
};

const VideoPlayer = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [requiredMembership, setRequiredMembership] = useState<MembershipType>('basic');

  // Check if user has access based on membership
  const hasAccess = (videoMinMembership: MembershipType, isFree: boolean): boolean => {
    if (isFree) return true;
    if (!profile) return false;
    
    const userLevel = membershipHierarchy[profile.membership_type as MembershipType] || 0;
    const requiredLevel = membershipHierarchy[videoMinMembership] || 1;
    
    // Check if membership is still valid
    if (profile.membership_expires_at) {
      const expiresAt = new Date(profile.membership_expires_at);
      if (expiresAt < new Date()) return false;
    }
    
    return userLevel >= requiredLevel;
  };

  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId) {
        navigate('/resilient-hub');
        return;
      }

      try {
        // First try to fetch the video (RLS will handle access control)
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('id', videoId)
          .single();

        if (error) {
          // If we can't fetch, try to get minimal info to show upgrade prompt
          // This requires a separate query without RLS (not possible directly)
          // So we'll just show a generic access denied
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        if (data) {
          // Double-check access on frontend
          if (!hasAccess(data.min_membership as MembershipType, data.is_free)) {
            setAccessDenied(true);
            setRequiredMembership(data.min_membership as MembershipType);
          } else {
            setVideo(data);
          }
        }
      } catch (err) {
        console.error('Error fetching video:', err);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchVideo();
    }
  }, [videoId, authLoading, profile, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="aspect-video bg-muted rounded-2xl mb-6" />
                <div className="h-8 bg-muted rounded w-2/3 mb-4" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container px-4">
            <div className="max-w-xl mx-auto text-center">
              <Card className="p-8">
                <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h1 className="text-2xl font-serif font-semibold mb-4">
                  Přihlaste se pro přístup
                </h1>
                <p className="text-muted-foreground mb-6">
                  Pro sledování videí je nutné se přihlásit do svého účtu.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild className="bg-gradient-gold text-white">
                    <Link to="/auth">Přihlásit se</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/resilient-hub">Zpět na program</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Access denied - needs upgrade
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container px-4">
            <div className="max-w-xl mx-auto text-center">
              <Card className="p-8 border-gold/30">
                <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="h-10 w-10 text-white" />
                </div>
                <Badge className="mb-4 bg-gold/20 text-gold-dark border-gold/30">
                  Vyžaduje {membershipLabels[requiredMembership]} členství
                </Badge>
                <h1 className="text-2xl font-serif font-semibold mb-4">
                  Obsah pro členy
                </h1>
                <p className="text-muted-foreground mb-6">
                  Toto video je dostupné pro členy s úrovní{' '}
                  <strong>{membershipLabels[requiredMembership]}</strong> nebo vyšší.
                  Upgradujte své členství pro přístup k veškerému obsahu.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild className="bg-gradient-gold text-white">
                    <Link to="/resilient-hub#pricing">Zobrazit ceník</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/resilient-hub">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Zpět na program
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Video player
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <Button 
              variant="ghost" 
              className="mb-6" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zpět
            </Button>

            {/* Video player */}
            <div className="aspect-video bg-foreground rounded-2xl overflow-hidden mb-6">
              {video?.video_url ? (
                <iframe
                  src={video.video_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="h-20 w-20 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Video info */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge 
                  className={
                    video?.is_free 
                      ? "bg-muted text-muted-foreground" 
                      : video?.min_membership === 'premium'
                        ? "bg-gradient-gold text-white border-0"
                        : "bg-gold/20 text-gold-dark border-gold/30"
                  }
                  variant="outline"
                >
                  {video?.is_free ? 'Zdarma' : membershipLabels[video?.min_membership as MembershipType]}
                </Badge>
                {video?.duration_minutes && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {video.duration_minutes} min
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                {video?.title}
              </h1>
              
              {video?.description && (
                <p className="text-muted-foreground text-lg">
                  {video.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VideoPlayer;
