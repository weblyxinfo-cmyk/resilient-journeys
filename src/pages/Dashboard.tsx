import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Puzzle
} from 'lucide-react';

interface VideoCategory {
  id: string;
  name: string;
  description: string;
  month_number: number;
  icon: string;
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
  free: 'Zdarma',
  basic: 'Základní',
  premium: 'Premium'
};

const membershipColors = {
  free: 'bg-muted text-muted-foreground',
  basic: 'bg-gold/20 text-gold-dark',
  premium: 'bg-gradient-gold text-white'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchContent = async () => {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('video_categories')
        .select('*')
        .order('month_number');
      
      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch videos
      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .order('sort_order');
      
      if (videosData) {
        setVideos(videosData as Video[]);
      }

      setLoadingContent(false);
    };

    if (user) {
      fetchContent();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const canAccessVideo = (video: Video) => {
    if (video.is_free) return true;
    if (!profile) return false;
    
    const membershipOrder = { free: 0, basic: 1, premium: 2 };
    return membershipOrder[profile.membership_type] >= membershipOrder[video.min_membership];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gold">Načítám...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">
                Vítejte, {profile?.full_name || 'člene'}
              </h1>
              <div className="flex items-center gap-3">
                <Badge className={membershipColors[profile?.membership_type || 'free']}>
                  {profile?.membership_type === 'premium' && <Crown className="h-3 w-3 mr-1" />}
                  {membershipLabels[profile?.membership_type || 'free']}
                </Badge>
                {profile?.membership_type === 'free' && (
                  <Link to="/resilient-hub">
                    <Button variant="outline" size="sm" className="border-gold text-gold hover:bg-gold hover:text-white">
                      Upgradovat členství
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                <Settings className="h-4 w-4 mr-2" />
                Nastavení
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Odhlásit
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
                    <p className="text-sm text-muted-foreground">Dostupná videa</p>
                    <p className="text-2xl font-semibold">
                      {videos.filter(v => canAccessVideo(v)).length} / {videos.length}
                    </p>
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
                    <p className="text-sm text-muted-foreground">Měsíc programu</p>
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
                    <p className="text-sm text-muted-foreground">Členství</p>
                    <p className="text-2xl font-semibold capitalize">
                      {membershipLabels[profile?.membership_type || 'free']}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="program" className="w-full">
            <TabsList className="bg-cream/50 mb-6">
              <TabsTrigger value="program" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                12 Měsíců Program
              </TabsTrigger>
              <TabsTrigger value="resources" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                Zdroje
              </TabsTrigger>
              <TabsTrigger value="sessions" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                Konzultace
              </TabsTrigger>
            </TabsList>

            {/* Program Tab */}
            <TabsContent value="program">
              {loadingContent ? (
                <div className="text-center py-12 text-muted-foreground">Načítám obsah...</div>
              ) : categories.length === 0 ? (
                <Card className="border-gold/20">
                  <CardContent className="py-12 text-center">
                    <Play className="h-12 w-12 text-gold/50 mx-auto mb-4" />
                    <h3 className="font-serif text-xl mb-2">Brzy přidáme obsah</h3>
                    <p className="text-muted-foreground">
                      Pracujeme na přípravě video lekcí a materiálů. Sledujte novinky!
                    </p>
                  </CardContent>
                </Card>
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
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-gold/10 rounded-full">
                              <IconComponent className="h-5 w-5 text-gold" />
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Měsíc {category.month_number}
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
                              {categoryVideos.length} {categoryVideos.length === 1 ? 'video' : 'videí'}
                            </span>
                            {hasAccess ? (
                              <Button size="sm" className="bg-gold hover:bg-gold-dark text-white">
                                <Play className="h-4 w-4 mr-1" />
                                Spustit
                              </Button>
                            ) : (
                              <Link to="/resilient-hub">
                                <Button size="sm" variant="outline" className="border-gold text-gold">
                                  Odemknout
                                </Button>
                              </Link>
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
              <Card className="border-gold/20">
                <CardContent className="py-12 text-center">
                  <div className="p-4 bg-gold/10 rounded-full w-fit mx-auto mb-4">
                    <Palette className="h-8 w-8 text-gold" />
                  </div>
                  <h3 className="font-serif text-xl mb-2">Pracovní materiály</h3>
                  <p className="text-muted-foreground mb-6">
                    Ke stažení pracovní listy, meditace a kreativní cvičení
                  </p>
                  {profile?.membership_type === 'free' ? (
                    <Link to="/resilient-hub">
                      <Button className="bg-gold hover:bg-gold-dark text-white">
                        Získat přístup k materiálům
                      </Button>
                    </Link>
                  ) : (
                    <p className="text-sm text-muted-foreground">Materiály budou brzy k dispozici</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions">
              <Card className="border-gold/20">
                <CardContent className="py-12 text-center">
                  <div className="p-4 bg-gold/10 rounded-full w-fit mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-gold" />
                  </div>
                  <h3 className="font-serif text-xl mb-2">Osobní konzultace</h3>
                  {profile?.membership_type === 'premium' ? (
                    <>
                      <p className="text-muted-foreground mb-6">
                        Jako Premium člen máte nárok na 4 hodinové konzultace ročně
                      </p>
                      <Link to="/booking">
                        <Button className="bg-gold hover:bg-gold-dark text-white">
                          <Calendar className="h-4 w-4 mr-2" />
                          Rezervovat konzultaci
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground mb-6">
                        Osobní konzultace jsou dostupné pro Premium členy nebo jako jednotlivé sezení
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Link to="/booking">
                          <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-white">
                            Rezervovat jednotlivě (87€/h)
                          </Button>
                        </Link>
                        <Link to="/resilient-hub">
                          <Button className="bg-gold hover:bg-gold-dark text-white">
                            Upgradovat na Premium
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
