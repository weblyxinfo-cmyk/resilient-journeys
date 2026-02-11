import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategorySectionProps {
  monthNumber: number;
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
  isLocked?: boolean;
  onViewAll?: () => void;
}

const CategorySection = ({
  monthNumber,
  title,
  description,
  icon,
  children,
  isLocked = false,
  onViewAll,
}: CategorySectionProps) => {
  return (
    <section className={`py-8 ${isLocked ? "opacity-60" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                {monthNumber <= 12 ? `Month ${monthNumber}` : "Bonus"}
              </span>
              {isLocked && (
                <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                  Locked
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
              {title}
            </h2>
            {description && (
              <p className="text-muted-foreground mt-1 max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {!isLocked && onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex text-gold hover:text-gold-dark hover:bg-gold/10 cursor-pointer"
            onClick={onViewAll}
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </section>
  );
};

export default CategorySection;
