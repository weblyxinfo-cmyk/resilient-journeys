import { Play, Lock, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VideoPreviewCardProps {
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  isLocked?: boolean;
  isFree?: boolean;
  membership?: 'free' | 'basic' | 'premium';
  onClick?: () => void;
}

const membershipBadges = {
  free: { label: "Zdarma", className: "bg-muted text-muted-foreground" },
  basic: { label: "Basic", className: "bg-gold/20 text-gold-dark border-gold/30" },
  premium: { label: "Premium", className: "bg-gradient-gold text-white border-0" },
};

const VideoPreviewCard = ({
  title,
  description,
  thumbnailUrl,
  duration,
  isLocked = false,
  isFree = false,
  membership = 'basic',
  onClick,
}: VideoPreviewCardProps) => {
  const badge = isFree ? membershipBadges.free : membershipBadges[membership];

  return (
    <Card 
      className={`group overflow-hidden border-border/50 transition-all duration-300 ${
        isLocked 
          ? "opacity-70" 
          : "hover:shadow-elevated hover:-translate-y-1 cursor-pointer"
      }`}
      onClick={!isLocked ? onClick : undefined}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-warm flex items-center justify-center">
            <Play className="h-12 w-12 text-gold/30" />
          </div>
        )}
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent transition-opacity ${
          isLocked ? "opacity-80 bg-foreground/40" : "opacity-0 group-hover:opacity-100"
        }`} />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isLocked ? (
            <div className="p-4 bg-background/90 rounded-full shadow-elevated">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
          ) : (
            <div className="p-4 bg-gold rounded-full shadow-gold opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-foreground/80 text-background text-xs rounded">
            <Clock className="h-3 w-3" />
            {duration} min
          </div>
        )}

        {/* Membership badge */}
        <Badge 
          className={`absolute top-2 left-2 ${badge.className}`}
          variant="outline"
        >
          {badge.label}
        </Badge>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-serif font-semibold text-lg mb-1 line-clamp-1 group-hover:text-gold transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        
        {isLocked && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 w-full border-gold text-gold hover:bg-gold hover:text-white"
          >
            Odemknout přístup
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoPreviewCard;
