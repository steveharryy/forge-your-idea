import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface CategoryBadgeProps {
  name: string;
  icon?: LucideIcon;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
}

const CategoryBadge = ({
  name,
  icon: Icon,
  count,
  isActive = false,
  onClick,
}: CategoryBadgeProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-glow"
          : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{name}</span>
      {count !== undefined && (
        <span
          className={cn(
            "ml-1 text-xs",
            isActive ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};

export default CategoryBadge;
