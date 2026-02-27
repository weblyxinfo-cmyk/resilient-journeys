import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  User,
  Crown,
  Play,
  Lock,
  Calendar,
  Settings,
  LogOut,
  Heart,
  Brain,
  Shield,
  Palette,
  Eye,
  Users,
  Zap,
  Compass,
  Target,
  Globe,
  Sun,
  Puzzle,
  Download,
  FileText,
  Music,
  File,
  ArrowLeft,
  Sparkles,
  GraduationCap,
  Video
} from 'lucide-react';
import UserBookings from '@/components/booking/UserBookings';
import FreeGuideKit from '@/components/FreeGuideKit';

interface VideoCategory {
  id: string;
  name: string;
  description: string;
  month_number: number;
  icon: string;
  is_additional_hub?: boolean;
  hub_slug?: string | null;
}

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  is_free: boolean;
  min_membership: 'free' | 'basic' | 'premium';
  category_id: string;
  week_number?: number;
  video_type?: 'eft' | 'art' | 'art_therapy' | 'meditation';
  is_intro?: boolean;
}

interface Resource {
  id: string;
  category_id: string | null;
  video_id: string | null;
  title: string;
  description: string | null;
  resource_type: 'worksheet' | 'meditation' | 'pdf' | 'audio' | 'video' | 'other';
  resource_subtype?: string;
  file_url: string;
  file_size_mb: number | null;
  min_membership: 'free' | 'basic' | 'premium';
  is_free: boolean;
  download_count?: number;
  week_number?: number;
}

const iconMap: { [key: string]: React.ElementType } = {
  heart: Heart,
  brain: Brain,
  shield: Shield,
  palette: Palette,
  eye: Eye,
  users: Users,
  zap: Zap,
  compass: Compass,
  target: Target,
  globe: Globe,
  sun: Sun,
  puzzle: Puzzle
};

const membershipLabels = {
  free: 'Free',
  basic: 'Basic',
  premium: 'Premium'
};

const membershipColors = {
  free: 'bg-muted text-muted-foreground',
  basic: 'bg-gold/20 text-gold-dark',
  premium: 'bg-gradient-gold text-white'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [completedVideos, setCompletedVideos] = useState(0);
  const [totalAccessibleVideos, setTotalAccessibleVideos] = useState(0);
  const [premiumCredits, setPremiumCredits] = useState<{ total: number; used: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const canAccessVideo = useCallback((video: Video) => {
    if (isAdmin) return true;
    if (video.is_free) return true;
    if (!profile) return false;

    // Check if video belongs to a purchased hub
    const category = categories.find(c => c.id === video.category_id);
    if (category?.is_additional_hub && category.hub_slug) {
      return (profile.purchased_hubs || []).includes(category.hub_slug);
    }

    const membershipOrder = { free: 0, basic: 1, premium: 2 };
    return membershipOrder[profile.membership_type] >= membershipOrder[video.min_membership];
  }, [profile, categories, isAdmin]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Welcome message for free guide users
  useEffect(() => {
    if (!loading && user && searchParams.get('free_guide') === 'true') {
      toast.success('Welcome! Your Free Guide Kit is ready below.', {
        description: 'Follow the 3-step daily practice to start your resilience journey.',
        duration: 6000,
      });
      // Remove the query parameter from URL
      searchParams.delete('free_guide');
      setSearchParams(searchParams, { replace: true });
    }
  }, [user, loading, searchParams, setSearchParams]);

  const handleSignOut = () => {
    supabase.auth.signOut().catch(() => {});
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
    } catch {}
    window.location.href = '/';
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Run all queries in parallel for speed
        const [categoriesRes, videosRes, progressRes, resourcesRes] = await Promise.all([
          supabase.from('video_categories').select('*').order('month_number'),
          supabase.from('videos').select('*').order('sort_order'),
          user ? supabase.from('user_progress').select('completed').eq('user_id', user.id).eq('completed', true) : Promise.resolve({ data: null }),
          supabase.from('resources').select('*').order('sort_order'),
        ]);

        if (categoriesRes.data) setCategories(categoriesRes.data);
        if (videosRes.data) {
          setVideos(videosRes.data as Video[]);
          const accessible = (videosRes.data as Video[]).filter(v => canAccessVideo(v));
          setTotalAccessibleVideos(accessible.length);
        }
        if (progressRes.data) setCompletedVideos(progressRes.data.length);
        if (resourcesRes.data) setResources(resourcesRes.data as Resource[]);

        // Fetch premium credits if user is premium (separate, non-blocking)
        if (user && profile?.membership_type === 'premium') {
          const currentYear = new Date().getFullYear();
          const { data: creditsData } = await supabase
            .from('premium_credits')
            .select('total_credits, used_credits')
            .eq('user_id', user.id)
            .eq('year', currentYear)
            .maybeSingle();

          if (creditsData) {
            setPremiumCredits({ total: creditsData.total_credits, used: creditsData.used_credits });
          } else {
            await supabase.from('premium_credits').insert({
              user_id: user.id, year: currentYear, total_credits: 4, used_credits: 0
            });
            setPremiumCredits({ total: 4, used: 0 });
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard content:', err);
      }

      setLoadingContent(false);
    };

    if (user) {
      fetchContent();
    }
  }, [user, profile, canAccessVideo]);

  const getResourceIcon = (type: Resource['resource_type']) => {
    switch (type) {
      case 'worksheet':
      case 'pdf':
        return FileText;
      case 'meditation':
      case 'audio':
        return Music;
      default:
        return File;
    }
  };

  const handleDownloadResource = async (resource: Resource) => {
    try {
      // Increment download count
      await supabase
        .from('resources')
        .update({ download_count: (resource.download_count || 0) + 1 })
        .eq('id', resource.id);

      // Open file in new tab
      window.open(resource.file_url, '_blank');
      toast.success(`Downloading: ${resource.title}`);
    } catch (err) {
      console.error('Error downloading resource:', err);
      toast.error('Failed to download file');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-24" style={{ minHeight: 'calc(100vh - 6rem)' }}>
          <div className="animate-pulse text-gold">Loading...</div>
        </div>
      </div>
    );
  }

  // CategoryWeekView Component
  const CategoryWeekView = () => {
    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return null;

    const IconComponent = iconMap[category.icon] || Heart;
    const categoryVideos = videos.filter(v => v.category_id === category.id);

    // Get video for selected week (1 video per week)
    const weekVideo = categoryVideos.find(v => v.week_number === selectedWeek && !v.is_intro) || null;
    const hasAccess = weekVideo ? canAccessVideo(weekVideo) : false;

    // Get workbook linked to this video via video_id
    const workbook = weekVideo
      ? resources.find(r => r.video_id === weekVideo.id)
      : null;

    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="border-gold/30 hover:bg-gold/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gold/10 rounded-full">
              <IconComponent className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-foreground">
                {category.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Month {category.month_number} - {category.description}
              </p>
            </div>
          </div>
        </div>

        {/* Week Tabs */}
        <Tabs value={selectedWeek.toString()} onValueChange={(v) => setSelectedWeek(Number(v))}>
          <TabsList className="bg-cream/50">
            {[1, 2, 3, 4, 5].map(week => (
              <TabsTrigger
                key={week}
                value={week.toString()}
                className="data-[state=active]:bg-gold data-[state=active]:text-white"
              >
                {week === 5 ? 'Free Bonus' : `Week ${week}`}
              </TabsTrigger>
            ))}
          </TabsList>

          {[1, 2, 3, 4, 5].map(week => {
            const wVideo = categoryVideos.find(v => v.week_number === week && !v.is_intro) || null;
            const wAccess = wVideo ? canAccessVideo(wVideo) : false;
            const wWorkbook = wVideo ? resources.find(r => r.video_id === wVideo.id) : null;

            return (
              <TabsContent key={week} value={week.toString()} className="space-y-6 mt-6">
                {wVideo ? (
                  <Card className="border-gold/20 hover:shadow-elegant transition-all">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gold/10 rounded-full">
                          <Play className="h-6 w-6 text-gold" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="font-serif text-xl">
                            {wVideo.title}
                          </CardTitle>
                          {wVideo.duration_minutes && (
                            <CardDescription className="text-xs mt-1">
                              {wVideo.duration_minutes} min
                            </CardDescription>
                          )}
                        </div>
                        {wVideo.is_free && (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Free</Badge>
                        )}
                      </div>
                      {wVideo.description && (
                        <CardDescription className="text-sm">
                          {wVideo.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {wAccess ? (
                        <Button
                          className="w-full bg-gold hover:bg-gold-dark text-white"
                          onClick={() => navigate(`/video/${wVideo.id}`)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch Video
                        </Button>
                      ) : (
                        <Button asChild variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-white">
                          <Link to="/resilient-hub">
                            <Lock className="h-4 w-4 mr-2" />
                            Unlock
                          </Link>
                        </Button>
                      )}

                      {/* Workbook download */}
                      {wWorkbook && wAccess && (
                        <Button
                          variant="outline"
                          className="w-full border-gold/30 hover:bg-gold/10"
                          onClick={() => handleDownloadResource(wWorkbook)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Workbook
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-gold/20 opacity-60 bg-muted/30">
                    <CardContent className="py-12 text-center">
                      <Sparkles className="h-8 w-8 text-gold/40 mx-auto mb-3" />
                      <h3 className="font-serif text-lg mb-1">{week === 5 ? 'Free Bonus' : `Week ${week}`}</h3>
                      <p className="text-sm text-muted-foreground">
                        Content coming soon
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">
                Welcome, {profile?.full_name || 'member'}
              </h1>
              <div className="flex items-center gap-3">
                <Badge className={membershipColors[profile?.membership_type || 'free']}>
                  {profile?.membership_type === 'premium' && <Crown className="h-3 w-3 mr-1" />}
                  {membershipLabels[profile?.membership_type || 'free']}
                </Badge>
                {(!profile || profile.membership_type === 'free') && (
                  <Button asChild variant="outline" size="sm" className="border-gold text-gold hover:bg-gold hover:text-white">
                    <Link to="/resilient-hub">
                      Upgrade Membership
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-gold/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gold/10 rounded-full">
                    <Play className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-semibold">
                      {completedVideos} / {totalAccessibleVideos}
                    </p>
                    {totalAccessibleVideos > 0 && (
                      <div className="mt-2 w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-gold h-2 rounded-full transition-all"
                          style={{ width: `${(completedVideos / totalAccessibleVideos) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-gold/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gold/10 rounded-full">
                    <Calendar className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Program Month</p>
                    <p className="text-2xl font-semibold">1 / 12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-gold/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gold/10 rounded-full">
                    <Crown className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Membership</p>
                    <p className="text-2xl font-semibold capitalize">
                      {membershipLabels[profile?.membership_type || 'free']}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Premium Community - Skool & Zoom */}
          {profile?.membership_type === 'premium' && (
            <div className="mb-8">
              <h2 className="font-serif text-xl md:text-2xl text-foreground mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-gold" />
                Premium Community
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-gold/20 hover:shadow-elegant transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-gold/10 rounded-full">
                        <GraduationCap className="h-6 w-6 text-gold" />
                      </div>
                      <div>
                        <CardTitle className="font-serif text-lg">Skool Community</CardTitle>
                        <CardDescription>Connect with fellow premium members</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Join our private Skool community for discussions, resources, and peer support from expats around the world.
                    </p>
                    <Button
                      className="w-full bg-gold hover:bg-gold-dark text-white"
                      onClick={() => window.open('https://www.skool.com/resilient-mind-expats-premium-3871', '_blank')}
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Join Community
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-gold/20 opacity-60">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-muted rounded-full">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="font-serif text-lg text-muted-foreground">Live Group Sessions</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs text-muted-foreground">
                          Coming Soon
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Live group sessions are being prepared. In the meantime, connect with fellow members in our Skool community.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Free Guide Kit - shown for free members */}
          {(!profile || profile.membership_type === 'free') && (
            <FreeGuideKit
              videos={videos}
              onNavigateToVideo={(videoId) => navigate(`/video/${videoId}`)}
            />
          )}

          {/* Content Tabs */}
          <Tabs defaultValue="program" className="w-full">
            <TabsList className="bg-cream/50 mb-6">
              <TabsTrigger value="program" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                12-Month Program
              </TabsTrigger>
              <TabsTrigger value="resources" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                Resources
              </TabsTrigger>
              <TabsTrigger value="sessions" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                Sessions
              </TabsTrigger>
            </TabsList>

            {/* Program Tab */}
            <TabsContent value="program">
              {loadingContent ? (
                <div className="text-center py-12 text-muted-foreground">Loading content...</div>
              ) : categories.length === 0 ? (
                <Card className="border-gold/20">
                  <CardContent className="py-12 text-center">
                    <Play className="h-12 w-12 text-gold/50 mx-auto mb-4" />
                    <h3 className="font-serif text-xl mb-2">Content Coming Soon</h3>
                    <p className="text-muted-foreground">
                      We're preparing video lessons and materials. Stay tuned for updates!
                    </p>
                  </CardContent>
                </Card>
              ) : selectedCategory ? (
                <CategoryWeekView />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => {
                    const IconComponent = iconMap[category.icon] || Heart;
                    const categoryVideos = videos.filter(v => v.category_id === category.id);
                    const hasAccess = categoryVideos.some(v => canAccessVideo(v));

                    return (
                      <Card
                        key={category.id}
                        className={`border-gold/20 transition-all hover:shadow-elegant ${!hasAccess ? 'opacity-60' : 'cursor-pointer hover:-translate-y-1'}`}
                        onClick={() => {
                          if (hasAccess) {
                            setSelectedCategory(category.id);
                            setSelectedWeek(1);
                          }
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-gold/10 rounded-full">
                              <IconComponent className="h-5 w-5 text-gold" />
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Month {category.month_number}
                            </Badge>
                          </div>
                          <CardTitle className="font-serif text-xl flex items-center gap-2">
                            {category.name}
                            {!hasAccess && <Lock className="h-4 w-4 text-muted-foreground" />}
                          </CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {categoryVideos.length} {categoryVideos.length === 1 ? 'video' : 'videos'}
                            </span>
                            {hasAccess ? (
                              <Button size="sm" className="bg-gold hover:bg-gold-dark text-white">
                                <Play className="h-4 w-4 mr-1" />
                                Start
                              </Button>
                            ) : (
                              <Button asChild size="sm" variant="outline" className="border-gold text-gold">
                                <Link to="/resilient-hub" onClick={(e) => e.stopPropagation()}>
                                  Unlock
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources">
              {loadingContent ? (
                <div className="text-center py-12 text-muted-foreground">Loading resources...</div>
              ) : resources.length === 0 ? (
                <Card className="border-gold/20">
                  <CardContent className="py-12 text-center">
                    <div className="p-4 bg-gold/10 rounded-full w-fit mx-auto mb-4">
                      <Palette className="h-8 w-8 text-gold" />
                    </div>
                    <h3 className="font-serif text-xl mb-2">Workbook Materials</h3>
                    <p className="text-muted-foreground mb-6">
                      Downloadable worksheets, meditations, and creative exercises
                    </p>
                    {profile?.membership_type === 'free' ? (
                      <Button asChild className="bg-gold hover:bg-gold-dark text-white">
                        <Link to="/resilient-hub">
                          Get Access to Materials
                        </Link>
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">Materials will be available soon</p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((resource) => {
                    const IconComponent = getResourceIcon(resource.resource_type);
                    return (
                      <Card key={resource.id} className="border-gold/20 hover:shadow-elegant transition-all">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-gold/10 rounded-lg">
                                <IconComponent className="h-5 w-5 text-gold" />
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {resource.resource_type}
                              </Badge>
                            </div>
                            {resource.file_size_mb && (
                              <span className="text-xs text-muted-foreground">
                                {resource.file_size_mb.toFixed(1)} MB
                              </span>
                            )}
                          </div>
                          <CardTitle className="font-serif text-lg mt-2">
                            {resource.title}
                          </CardTitle>
                          {resource.description && (
                            <CardDescription className="text-sm">
                              {resource.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <Button
                            onClick={() => handleDownloadResource(resource)}
                            className="w-full bg-gold hover:bg-gold-dark text-white"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions">
              <div className="space-y-6">
                {/* Premium Credits Widget - only for premium members */}
                {profile?.membership_type === 'premium' && premiumCredits && (
                  <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-transparent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-gold rounded-full">
                            <Crown className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="font-serif text-xl">Premium Consultations</CardTitle>
                            <CardDescription>Your annual consultation credits for {new Date().getFullYear()}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-3xl font-semibold text-gold">
                            {premiumCredits.total - premiumCredits.used} / {premiumCredits.total}
                          </p>
                          <p className="text-sm text-muted-foreground">Sessions remaining</p>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className="bg-gradient-gold h-3 rounded-full transition-all"
                          style={{ width: `${((premiumCredits.total - premiumCredits.used) / premiumCredits.total) * 100}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* User Bookings */}
                <UserBookings />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
