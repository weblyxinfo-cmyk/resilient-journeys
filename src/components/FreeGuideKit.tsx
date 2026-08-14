import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sun,
  Zap,
  Moon,
  Download,
  Play,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useCms } from '@/hooks/useCms';

interface Video {
  id: string;
  title: string;
  is_free: boolean;
  video_type?: 'eft' | 'art' | 'meditation';
}

interface FreeGuideKitProps {
  videos: Video[];
  onNavigateToVideo: (videoId: string) => void;
}

const GRATITUDE_PDF = '/assets/7-Day-Gratitude-Workbook.pdf';
const EFT_PDF = '/assets/7-Day-EFT-Workbook-for-Expats.pdf';

const FreeGuideKit = ({ videos, onNavigateToVideo }: FreeGuideKitProps) => {
  const { t } = useCms();
  const freeEftVideo = videos.find(v => v.is_free && v.video_type === 'eft');

  return (
    <Card id="cms-freeguidekit-main" className="border-gold/20 bg-gradient-to-br from-gold/5 via-cream/30 to-transparent mb-8 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-gold rounded-full">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="font-serif text-2xl">
              {t("freeguidekit_title", "Your Free Guide Kit")}
            </CardTitle>
            <CardDescription className="text-base">
              {t("freeguidekit_subtitle", "3 Tools to Shift Your Energy — 7 Days to Calm, Clarity & Resilience")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground mb-6">
          {t("freeguidekit_intro", "Follow this simple 30-minute daily practice. Each tool builds on the other to calm your nervous system, release stress, and rebuild confidence while living abroad.")}
        </p>

        {/* 3-step grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Morning */}
          <Card id="cms-freeguidekit-morning" className="border-gold/20 hover:shadow-elegant transition-all">
            <CardHeader className="pb-3">
              <Badge className="bg-gold/10 text-gold border-0 text-xs w-fit">
                {t("freeguidekit_morning_badge", "Morning — 10 min")}
              </Badge>
              <div className="flex items-center gap-2 mt-2">
                <Sun className="h-5 w-5 text-gold flex-shrink-0" />
                <CardTitle className="font-serif text-lg">{t("freeguidekit_morning_title", "Gratitude Practice")}</CardTitle>
              </div>
              <CardDescription className="text-sm">
                {t("freeguidekit_morning_description", "Ground yourself in presence and awareness. Notice what gives you stability, even when life feels unfamiliar.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-gold/30 text-gold hover:bg-gold hover:text-white"
                onClick={() => window.open(GRATITUDE_PDF, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                {t("freeguidekit_morning_button", "Gratitude Workbook")}
              </Button>
            </CardContent>
          </Card>

          {/* Midday */}
          <Card id="cms-freeguidekit-midday" className="border-gold/20 hover:shadow-elegant transition-all">
            <CardHeader className="pb-3">
              <Badge className="bg-gold/10 text-gold border-0 text-xs w-fit">
                {t("freeguidekit_midday_badge", "Midday — 10 min")}
              </Badge>
              <div className="flex items-center gap-2 mt-2">
                <Zap className="h-5 w-5 text-gold flex-shrink-0" />
                <CardTitle className="font-serif text-lg">{t("freeguidekit_midday_title", "EFT Tapping")}</CardTitle>
              </div>
              <CardDescription className="text-sm">
                {t("freeguidekit_midday_description", "Release stress and tension with guided EFT tapping. Calm your nervous system and regain focus.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {freeEftVideo && (
                <Button
                  size="sm"
                  className="w-full bg-gold hover:bg-gold-dark text-white"
                  onClick={() => onNavigateToVideo(freeEftVideo.id)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {t("freeguidekit_midday_video_button", "Watch Free EFT Video")}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="w-full border-gold/30 text-gold hover:bg-gold hover:text-white"
                onClick={() => window.open(EFT_PDF, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                {t("freeguidekit_midday_button", "EFT Workbook")}
              </Button>
            </CardContent>
          </Card>

          {/* Evening */}
          <Card id="cms-freeguidekit-evening" className="border-gold/20 hover:shadow-elegant transition-all">
            <CardHeader className="pb-3">
              <Badge className="bg-gold/10 text-gold border-0 text-xs w-fit">
                {t("freeguidekit_evening_badge", "Evening — 10 min")}
              </Badge>
              <div className="flex items-center gap-2 mt-2">
                <Moon className="h-5 w-5 text-gold flex-shrink-0" />
                <CardTitle className="font-serif text-lg">{t("freeguidekit_evening_title", "Evening Reflection")}</CardTitle>
              </div>
              <CardDescription className="text-sm">
                {t("freeguidekit_evening_description", "Pause, reflect, and gently reframe your thoughts. End the day with clarity and a calmer mindset.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-gold/30 text-gold hover:bg-gold hover:text-white"
                onClick={() => window.open(GRATITUDE_PDF, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                {t("freeguidekit_evening_button", "Gratitude Workbook")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade CTA */}
        <div id="cms-freeguidekit-cta" className="text-center pt-4 border-t border-gold/10">
          <p className="text-sm text-muted-foreground mb-3">
            {t("freeguidekit_cta_text", "Ready for the full 12-month transformation?")}
          </p>
          <Button asChild className="bg-gradient-gold text-white hover:shadow-elevated">
            <Link to="/pricing">
              <Crown className="h-4 w-4 mr-2" />
              {t("freeguidekit_cta_button", "Explore Full Membership")}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreeGuideKit;
