import { Tag } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CustomTag {
  id: string;
  name: string;
  color: string;
}

import { defaultTags } from "../constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TagSelectProps {
  selectedTags: Tag[];
  onTagSelect: (tag: Tag) => void;
}

export function TagSelect({ selectedTags, onTagSelect }: TagSelectProps) {
  const [isAddingCustomTag, setIsAddingCustomTag] = useState(false);
  const [newCustomTag, setNewCustomTag] = useState<CustomTag>({
    id: "",
    name: "",
    color: "red",
  });

  const tagColors = [
    { value: "red", label: "Red" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "purple", label: "Purple" },
    { value: "orange", label: "Orange" },
    { value: "yellow", label: "Yellow" },
  ];

  if (isAddingCustomTag) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 space-y-2">
            <Input
              placeholder="Enter tag name"
              value={newCustomTag.name}
              onChange={(e) =>
                setNewCustomTag({
                  ...newCustomTag,
                  name: e.target.value,
                })
              }
            />
          </div>
          <Select
            value={newCustomTag.color}
            onValueChange={(value) =>
              setNewCustomTag({
                ...newCustomTag,
                color: value,
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tagColors.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        `bg-${color.value}-500`
                      )}
                    />
                    {color.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto order-2 sm:order-1"
            onClick={() => {
              setIsAddingCustomTag(false);
              setNewCustomTag({
                id: "",
                name: "",
                color: "red",
              });
            }}
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto order-1 sm:order-2"
            disabled={newCustomTag.name.length < 2}
            onClick={() => {
              if (newCustomTag.name) {
                const newTag: Tag = {
                  id: crypto.randomUUID(),
                  name: newCustomTag.name.toLowerCase(),
                  color: newCustomTag.color,
                };
                onTagSelect(newTag);
                setIsAddingCustomTag(false);
                setNewCustomTag({
                  id: "",
                  name: "",
                  color: "red",
                });
              }
            }}
          >
            Add Tag
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Select
      value=""
      onValueChange={(value) => {
        if (value === "custom") {
          setIsAddingCustomTag(true);
        } else {
          const selectedTag = defaultTags.find((tag) => tag.id === value);
          if (selectedTag) {
            onTagSelect(selectedTag);
          }
        }
      }}
    >
      <SelectTrigger className="focus:ring-0 focus:ring-offset-0">
        <SelectValue placeholder="Add tag" />
      </SelectTrigger>
      <SelectContent>
        {defaultTags
          .filter((tag) => !selectedTags.find((t) => t.id === tag.id))
          .map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              <div className="flex items-center gap-2">
                <div
                  className={cn("w-3 h-3 rounded-full", `bg-${tag.color}-500`)}
                />
                {tag.name}
              </div>
            </SelectItem>
          ))}
        <SelectSeparator />
        <SelectItem value="custom">+ Add Custom Tag</SelectItem>
      </SelectContent>
    </Select>
  );
}
