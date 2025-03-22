/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Calendar, ImageIcon, X, Pencil } from "lucide-react";

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
  category?: string;
  description?: string;
  readingTime?: string;
}

interface CoverImageProps {
  url?: string;
  onUpdate: (url: string) => void;
  onRemove: () => void;
}

function CoverImage({ url, onUpdate, onRemove }: CoverImageProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div
      className={cn(
        "relative h-[35vh] w-full overflow-hidden group",
        !url && "bg-muted h-[35vh]",
        url && "bg-muted"
      )}
    >
      {url && (
        <Image
          src={url}
          alt="Cover"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          onLoadingComplete={() => setIsLoading(false)}
        />
      )}
      <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2 transition-opacity duration-200">
        <Button
          onClick={() => {
            /* Implement file upload logic */
          }}
          variant="outline"
          size="sm"
        >
          <ImageIcon className="h-4 w-4" />
          {url ? "Change cover" : "Add cover"}
        </Button>
        {url && (
          <Button onClick={onRemove} variant="outline" size="sm">
            <X className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

const getDocument = (documentId: string): Document => ({
  id: documentId,
  title: "Building a Modern Web Application",
  description:
    "A comprehensive guide to creating scalable web applications using Next.js, React, and TypeScript",
  content: JSON.stringify([
    {
      type: "paragraph",
      content:
        "In this comprehensive guide, we'll explore the fundamental concepts and best practices for building modern web applications. We'll cover everything from setting up your development environment to deploying your application to production.",
    },
    {
      type: "heading",
      content: "Getting Started",
    },
    {
      type: "paragraph",
      content:
        "Before we begin, make sure you have Node.js installed on your system. We'll be using Next.js as our framework of choice, along with React for building user interfaces and TypeScript for type safety.",
    },
  ]),
  createdAt: new Date("2024-02-15"),
  updatedAt: new Date("2024-02-15"),
  thumbnail: `https://picsum.photos/seed/${documentId}/1920/1080`,
  category: "Development",
  readingTime: "5 min read",
});

export default function DocumentPage({
  params,
}: {
  params: { documentId: string };
}) {
  const [document, setDocument] = useState<Document>(
    getDocument(params.documentId)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const Editor = useMemo(
    () =>
      dynamic(() => import("@/components/notes/editor"), {
        ssr: false,
        loading: () => (
          <div className="w-full animate-pulse">
            <Skeleton className="h-40 w-full" />
          </div>
        ),
      }),
    []
  );

  const handleUpdateCover = (url: string) => {
    setDocument({ ...document, thumbnail: url });
  };

  const handleRemoveCover = () => {
    setDocument({ ...document, thumbnail: undefined });
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <CoverImage
          url={document.thumbnail}
          onUpdate={handleUpdateCover}
          onRemove={handleRemoveCover}
        />
        <div className="relative pb-20">
          <div className="bg-card p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <Input
                    value={document.category}
                    onChange={(e) =>
                      setDocument({ ...document, category: e.target.value })
                    }
                    className="w-32"
                  />
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary"
                  >
                    {document.category}
                  </Badge>
                )}
                {isEditing ? (
                  <Input
                    value={document.readingTime}
                    onChange={(e) =>
                      setDocument({ ...document, readingTime: e.target.value })
                    }
                    className="w-32"
                  />
                ) : (
                  <Badge variant="outline">{document.readingTime}</Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
                disabled={isSaving}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save"}
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>
            {isEditing ? (
              <Input
                value={document.title}
                onChange={(e) =>
                  setDocument({ ...document, title: e.target.value })
                }
                className="text-4xl font-bold mb-4 tracking-tight"
              />
            ) : (
              <h1 className="text-4xl font-bold mb-4 tracking-tight">
                {document.title}
              </h1>
            )}
            {isEditing ? (
              <Textarea
                value={document.description}
                onChange={(e) =>
                  setDocument({ ...document, description: e.target.value })
                }
                className="text-lg text-muted-foreground mb-8 leading-relaxed"
              />
            ) : (
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {document.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 pb-8 border-b">
              <Calendar className="h-4 w-4" />
              <span>
                Last updated{" "}
                {document.updatedAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <Editor
                editable={isEditing}
                initialContent={document.content}
                onChange={(content: string) =>
                  setDocument({ ...document, content, updatedAt: new Date() })
                }
              />
            </div>
            <div className="mt-8">
              <Link href="/documents">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-muted/50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Documents
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
