import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pin, MoreVertical } from "lucide-react";

interface NoteCardProps {
  title: string;
  content: string;
  tags: string[];
  color?: string;
  isPinned?: boolean;
  createdAt: Date;
  onPin: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export function NoteCard({
  title,
  content,
  tags,
  color = "default",
  isPinned = false,
  createdAt,
  onPin,
  onDelete,
  onClick,
}: NoteCardProps) {
  const colorClass = color !== "default" ? `bg-${color}/10` : "";

  return (
    <Card
      className={cn(
        "relative p-4 cursor-pointer hover:shadow-md transition-shadow",
        colorClass
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold">{title}</h3>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {isPinned && <Pin className="h-4 w-4 text-muted-foreground" />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPin();
                }}
              >
                {isPinned ? "Unpin" : "Pin"} note
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Delete note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
        {content}
      </p>
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
        {format(createdAt, "MMM dd, yyyy")}
      </div>
    </Card>
  );
}
