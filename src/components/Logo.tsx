import { Link } from "react-router-dom";
import { useCms } from "@/hooks/useCms";

const Logo = ({ className = "" }: { className?: string }) => {
  const { t } = useCms();

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img
        src={t("shared_logo_image", "/assets/resilient-mind-logo.png", "Logo webu")}
        alt="Resilient Mind Logo"
        className="h-10 w-auto object-contain"
      />
      <span className="font-serif text-lg font-semibold tracking-tight text-gradient-gold">
        Resilient Mind
      </span>
    </Link>
  );
};

export default Logo;
