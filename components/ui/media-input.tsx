"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ImageIcon, X } from "lucide-react";
import { useCallback, useState } from "react";

interface MediaInputProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MediaInput({ value, onChange, className }: MediaInputProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onChange]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onChange]
  );

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
        dragActive
          ? "border-primary/50 bg-primary/5"
          : "border-muted-foreground/25",
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {value ? (
        <>
          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-md">
            <Image src={value} alt="Thumbnail" fill className="object-cover" />
          </div>
          <div className="absolute right-2 top-2 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-background/50 backdrop-blur-sm"
              onClick={() => onChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 p-6 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <ImageIcon className="h-8 w-8 text-primary" />
          </div>
          <div className="text-lg font-medium">
            Drop image here or click to upload
          </div>
          <p className="text-sm text-muted-foreground">
            Supports JPG, PNG, GIF up to 10MB
          </p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
        </label>
      )}
    </div>
  );
}
