"use client";

import {
  Search,
  Grid,
  List,
  Plus,
  Pin,
  MoreVertical,
  Trash2,
  Calendar,
  X,
  Pencil,
  Columns,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import dynamic from "next/dynamic";
import { SortOption } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  length: number;
}

interface TagColors {
  bg: string;
  text: string;
  dot: string;
}

type TagColorMap = Record<string, TagColors>;

const tagColorMap: TagColorMap = {
  ideas: { bg: "bg-blue-500/10", text: "text-blue-500", dot: "bg-blue-500" },
  projects: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    dot: "bg-purple-500",
  },
  planning: {
    bg: "bg-green-500/10",
    text: "text-green-500",
    dot: "bg-green-500",
  },
  meeting: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-500",
    dot: "bg-yellow-500",
  },
  team: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    dot: "bg-orange-500",
  },
  development: { bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
  learning: { bg: "bg-blue-500/10", text: "text-blue-500", dot: "bg-blue-500" },
  resources: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    dot: "bg-purple-500",
  },
  goals: { bg: "bg-green-500/10", text: "text-green-500", dot: "bg-green-500" },
  bugs: { bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
  features: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    dot: "bg-orange-500",
  },
};

const getTagColors = (tag: string) => {
  const normalizedTag = tag.toLowerCase();
  return (
    tagColorMap[normalizedTag as keyof typeof tagColorMap] || {
      bg: "bg-gray-500/10",
      text: "text-gray-500",
      dot: "bg-gray-500",
    }
  );
};

export default function Notes() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"grid" | "list" | "kanban">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: [] as string[],
  });
  const [isAddingCustomTag, setIsAddingCustomTag] = useState(false);
  const [newCustomTag, setNewCustomTag] = useState("");
  const [, setIsEditDialogOpen] = useState(false);
  const [, setEditingNote] = useState<Note | null>(null);

  const notesQuery = useQuery(api.notes.list);
  const notes = useMemo(() => notesQuery || [], [notesQuery]);
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const togglePin = useMutation(api.notes.togglePin);
  const deleteNote = useMutation(api.notes.remove);

  useEffect(() => {
    const savedView = localStorage.getItem("notesView");
    if (
      savedView &&
      (savedView === "grid" || savedView === "list" || savedView === "kanban")
    ) {
      setView(savedView as "grid" | "list" | "kanban");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("notesView", view);
    }
  }, [view, mounted]);

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

  const handleCreateNote = async (note: {
    title: string;
    content: string;
    tags: string[];
  }) => {
    const toastId = toast.loading("Creating note...");

    try {
      await createNote({
        title: note.title,
        content: note.content || JSON.stringify([]),
        tags: note.tags,
        color: "blue-500",
        isPinned: false,
      });

      toast.success("Note created successfully", {
        id: toastId,
        description: `"${note.title}" has been created.`,
      });

      setNewNote({
        title: "",
        content: "",
        tags: [],
      });
      setIsAddingCustomTag(false);
      setNewCustomTag("");
      setIsNewNoteDialogOpen(false);
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error("Failed to create note", {
        id: toastId,
        description: "Please try again later.",
      });
    }
  };

  const handlePinNote = async (noteId: Id<"notes">) => {
    const toastId = toast.loading("Updating note...");

    try {
      await togglePin({ id: noteId });

      toast.success("Note updated successfully", {
        id: toastId,
        description: "Pin status has been updated.",
      });
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Failed to update note", {
        id: toastId,
        description: "Please try again later.",
      });
    }
  };

  const handleDeleteNote = async (noteId: Id<"notes">) => {
    const toastId = toast.loading("Deleting note...");

    try {
      await deleteNote({ id: noteId });

      toast.success("Note deleted successfully", {
        id: toastId,
        description: "The note has been deleted.",
      });
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note", {
        id: toastId,
        description: "Please try again later.",
      });
    }
  };

  const handleUpdateNote = async (note: Note) => {
    const toastId = toast.loading(`Updating "${note.title}"...`);

    try {
      await updateNote({
        id: note.id as Id<"notes">,
        title: note.title,
        content: note.content,
        tags: note.tags,
        color: note.color,
        isPinned: note.isPinned,
      });

      toast.success("Note updated successfully", {
        id: toastId,
        description: `"${note.title}" has been updated.`,
      });

      setIsEditDialogOpen(false);
      setEditingNote(null);
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Failed to update note", {
        id: toastId,
        description: "Please try again later.",
      });
    }
  };

  const filteredAndSortedNotes = useMemo(() => {
    if (!notes) return [];

    const filtered = notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "date-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "length-asc":
          return a.content.length - b.content.length;
        case "length-desc":
          return b.content.length - a.content.length;
        case "updated-desc":
          return (
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });
  }, [notes, searchQuery, sortBy]);

  const pinnedNotes = useMemo(
    () => filteredAndSortedNotes.filter((note) => note.isPinned),
    [filteredAndSortedNotes]
  );

  const unpinnedNotes = useMemo(
    () => filteredAndSortedNotes.filter((note) => !note.isPinned),
    [filteredAndSortedNotes]
  );

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!notes) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col gap-4 pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-5">
            <div>
              <h1 className="text-3xl font-light tracking-tight">Notes</h1>
              <p className="text-muted-foreground mt-1 text-xl font-light">
                Capture and organize your thoughts effortlessly
              </p>
            </div>
            <Dialog
              open={isNewNoteDialogOpen}
              onOpenChange={setIsNewNoteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="dark:bg-muted/50">
                  <Plus className="h-4 w-4" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter note title"
                      value={newNote.title}
                      onChange={(e) =>
                        setNewNote({ ...newNote, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Content</Label>
                    <Editor
                      initialContent={newNote.content}
                      onChange={(content: string) =>
                        setNewNote({ ...newNote, content })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {newNote.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={cn(
                            "transition-colors",
                            getTagColors(tag).bg,
                            getTagColors(tag).text
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                getTagColors(tag).dot
                              )}
                            />
                            {tag.charAt(0).toUpperCase() + tag.slice(1)}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 hover:bg-transparent"
                              onClick={() =>
                                setNewNote({
                                  ...newNote,
                                  tags: newNote.tags.filter((t) => t !== tag),
                                })
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </Badge>
                      ))}
                    </div>
                    {isAddingCustomTag ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter custom tag"
                          value={newCustomTag}
                          onChange={(e) => setNewCustomTag(e.target.value)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsAddingCustomTag(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          disabled={newCustomTag.length < 2}
                          onClick={() => {
                            if (newCustomTag) {
                              setNewNote({
                                ...newNote,
                                tags: [
                                  ...newNote.tags,
                                  newCustomTag.toLowerCase(),
                                ],
                              });
                              setNewCustomTag("");
                              setIsAddingCustomTag(false);
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    ) : (
                      <TagSelect
                        selectedTags={newNote.tags}
                        onTagSelect={(tag) => {
                          setNewNote({
                            ...newNote,
                            tags: [...newNote.tags, tag],
                          });
                        }}
                      />
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsNewNoteDialogOpen(false);
                      setNewNote({ title: "", content: "", tags: [] });
                      setIsAddingCustomTag(false);
                      setNewCustomTag("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!newNote.title.trim()}
                    onClick={() => {
                      handleCreateNote(newNote);
                      setNewNote({ title: "", content: "", tags: [] });
                      setIsAddingCustomTag(false);
                      setNewCustomTag("");
                    }}
                  >
                    Create Note
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center w-full lg:w-auto">
              <div className="relative w-full lg:w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger className="w-full lg:w-[280px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Date</SelectLabel>
                    <SelectItem value="date-desc">Newest first</SelectItem>
                    <SelectItem value="date-asc">Oldest first</SelectItem>
                    <SelectItem value="updated-desc">
                      Recently updated
                    </SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Name</SelectLabel>
                    <SelectItem value="title-asc">Title A-Z</SelectItem>
                    <SelectItem value="title-desc">Title Z-A</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Other</SelectLabel>
                    <SelectItem value="length-asc">Shortest first</SelectItem>
                    <SelectItem value="length-desc">Longest first</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1 border rounded-md w-full lg:w-auto">
              <Button
                variant={view === "grid" ? "secondary" : "ghost"}
                onClick={() => setView("grid")}
                className="flex items-center gap-2 flex-1 lg:flex-initial"
              >
                <Grid className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                onClick={() => setView("list")}
                className="flex items-center gap-2 flex-1 lg:flex-initial"
              >
                <List className="h-4 w-4" />
                List
              </Button>
              <Button
                variant={view === "kanban" ? "secondary" : "ghost"}
                onClick={() => setView("kanban")}
                className="flex items-center gap-2 flex-1 lg:flex-initial"
              >
                <Columns className="h-4 w-4" />
                Kanban
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {view === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedNotes.length > 0 && (
                <div className="col-span-full mb-6">
                  <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                    Pinned Notes
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note._id}
                        note={{
                          id: note._id,
                          title: note.title,
                          content: note.content,
                          tags: note.tags,
                          color: note.color,
                          isPinned: note.isPinned,
                          createdAt: new Date(note.createdAt),
                          updatedAt: note.updatedAt
                            ? new Date(note.updatedAt)
                            : null,
                          length: note.content.length,
                        }}
                        onPin={() => handlePinNote(note._id as Id<"notes">)}
                        onDelete={() =>
                          handleDeleteNote(note._id as Id<"notes">)
                        }
                        handleUpdateNote={handleUpdateNote}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="col-span-full">
                {pinnedNotes.length > 0 && (
                  <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                    Other Notes
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {unpinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={{
                        id: note._id,
                        title: note.title,
                        content: note.content,
                        tags: note.tags,
                        color: note.color,
                        isPinned: note.isPinned,
                        createdAt: new Date(note.createdAt),
                        updatedAt: note.updatedAt
                          ? new Date(note.updatedAt)
                          : null,
                        length: note.content.length,
                      }}
                      onPin={() => handlePinNote(note._id as Id<"notes">)}
                      onDelete={() => handleDeleteNote(note._id as Id<"notes">)}
                      handleUpdateNote={handleUpdateNote}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          {view === "list" && (
            <div>
              {pinnedNotes.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                    Pinned Notes
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note._id}
                        note={{
                          id: note._id,
                          title: note.title,
                          content: note.content,
                          tags: note.tags,
                          color: note.color,
                          isPinned: note.isPinned,
                          createdAt: new Date(note.createdAt),
                          updatedAt: note.updatedAt
                            ? new Date(note.updatedAt)
                            : null,
                          length: note.content.length,
                        }}
                        onPin={() => handlePinNote(note._id as Id<"notes">)}
                        onDelete={() =>
                          handleDeleteNote(note._id as Id<"notes">)
                        }
                        handleUpdateNote={handleUpdateNote}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                    Other Notes
                  </h2>
                )}
                <div className="grid grid-cols-1 gap-4">
                  {unpinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={{
                        id: note._id,
                        title: note.title,
                        content: note.content,
                        tags: note.tags,
                        color: note.color,
                        isPinned: note.isPinned,
                        createdAt: new Date(note.createdAt),
                        updatedAt: note.updatedAt
                          ? new Date(note.updatedAt)
                          : null,
                        length: note.content.length,
                      }}
                      onPin={() => handlePinNote(note._id as Id<"notes">)}
                      onDelete={() => handleDeleteNote(note._id as Id<"notes">)}
                      handleUpdateNote={handleUpdateNote}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          {view === "kanban" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Pinned Notes
                </h2>
                <div className="space-y-4">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={{
                        id: note._id,
                        title: note.title,
                        content: note.content,
                        tags: note.tags,
                        color: note.color,
                        isPinned: note.isPinned,
                        createdAt: new Date(note.createdAt),
                        updatedAt: note.updatedAt
                          ? new Date(note.updatedAt)
                          : null,
                        length: note.content.length,
                      }}
                      onPin={() => handlePinNote(note._id as Id<"notes">)}
                      onDelete={() => handleDeleteNote(note._id as Id<"notes">)}
                      handleUpdateNote={handleUpdateNote}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Other Notes
                </h2>
                <div className="space-y-4">
                  {unpinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={{
                        id: note._id,
                        title: note.title,
                        content: note.content,
                        tags: note.tags,
                        color: note.color,
                        isPinned: note.isPinned,
                        createdAt: new Date(note.createdAt),
                        updatedAt: note.updatedAt
                          ? new Date(note.updatedAt)
                          : null,
                        length: note.content.length,
                      }}
                      onPin={() => handlePinNote(note._id as Id<"notes">)}
                      onDelete={() => handleDeleteNote(note._id as Id<"notes">)}
                      handleUpdateNote={handleUpdateNote}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface NoteCardProps {
  note: Note;
  onPin: () => void;
  onDelete: () => void;
  handleUpdateNote: (note: Note) => Promise<void>;
}

function NoteCard({ note, onPin, onDelete, handleUpdateNote }: NoteCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const isMobile = useIsMobile();

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

  return (
    <>
      <Card
        className="relative p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const isInteractive = target.closest(
            '.note-actions, button, [role="checkbox"], [role="combobox"]'
          );

          if (!isInteractive) {
            setIsDetailsSheetOpen(true);
          }
        }}
      >
        <div className="flex items-start justify-between">
          <h3 className="font-semibold">{note.title}</h3>
          <div className="flex items-center gap-2 note-actions">
            {note.isPinned && <Pin className="h-4 w-4 text-muted-foreground" />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin();
                  }}
                >
                  <Pin className="h-4 w-4" />
                  {note.isPinned ? "Unpin" : "Pin"} note
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingNote(note);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit note
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
          {note.content}
        </p>
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {note.tags.map((tag) => {
            const colors = getTagColors(tag);
            return (
              <Badge
                key={tag}
                variant="outline"
                className={cn("transition-colors", colors.bg, colors.text)}
              >
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </div>
              </Badge>
            );
          })}
        </div>
        <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          {note.createdAt.toLocaleDateString()}
        </div>
      </Card>

      {/* Note Details Sheet */}
      <Sheet open={isDetailsSheetOpen} onOpenChange={setIsDetailsSheetOpen}>
        <SheetContent
          side="right"
          className={cn(
            "overflow-y-auto sheet border-none",
            isMobile ? "w-full max-w-none" : "w-[500px] max-w-[500px]"
          )}
        >
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold">
              {note.title}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Content */}
            <div className="space-y-2">
              <p className="text-sm whitespace-pre-line">{note.content}</p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => {
                  const colors = getTagColors(tag);
                  return (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={cn(
                        "transition-colors",
                        colors.bg,
                        colors.text
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn("w-1.5 h-1.5 rounded-full", colors.dot)}
                        />
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </div>
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Created Date */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Created</h3>
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {note.createdAt.toLocaleDateString()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEditingNote(note);
                  setIsEditDialogOpen(true);
                  setIsDetailsSheetOpen(false);
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  setIsDeleteDialogOpen(true);
                  setIsDetailsSheetOpen(false);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Existing Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editingNote?.title}
                onChange={(e) =>
                  setEditingNote(
                    editingNote
                      ? {
                          ...editingNote,
                          title: e.target.value,
                        }
                      : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Content</Label>
              <Editor
                initialContent={editingNote?.content || ""}
                onChange={(content: string) =>
                  setEditingNote(
                    editingNote
                      ? {
                          ...editingNote,
                          content,
                        }
                      : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {editingNote?.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      "transition-colors",
                      getTagColors(tag).bg,
                      getTagColors(tag).text
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          getTagColors(tag).dot
                        )}
                      />
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-transparent"
                        onClick={() =>
                          setEditingNote(
                            editingNote
                              ? {
                                  ...editingNote,
                                  tags: editingNote.tags.filter(
                                    (t) => t !== tag
                                  ),
                                }
                              : null
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </Badge>
                ))}
              </div>
              <TagSelect
                selectedTags={editingNote?.tags || []}
                onTagSelect={(tag) => {
                  setEditingNote(
                    editingNote
                      ? {
                          ...editingNote,
                          tags: [...editingNote.tags, tag],
                        }
                      : null
                  );
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingNote(null);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!editingNote?.title.trim()}
              onClick={() => {
                if (editingNote) {
                  handleUpdateNote(editingNote);
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this note? This action cannot be
            undone.
          </p>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete();
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TagSelect({
  selectedTags,
  onTagSelect,
}: {
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}) {
  const [isAddingCustomTag, setIsAddingCustomTag] = useState(false);
  const [newCustomTag, setNewCustomTag] = useState({
    name: "",
    color: "bg-red-500",
  });

  const addCustomTagWithColor = (name: string, color: string) => {
    const tagName = name.toLowerCase();
    const colorBase = color.replace("bg-", "").replace("/10", "");

    (tagColorMap as TagColorMap)[tagName] = {
      bg: `bg-${colorBase}/10`,
      text: `text-${colorBase}`,
      dot: `bg-${colorBase}`,
    };

    onTagSelect(tagName);
  };

  const tagColors = [
    { value: "bg-red-500", label: "Red" },
    { value: "bg-blue-500", label: "Blue" },
    { value: "bg-green-500", label: "Green" },
    { value: "bg-purple-500", label: "Purple" },
    { value: "bg-orange-500", label: "Orange" },
    { value: "bg-yellow-500", label: "Yellow" },
  ];

  const defaultTags = [
    "Ideas",
    "Projects",
    "Planning",
    "Meeting",
    "Team",
    "Development",
    "Learning",
    "Resources",
    "Goals",
    "Bugs",
    "Features",
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
            <SelectTrigger className="w-full sm:w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tagColors.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", color.value)} />
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
                name: "",
                color: tagColors[0].value,
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
                addCustomTagWithColor(newCustomTag.name, newCustomTag.color);
                setIsAddingCustomTag(false);
                setNewCustomTag({
                  name: "",
                  color: tagColors[0].value,
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
      onValueChange={(value) => {
        if (value === "custom") {
          setIsAddingCustomTag(true);
        } else {
          onTagSelect(value);
        }
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Add tag" />
      </SelectTrigger>
      <SelectContent>
        {defaultTags
          .filter((tag) => !selectedTags.includes(tag.toLowerCase()))
          .map((tag) => (
            <SelectItem key={tag.toLowerCase()} value={tag.toLowerCase()}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full",
                    getTagColors(tag.toLowerCase()).dot
                  )}
                />
                {tag}
              </div>
            </SelectItem>
          ))}
        <SelectSeparator />
        <SelectItem value="custom">+ Add Custom Tag</SelectItem>
      </SelectContent>
    </Select>
  );
}
