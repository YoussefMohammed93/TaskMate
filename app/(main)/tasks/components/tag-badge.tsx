import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
}

export function TagBadge({ tag, onRemove }: TagBadgeProps) {
  const colorMap = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    green: "bg-green-500",
  };

  const bgColorMap = {
    red: "bg-red-500/10",
    blue: "bg-blue-500/10",
    purple: "bg-purple-500/10",
    orange: "bg-orange-500/10",
    green: "bg-green-500/10",
  };

  const textColorMap = {
    red: "text-red-500",
    blue: "text-blue-500",
    purple: "text-purple-500",
    orange: "text-orange-500",
    green: "text-green-500",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "transition-colors",
        bgColorMap[tag.color as keyof typeof bgColorMap],
        textColorMap[tag.color as keyof typeof textColorMap]
      )}
    >
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            colorMap[tag.color as keyof typeof colorMap]
          )}
        />
        {tag.name.charAt(0).toUpperCase() + tag.name.slice(1)}
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 hover:bg-transparent"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Badge>
  );
}
