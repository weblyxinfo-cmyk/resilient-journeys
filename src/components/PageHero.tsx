import heroBg from "@/assets/hero-bg.jpg";

interface PageHeroProps {
  children: React.ReactNode;
  className?: string;
}

const PageHero = ({ children, className = "" }: PageHeroProps) => {
  return (
    <section className={`relative py-16 md:py-24 overflow-hidden ${className}`}>
      {/* Tree Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        <div className="absolute inset-0 bg-foreground/5" />
      </div>

      <div className="container relative z-10 px-4">
        {children}
      </div>
    </section>
  );
};

export default PageHero;
