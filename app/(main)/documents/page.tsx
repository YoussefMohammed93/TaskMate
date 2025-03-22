"use client";

import {
  Plus,
  Search,
  Grid2x2,
  List,
  Loader2,
  MoreVertical,
  Clock,
  Calendar,
  RefreshCw,
  FileText,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useState, useMemo, useEffect } from "react";
import { MediaInput } from "@/components/ui/media-input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
  coverImage?: string;
  description?: string;
  category?: string;
  readingTime?: string;
  author: {
    name: string;
    avatar: string;
  };
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: "1",
    title: "Project Proposal",
    content: "This is a project proposal document...",
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
    coverImage: "https://picsum.photos/seed/1/800/400",
    thumbnail: "https://picsum.photos/seed/1/300/200",
    category: "Planning",
    description:
      "A comprehensive project proposal for the new web application platform",
    readingTime: "5 min read",
    author: {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
  },
  {
    id: "2",
    title: "Meeting Minutes",
    content: "Minutes from the team meeting...",
    createdAt: new Date("2024-02-16"),
    updatedAt: new Date("2024-02-16"),
    coverImage: "https://picsum.photos/seed/2/800/400",
    thumbnail: "https://picsum.photos/seed/2/300/200",
    category: "Meetings",
    description: "Summary and action items from the weekly team sync",
    readingTime: "3 min read",
    author: {
      name: "Michael Chen",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  },
  {
    id: "3",
    title: "Research Paper",
    content: "Research findings and analysis...",
    createdAt: new Date("2024-02-17"),
    updatedAt: new Date("2024-02-17"),
    coverImage: "https://picsum.photos/seed/3/800/400",
    thumbnail: "https://picsum.photos/seed/3/300/200",
    category: "Research",
    description: "Analysis of recent market trends and competitor landscape",
    readingTime: "8 min read",
    author: {
      name: "Emma Davis",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
  },
];

interface DeleteDocumentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentTitle: string;
  onDelete: () => void;
}

const DeleteDocumentDialog = ({
  isOpen,
  onOpenChange,
  documentTitle,
  onDelete,
}: DeleteDocumentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Document</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {documentTitle}? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DocumentActions = ({
  document,
  onDelete,
}: {
  document: Document;
  onDelete: () => void;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DeleteDocumentDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
        }}
        documentTitle={document.title}
        onDelete={() => {
          onDelete();
        }}
      />
    </>
  );
};

const DocumentCard = ({
  document,
  onDelete,
}: {
  document: Document;
  onDelete: () => void;
}) => (
  <Card className="cursor-pointer overflow-hidden flex flex-col h-[23.5rem] lg:h-[25rem] group">
    <div className="relative w-full h-32 lg:h-40 flex-shrink-0">
      {document.coverImage ? (
        <Image
          src={document.coverImage}
          alt={document.title}
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
    </div>
    <div className="flex flex-col flex-grow">
      <CardHeader className="p-4 space-y-3 flex-grow">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <h3
              className="font-semibold text-lg truncate"
              title={document.title}
            >
              {document.title}
            </h3>
            {document.category && (
              <Badge variant="outline" className="text-xs">
                {document.category}
              </Badge>
            )}
          </div>
          <DocumentActions document={document} onDelete={onDelete} />
        </div>
        {document.description && (
          <p
            className="text-sm text-muted-foreground line-clamp-1"
            title={document.description}
          >
            {document.description}
          </p>
        )}
        <div className="pt-2">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={document.author.avatar}
                alt={document.author.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
                sizes="32px"
              />
            </div>
            <span
              className="text-sm text-muted-foreground truncate max-w-[150px]"
              title={document.author.name}
            >
              {document.author.name}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 border-t bg-muted/5">
        <div className="flex flex-wrap items-center gap-x-4 mt-3 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {document.readingTime}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(document.createdAt, "MMM dd, yyyy")}
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Updated {format(document.updatedAt, "MMM dd, yyyy")}
          </div>
        </div>
      </CardContent>
    </div>
  </Card>
);

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewDocumentDialogOpen, setIsNewDocumentDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: "",
    content: "",
    description: "",
    category: "",
    readingTime: "",
    thumbnail: "",
    coverImage: "",
    author: {
      name: "Current User",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
  });

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

  useEffect(() => {
    const savedView = localStorage.getItem("documentsView");
    if (savedView && (savedView === "grid" || savedView === "list")) {
      setView(savedView as "grid" | "list");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("documentsView", view);
    }
  }, [view, mounted]);

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleCreateDocument = () => {
    const doc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      title: newDocument.title,
      content: newDocument.content,
      description: newDocument.description,
      category: newDocument.category,
      readingTime: newDocument.readingTime,
      createdAt: new Date(),
      updatedAt: new Date(),
      thumbnail:
        newDocument.thumbnail ||
        `https://picsum.photos/seed/${Date.now()}/300/200`,
      author: {
        name: newDocument.author.name,
        avatar: newDocument.author.avatar,
      },
    };

    setDocuments([...documents, doc]);
    setIsNewDocumentDialogOpen(false);
    setNewDocument({
      title: "",
      content: "",
      description: "",
      category: "",
      readingTime: "",
      thumbnail: "",
      coverImage: "",
      author: {
        name: "Current User",
        avatar: "https://i.pravatar.cc/150?img=1",
      },
    });
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (documentId: string) => {
    setDocuments(documents.filter((doc) => doc.id !== documentId));
  };

  return (
    <div className="h-full flex flex-col gap-4 pb-4">
      <div className="flex flex-col gap-4">
        <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-5">
          <div>
            <h1 className="text-3xl font-light tracking-tight">Documents</h1>
            <p className="text-muted-foreground mt-1 text-xl font-light">
              Create and manage your documents
            </p>
          </div>
          <Dialog
            open={isNewDocumentDialogOpen}
            onOpenChange={setIsNewDocumentDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="dark:bg-muted/50">
                <Plus className="h-4 w-4" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter document title"
                    value={newDocument.title}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter document description"
                    value={newDocument.description}
                    onChange={(e) =>
                      setNewDocument({
                        ...newDocument,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="Enter document category"
                    value={newDocument.category}
                    onChange={(e) =>
                      setNewDocument({
                        ...newDocument,
                        category: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="readingTime">Reading Time</Label>
                  <Input
                    id="readingTime"
                    placeholder="e.g., 5 min read"
                    value={newDocument.readingTime}
                    onChange={(e) =>
                      setNewDocument({
                        ...newDocument,
                        readingTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="thumbnail">Thumbnail</Label>
                  <MediaInput
                    value={newDocument.thumbnail}
                    onChange={(value) =>
                      setNewDocument({ ...newDocument, thumbnail: value })
                    }
                    className="min-h-[200px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Content</Label>
                  <Editor
                    initialContent={newDocument.content}
                    onChange={(content: string) =>
                      setNewDocument({ ...newDocument, content })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsNewDocumentDialogOpen(false);
                    setNewDocument({
                      title: "",
                      content: "",
                      description: "",
                      category: "",
                      readingTime: "",
                      thumbnail: "",
                      coverImage: "",
                      author: {
                        name: "Current User",
                        avatar: "https://i.pravatar.cc/150?img=1",
                      },
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={
                    !newDocument.title.trim() || !newDocument.description.trim()
                  }
                  onClick={handleCreateDocument}
                >
                  Create Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === "grid" ? "default" : "outline"}
              onClick={() => setView("grid")}
              className="flex items-center gap-2"
            >
              <Grid2x2 className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>
      </div>
      {view === "list" ? (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <Link
              href={`/documents/${doc.id}`}
              key={doc.id}
              className="flex flex-col sm:flex-row items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent group"
            >
              <div className="w-full sm:w-32 h-40 sm:h-24 flex-shrink-0 overflow-hidden rounded-md">
                {doc.thumbnail ? (
                  <Image
                    src={doc.thumbnail}
                    alt={doc.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3
                        className="font-semibold text-lg truncate"
                        title={doc.title}
                      >
                        {doc.title}
                      </h3>
                      {doc.category && (
                        <Badge variant="secondary" className="w-fit">
                          {doc.category}
                        </Badge>
                      )}
                    </div>
                    {doc.description && (
                      <p
                        className="text-sm text-muted-foreground line-clamp-2"
                        title={doc.description}
                      >
                        {doc.description}
                      </p>
                    )}
                  </div>
                  <div className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(doc.id);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={doc.author.avatar}
                        alt={doc.author.name}
                        className="object-cover"
                        fill
                        sizes="32px"
                      />
                    </div>
                    <span
                      className="text-sm text-muted-foreground truncate max-w-[150px]"
                      title={doc.author.name}
                    >
                      {doc.author.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">{doc.readingTime}</span>
                    <span className="sm:hidden">
                      {doc.readingTime?.replace(" read", "") || "0 min"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {format(doc.createdAt, "MMM dd, yyyy")}
                    </span>
                    <span className="sm:hidden">
                      {format(doc.createdAt, "MM/dd/yy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      Updated {format(doc.updatedAt, "MMM dd, yyyy")}
                    </span>
                    <span className="sm:hidden">
                      {format(doc.updatedAt, "MM/dd/yy")}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((document) => (
            <Link href={`/documents/${document.id}`} key={document.id}>
              <DocumentCard
                document={document}
                onDelete={() => handleDelete(document.id)}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
