import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import VideoPreviewCard from "./VideoPreviewCard";
import CategorySection from "./CategorySection";
import {
  Heart, Brain, Shield, Palette, Eye, Users,
  Zap, Compass, Target, Globe, Sun, Puzzle, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCms } from "@/hooks/useCms";

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

const ProgramOverview = () => {
  const navigate = useNavigate();
  const { t } = useCms();
  const { user, profile, isAdmin } = useAuth();
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCategories, setVisibleCategories] = useState(3);
  useEffect(() => {
    const fetchContent = async () => {
      const { data: categoriesData } = await supabase
        .from('video_categories')
        .select('*')
        .order('month_number');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .order('sort_order');

      if (videosData) {
        setVideos(videosData as Video[]);
      }

      setLoading(false);
    };

    fetchContent();
  }, []);

  const monthsUnlocked = profile?.months_unlocked || 0;

  const canAccessVideo = (video: Video) => {
    if (isAdmin) return true;
    if (video.is_free) return true;
    if (!profile) return false;

    const membershipOrder = { free: 0, basic: 1, premium: 2 };
    const hasTier = membershipOrder[profile.membership_type as keyof typeof membershipOrder] >= membershipOrder[video.min_membership];
    if (!hasTier) return false;

    // Progressive month unlock: only months paid for
    const category = categories.find(c => c.id === video.category_id);
    if (category && category.month_number >= 1 && category.month_number <= 12) {
      if (monthsUnlocked < category.month_number) return false;
    }

    return true;
  };

  const isCategoryLocked = (categoryId: string) => {
    const categoryVideos = videos.filter(v => v.category_id === categoryId);
    // Check access based on paid videos (ignore free bonuses for lock status)
    const paidVideos = categoryVideos.filter(v => !v.is_free);
    if (paidVideos.length > 0) {
      return !paidVideos.some(v => canAccessVideo(v));
    }
    return categoryVideos.length > 0 && !categoryVideos.some(v => canAccessVideo(v));
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-pulse text-gold">{t("hub_videos_loading", "Loading program content...")}</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="py-16 text-center">
        <Lock className="h-16 w-16 text-gold/30 mx-auto mb-4" />
        <h3 className="font-serif text-2xl mb-2">{t("hub_videos_empty_title", "Content in Preparation")}</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t("hub_videos_empty_text", "We're preparing video lessons and materials. Subscribe for updates!")}
        </p>
      </div>
    );
  }

  const validCategories = categories.filter(c => c.month_number >= 1 && c.month_number <= 12);
  const displayedCategories = validCategories.slice(0, visibleCategories);
  const hasMoreCategories = visibleCategories < validCategories.length;

  return (
    <div id="cms-hub-videos_tab" className="space-y-4">
      {displayedCategories.map((category) => {
        const IconComponent = iconMap[category.icon] || Heart;
        const categoryVideos = videos.filter(v => v.category_id === category.id);
        const locked = isCategoryLocked(category.id);

        return (
          <CategorySection
            key={category.id}
            monthNumber={category.month_number}
            title={category.name}
            description={category.description}
            icon={<IconComponent className="h-6 w-6 text-gold" />}
            isLocked={locked}
            onViewAll={() => {
              setVisibleCategories(validCategories.length);
              if (!user) {
                setTimeout(() => {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
          >
            {categoryVideos.length > 0 ? (
              categoryVideos.map((video) => (
                <VideoPreviewCard
                  key={video.id}
                  title={video.title}
                  description={video.description || ""}
                  thumbnailUrl={video.thumbnail_url}
                  duration={video.duration_minutes}
                  isLocked={!canAccessVideo(video)}
                  isFree={video.is_free}
                  membership={video.min_membership}
                  onClick={() => {
                    navigate(`/video/${video.id}`);
                  }}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 bg-muted/50 rounded-xl">
                <p className="text-muted-foreground">{t("hub_videos_coming_soon", "Videos coming soon")}</p>
              </div>
            )}
          </CategorySection>
        );
      })}

      {/* Load more / CTA */}
      <div className="pt-8 text-center">
        {hasMoreCategories && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setVisibleCategories(prev => prev + 3)}
            className="border-gold text-gold hover:bg-gold hover:text-white mb-4"
          >
            {t("hub_videos_more_prefix", "Show More Months (")}{validCategories.length - visibleCategories}{t("hub_videos_more_suffix", " remaining)")}
          </Button>
        )}

        {!user && (
          <div className="mt-8 p-8 bg-gradient-warm rounded-2xl border border-gold/20">
            <h3 className="font-serif text-2xl mb-3">
              {t("hub_videos_cta_title", "Get Full Program Access")}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              {t("hub_videos_cta_text", "Sign up or log in and unlock all video lessons, workbooks and exclusive content.")}
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="bg-gold hover:bg-gold-dark text-white shadow-gold">
                <Link to="/free-guide">{t("hub_videos_cta_start", "Start Free")}</Link>
              </Button>
              <Button asChild variant="outline" className="border-gold text-gold">
                <Link to="/pricing">{t("hub_videos_cta_pricing", "View Pricing")}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramOverview;
