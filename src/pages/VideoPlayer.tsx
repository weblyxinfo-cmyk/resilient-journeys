import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Lock, Crown, Play, Clock, CheckCircle2, Circle, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Video = Database['public']['Tables']['videos']['Row'];
type MembershipType = Database['public']['Enums']['membership_type'];

const membershipLabels: Record<MembershipType, string> = {
  free: 'Free',
  basic: 'Basic',
  premium: 'Premium',
};

const membershipHierarchy: Record<MembershipType, number> = {
  free: 0,
  basic: 1,
  premium: 2,
};

/** Convert any YouTube / Vimeo URL into its embeddable form. */
const getEmbedUrl = (url: string): string => {
  const ytWatch = url.match(
    /(?:youtube\.com\/watch\?(?:[^&]*&)*v=)([a-zA-Z0-9_-]+)/
  );
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`;

  const ytShort = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;

  if (url.includes('youtube.com/embed/')) return url;

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return url;
};

const VideoPlayer = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, isAdmin } = useAuth();

  const [video, setVideo] = useState<Video | null>(null);
  const [categoryInfo, setCategoryInfo] = useState<{ is_additional_hub: boolean; hub_slug: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [workbook, setWorkbook] = useState<{ id: string; title: string; file_url: string } | null>(null);

  const abortRef = useRef(0);

  // ─── Fetch video data immediately (no auth wait) ───
  useEffect(() => {
    if (!videoId) return;

    const fetchId = ++abortRef.current;

    const fetchVideo = async () => {
      setLoading(true);
      setFetchError(false);

      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('id', videoId)
          .single();

        if (fetchId !== abortRef.current) return;

        if (error || !data) {
          setVideo(null);
          setCategoryInfo(null);
          setFetchError(true);
          setLoading(false);
          return;
        }

        const { data: category } = await supabase
          .from('video_categories')
          .select('is_additional_hub, hub_slug')
          .eq('id', data.category_id)
          .single();

        if (fetchId !== abortRef.current) return;

        setVideo(data);
        setCategoryInfo(category ?? null);

        const { data: resourceData } = await supabase
          .from('resources')
          .select('id, title, file_url')
          .eq('video_id', videoId)
          .maybeSingle();

        if (fetchId !== abortRef.current) return;
        setWorkbook(resourceData ?? null);
      } catch (err) {
        if (fetchId !== abortRef.current) return;
        console.error('Error fetching video:', err);
        setFetchError(true);
      } finally {
        if (fetchId === abortRef.current) {
          setLoading(false);
        }
      }
    };

    fetchVideo();
  }, [videoId]);

  // ─── Fetch progress separately (needs auth) ───
  useEffect(() => {
    if (!user || !videoId) return;

    supabase
      .from('user_progress')
      .select('completed')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setIsCompleted(data.completed || false);
      });
  }, [user, videoId]);

  // ─── Access check (reactive, no fetch) ───
  const hasAccess = useMemo((): boolean => {
    if (!video) return false;
    if (isAdmin) return true;
    if (video.is_free) return true;
    // Auth still loading — don't deny yet
    if (authLoading) return false;
    if (!profile) return false;

    if (categoryInfo?.is_additional_hub && categoryInfo.hub_slug) {
      return (profile.purchased_hubs || []).includes(categoryInfo.hub_slug);
    }

    const userLevel = membershipHierarchy[profile.membership_type as MembershipType] || 0;
    const requiredLevel = membershipHierarchy[video.min_membership as MembershipType] || 1;

    if (profile.membership_expires_at) {
      if (new Date(profile.membership_expires_at) < new Date()) return false;
    }

    return userLevel >= requiredLevel;
  }, [video, categoryInfo, profile, isAdmin, authLoading]);

  // Are we still waiting for auth to determine access on a paid video?
  const accessPending = !loading && video && !video.is_free && authLoading;

  const toggleCompletion = async () => {
    if (!user || !videoId || progressLoading) return;

    setProgressLoading(true);
    try {
      const newStatus = !isCompleted;
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          video_id: videoId,
          completed: newStatus,
          completed_at: newStatus ? new Date().toISOString() : null,
          last_watched_at: new Date().toISOString(),
        }, { onConflict: 'user_id,video_id' });

      if (error) throw error;
      setIsCompleted(newStatus);
      toast.success(newStatus ? 'Video marked as completed!' : 'Completion unmarked');
    } catch (err) {
      console.error('Error updating progress:', err);
      toast.error('Could not update progress');
    } finally {
      setProgressLoading(false);
    }
  };

  // ─── Loading (video fetch in progress) ───
  if (loading) {
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

  // ─── Waiting for auth on paid video ───
  if (accessPending) {
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
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Not logged in + paid video → sign up prompt ───
  if (!user && video && !video.is_free) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container px-4">
            <div className="max-w-xl mx-auto text-center">
              <Card className="p-8">
                <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h1 className="text-2xl font-serif font-semibold mb-4">
                  Start Free to Watch Videos
                </h1>
                <p className="text-muted-foreground mb-6">
                  Enter your email to get free access to intro videos — no password needed.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild className="bg-gradient-gold text-white">
                    <Link to="/free-guide">Start Free</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/resilient-hub">Back to program</Link>
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

  // ─── Access denied or fetch error ───
  if (fetchError || (video && !hasAccess)) {
    const requiredMembership = (video?.min_membership as MembershipType) || 'basic';
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
                  Requires {membershipLabels[requiredMembership]} membership
                </Badge>
                <h1 className="text-2xl font-serif font-semibold mb-4">
                  Members Only Content
                </h1>
                <p className="text-muted-foreground mb-6">
                  This video is available for members with{' '}
                  <strong>{membershipLabels[requiredMembership]}</strong> level or higher.
                  Upgrade your membership to access all content.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild className="bg-gradient-gold text-white">
                    <Link to="/resilient-hubs#pricing">View pricing</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/resilient-hub">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to program
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

  // ─── No video ───
  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container px-4">
            <div className="max-w-xl mx-auto text-center">
              <Card className="p-8">
                <Play className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h1 className="text-2xl font-serif font-semibold mb-4">
                  Video Not Found
                </h1>
                <Button variant="outline" asChild>
                  <Link to="/resilient-hub">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to program
                  </Link>
                </Button>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Video player ───
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="aspect-video bg-foreground rounded-2xl overflow-hidden mb-6">
              {video.video_url ? (
                <iframe
                  src={getEmbedUrl(video.video_url)}
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

            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge
                  className={
                    video.is_free
                      ? "bg-muted text-muted-foreground"
                      : video.min_membership === 'premium'
                        ? "bg-gradient-gold text-white border-0"
                        : "bg-gold/20 text-gold-dark border-gold/30"
                  }
                  variant="outline"
                >
                  {video.is_free ? 'Free' : membershipLabels[video.min_membership as MembershipType]}
                </Badge>
                {video.duration_minutes && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {video.duration_minutes} min
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                {video.title}
              </h1>

              {video.description && (
                <p className="text-muted-foreground text-lg mb-6">
                  {video.description}
                </p>
              )}

              {workbook && (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-gold/30 text-gold hover:bg-gold hover:text-white mb-4"
                  onClick={() => window.open(workbook.file_url, '_blank')}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Workbook (PDF)
                </Button>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
                <Button
                  onClick={toggleCompletion}
                  disabled={progressLoading}
                  variant={isCompleted ? "default" : "outline"}
                  className={
                    isCompleted
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "border-gold text-gold hover:bg-gold hover:text-white"
                  }
                >
                  {progressLoading ? (
                    <>
                      <Circle className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : isCompleted ? (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="mr-2 h-5 w-5" />
                      Mark as completed
                    </>
                  )}
                </Button>

                {isCompleted && (
                  <span className="text-sm text-muted-foreground">
                    Great job! Continue with the next video.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VideoPlayer;
