import heroBg from "@/assets/hero-bg.jpg";
import { useCms } from "@/hooks/useCms";

interface PageHeroProps {
  children: React.ReactNode;
  className?: string;
}

const PageHero = ({ children, className = "" }: PageHeroProps) => {
  const { t } = useCms();

  return (
    <section className={`relative py-16 md:py-24 overflow-hidden ${className}`}>
      {/* Tree Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${t("shared_hero_background_image", heroBg, "Podkladová fotka za úvodní obrazovkou")})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background" />
        <div className="absolute inset-0 bg-foreground/8" />
      </div>

      <div className="container relative z-10 px-4" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
        {children}
      </div>
    </section>
  );
};

export default PageHero;
