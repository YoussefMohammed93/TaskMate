"use client";

import {
  Search,
  Grid,
  Plus,
  Pin,
  MoreVertical,
  Trash2,
  Calendar,
  X,
  Pencil,
  Columns,
  Loader2,
  Clock,
  RefreshCw,
  StickyNote,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
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
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface SlashCommand {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: (
    content: string,
    cursorPosition: number
  ) => { text: string; newPosition: number };
}

const slashCommands: SlashCommand[] = [
  {
    id: "paragraph",
    label: "Text",
    icon: ({ className }) => <div className={className}>¶</div>,
    action: (content: string, cursorPosition: number) => {
      const newText =
        content.slice(0, cursorPosition) +
        "\n\n" +
        content.slice(cursorPosition);
      return { text: newText, newPosition: cursorPosition + 0 };
    },
  },
  {
    id: "numbered-list",
    label: "Numbered List",
    icon: ({ className }) => <div className={className}>1.</div>,
    action: (content: string, cursorPosition: number) => {
      const newText =
        content.slice(0, cursorPosition) +
        "\n1. " +
        content.slice(cursorPosition);
      return { text: newText, newPosition: cursorPosition + 4 };
    },
  },
  {
    id: "bullet-list",
    label: "Bullet List",
    icon: ({ className }) => <div className={className}>•</div>,
    action: (content: string, cursorPosition: number) => {
      const newText =
        content.slice(0, cursorPosition) +
        "\n• " +
        content.slice(cursorPosition);
      return { text: newText, newPosition: cursorPosition + 2 };
    },
  },
];

const handleListEnterKey = (
  content: string,
  cursorPosition: number
): { text: string; newPosition: number } => {
  const lines = content.slice(0, cursorPosition).split("\n");
  const currentLine = lines[lines.length - 1];

  const numberedMatch = currentLine.match(/^(\d+)\.\s(.*)/);
  if (numberedMatch) {
    const number = parseInt(numberedMatch[1]);
    const text = numberedMatch[2];

    if (!text.trim()) {
      return {
        text:
          content.slice(0, cursorPosition - numberedMatch[0].length) +
          content.slice(cursorPosition),
        newPosition: cursorPosition - numberedMatch[0].length,
      };
    }

    const nextNumber = number + 1;
    const newText =
      content.slice(0, cursorPosition) +
      `\n${nextNumber}. ` +
      content.slice(cursorPosition);
    return {
      text: newText,
      newPosition: cursorPosition + `\n${nextNumber}. `.length,
    };
  }

  const bulletMatch = currentLine.match(/^[•]\s(.*)/);
  if (bulletMatch) {
    const text = bulletMatch[1];

    if (!text.trim()) {
      return {
        text:
          content.slice(0, cursorPosition - bulletMatch[0].length) +
          content.slice(cursorPosition),
        newPosition: cursorPosition - bulletMatch[0].length,
      };
    }

    const newText =
      content.slice(0, cursorPosition) + "\n• " + content.slice(cursorPosition);
    return { text: newText, newPosition: cursorPosition + "\n• ".length };
  }

  return {
    text:
      content.slice(0, cursorPosition) + "\n" + content.slice(cursorPosition),
    newPosition: cursorPosition + 1,
  };
};

function SlashCommandMenu({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (command: SlashCommand) => void;
  triggerRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const [inputValue, setInputValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = slashCommands.filter((command) =>
    command.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedIndex(0);
      setInputValue("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev <= 0 ? filteredCommands.length - 1 : prev - 1
          );
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev >= filteredCommands.length - 1 ? 0 : prev + 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            onSelect(filteredCommands[selectedIndex]);
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onSelect, onClose]);

  return (
    <Popover open={isOpen} onOpenChange={onClose}>
      <PopoverTrigger asChild>
        <div className="h-0" />
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0"
        align="start"
        side="bottom"
        sideOffset={0}
        alignOffset={0}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type a command..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandEmpty>No commands found.</CommandEmpty>
          <CommandGroup>
            {filteredCommands.map((command, index) => (
              <CommandItem
                key={command.id}
                onSelect={() => {
                  onSelect(command);
                  setInputValue("");
                  onClose();
                }}
                className={cn(
                  "flex items-center justify-between px-2 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors",
                  selectedIndex === index && "bg-accent text-accent-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <command.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{command.label}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function Notes() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "kanban">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: [] as string[],
  });
  const [isAddingCustomTag, setIsAddingCustomTag] = useState(false);
  const [newCustomTag, setNewCustomTag] = useState({
    name: "",
    color: "red-500",
  });
  const [, setIsEditDialogOpen] = useState(false);
  const [, setEditingNote] = useState<Note | null>(null);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, setIsDeleteDialogOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const notesQuery = useQuery(api.notes.list);
  const notes = useMemo(() => notesQuery || [], [notesQuery]);
  const isLoading = !mounted || notesQuery === undefined;
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const togglePin = useMutation(api.notes.togglePin);
  const deleteNote = useMutation(api.notes.remove);

  useEffect(() => {
    const savedView = localStorage.getItem("notesView");
    if (savedView && (savedView === "grid" || savedView === "kanban")) {
      setView(savedView as "grid" | "kanban");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("notesView", view);
    }
  }, [view, mounted]);

  const handleCreateNote = async (note: {
    title: string;
    content: string;
    tags: string[];
  }) => {
    if (!note.title.trim() || !note.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsCreating(true);
    const toastId = toast.loading("Creating note...");

    try {
      await createNote({
        title: note.title,
        content: note.content,
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
      setNewCustomTag({
        name: "",
        color: "red-500",
      });
      setIsNewNoteDialogOpen(false);
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error("Failed to create note", {
        id: toastId,
        description: "Please try again later.",
      });
    } finally {
      setIsCreating(false);
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
    setIsDeleting(true);
    const toastId = toast.loading("Deleting note...");

    try {
      await deleteNote({ id: noteId });

      toast.success("Note deleted successfully", {
        id: toastId,
        description: "The note has been deleted.",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note", {
        id: toastId,
        description: "Please try again later.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateNote = async (note: Note) => {
    if (!note.title.trim() || !note.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsUpdating(true);
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
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewNote({ ...newNote, content: value });

    const cursorPosition = e.target.selectionStart;
    const lastChar = value.charAt(cursorPosition - 1);
    const prevChar = value.charAt(cursorPosition - 2);

    if (lastChar === "/" && (prevChar === "\n" || prevChar === "")) {
      setShowSlashCommands(true);
    } else {
      setShowSlashCommands(false);
    }

    if (lastChar === "\n") {
      const placeholderText = "Type '/' for text and list formatting";
      const newText =
        value.slice(0, cursorPosition) +
        placeholderText +
        value.slice(cursorPosition);

      setNewNote({ ...newNote, content: newText });

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(
            cursorPosition,
            cursorPosition + placeholderText.length
          );
        }
      }, 0);
    }
  };

  const handleSlashCommand = (command: SlashCommand) => {
    if (!textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const currentContent = newNote.content;

    const contentWithoutSlash =
      currentContent.slice(0, cursorPosition - 1) +
      currentContent.slice(cursorPosition);
    const { text, newPosition } = command.action(
      contentWithoutSlash,
      cursorPosition - 1
    );

    setNewNote({ ...newNote, content: text });
    setShowSlashCommands(false);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const { text, newPosition } = handleListEnterKey(
        newNote.content,
        e.currentTarget.selectionStart
      );
      setNewNote({ ...newNote, content: text });

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
      return;
    }

    const selection = e.currentTarget.selectionStart;
    const content = newNote.content;
    const placeholderText = "Type '/' for text and list formatting";

    if (content.includes(placeholderText)) {
      const placeholderStart = content.indexOf(placeholderText);
      const placeholderEnd = placeholderStart + placeholderText.length;

      if (selection >= placeholderStart && selection <= placeholderEnd) {
        const newText = content.replace(placeholderText, "");
        setNewNote({ ...newNote, content: newText });

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(
              placeholderStart,
              placeholderStart
            );
          }
        }, 0);
      }
    }
  };

  const filteredAndSortedNotes = useMemo(() => {
    if (isLoading || !notes) return [];

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
  }, [notes, searchQuery, sortBy, isLoading]);

  const pinnedNotes = useMemo(
    () =>
      isLoading ? [] : filteredAndSortedNotes.filter((note) => note.isPinned),
    [filteredAndSortedNotes, isLoading]
  );

  const unpinnedNotes = useMemo(
    () =>
      isLoading ? [] : filteredAndSortedNotes.filter((note) => !note.isPinned),
    [filteredAndSortedNotes, isLoading]
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full h-[50vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (notes.length > 0 && filteredAndSortedNotes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
            <div className="relative p-6 bg-secondary dark:bg-muted/50 backdrop-blur-sm rounded-full ring-1 ring-border/50">
              <Search className="size-14 text-primary/70" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl font-semibold tracking-tight">
              No notes found
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {searchQuery && (
                <span>
                  Search Term:{" "}
                  <b>
                    <q>{searchQuery}</q>
                  </b>
                  <br />
                </span>
              )}
              <span className="block mt-2">
                Try adjusting your search criteria to find what you&apos;re
                looking for.
              </span>
            </p>
          </div>
        </div>
      );
    }

    if (
      notes.length === 0 ||
      (searchQuery && filteredAndSortedNotes.length === 0)
    ) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
            <div className="relative p-6 bg-secondary dark:bg-muted/50 backdrop-blur-sm rounded-full ring-1 ring-border/50">
              {searchQuery ? (
                <Search className="size-14 text-primary/70" strokeWidth={1.5} />
              ) : (
                <StickyNote
                  className="size-14 text-primary/70"
                  strokeWidth={1.5}
                />
              )}
            </div>
          </div>
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl font-semibold tracking-tight">
              {searchQuery ? "No Notes Found" : "No Notes Yet"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {searchQuery ? (
                <>
                  <span>
                    Search Term:{" "}
                    <b>
                      <q>{searchQuery}</q>
                    </b>
                  </span>
                  <span className="block mt-2">
                    Try adjusting your search criteria to find what you&apos;re
                    looking for.
                  </span>
                </>
              ) : (
                <>
                  Ready to get organized? Start by creating your first note
                  using the
                  <b className="font-semibold text-primary"> New Note </b>
                  button above.
                </>
              )}
            </p>
          </div>
        </div>
      );
    }

    return (
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
                      onDelete={() => handleDeleteNote(note._id as Id<"notes">)}
                      handleUpdateNote={handleUpdateNote}
                      isUpdating={isUpdating}
                      isDeleting={isDeleting}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
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
                    isUpdating={isUpdating}
                    isDeleting={isDeleting}
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
                    isUpdating={isUpdating}
                    isDeleting={isDeleting}
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
                    isUpdating={isUpdating}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pb-2 space-y-4 md:space-y-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Type your note content here... (Type '/' for text and list formatting)"
                    value={newNote.content}
                    onChange={handleTextareaChange}
                    onKeyDown={handleTextareaKeyDown}
                    className="min-h-[200px] resize-none placeholder:text-muted-foreground/60 placeholder:text-sm font-mono"
                  />
                  <SlashCommandMenu
                    isOpen={showSlashCommands}
                    onClose={() => setShowSlashCommands(false)}
                    onSelect={handleSlashCommand}
                    triggerRef={textareaRef}
                  />
                </div>
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
                      value={newCustomTag.name}
                      onChange={(e) =>
                        setNewCustomTag({
                          ...newCustomTag,
                          name: e.target.value,
                        })
                      }
                    />
                    <Select
                      value={newCustomTag.color || "red-500"}
                      onValueChange={(color) =>
                        setNewCustomTag({ ...newCustomTag, color })
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { value: "red-500", label: "Red" },
                          { value: "blue-500", label: "Blue" },
                          { value: "green-500", label: "Green" },
                          { value: "purple-500", label: "Purple" },
                          { value: "orange-500", label: "Orange" },
                          { value: "yellow-500", label: "Yellow" },
                        ].map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-3 h-3 rounded-full",
                                  `bg-${color.value}`
                                )}
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsAddingCustomTag(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      disabled={newCustomTag.name?.length < 2}
                      onClick={() => {
                        if (newCustomTag.name) {
                          const tagName = newCustomTag.name.toLowerCase();
                          const colorBase = newCustomTag.color;

                          (tagColorMap as TagColorMap)[tagName] = {
                            bg: `bg-${colorBase}/10`,
                            text: `text-${colorBase}`,
                            dot: `bg-${colorBase}`,
                          };

                          setNewNote({
                            ...newNote,
                            tags: [...newNote.tags, tagName],
                          });
                          setNewCustomTag({ name: "", color: "red-500" });
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
                    key={newNote.tags.length}
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
                  setNewCustomTag({
                    name: "",
                    color: "red-500",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!newNote.title.trim() || isCreating}
                onClick={() => {
                  handleCreateNote(newNote);
                  setNewNote({ title: "", content: "", tags: [] });
                  setIsAddingCustomTag(false);
                  setNewCustomTag({
                    name: "",
                    color: "red-500",
                  });
                }}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Note"
                )}
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
                <SelectItem value="updated-desc">Recently updated</SelectItem>
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
        <div className="flex items-center gap-2">
          <Tabs
            defaultValue="grid"
            onValueChange={(value) => setView(value as "grid" | "kanban")}
          >
            <TabsList>
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <Columns className="h-4 w-4" />
                Kanban
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}

interface NoteCardProps {
  note: Note;
  onPin: () => void;
  onDelete: () => void;
  handleUpdateNote: (note: Note) => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
}

function NoteCard({
  note,
  onPin,
  onDelete,
  handleUpdateNote,
  isUpdating,
  isDeleting,
}: NoteCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditSlashCommands, setShowEditSlashCommands] = useState(false);
  const isMobile = useIsMobile();

  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEditTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setEditingNote(editingNote ? { ...editingNote, content: value } : null);

    const cursorPosition = e.target.selectionStart;
    const lastChar = value.charAt(cursorPosition - 1);
    const prevChar = value.charAt(cursorPosition - 2);

    if (lastChar === "/" && (prevChar === "\n" || prevChar === "")) {
      setShowEditSlashCommands(true);
    } else {
      setShowEditSlashCommands(false);
    }
  };

  const handleEditTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const { text, newPosition } = handleListEnterKey(
        editingNote?.content || "",
        e.currentTarget.selectionStart
      );
      setEditingNote(editingNote ? { ...editingNote, content: text } : null);

      setTimeout(() => {
        if (editTextareaRef.current) {
          editTextareaRef.current.focus();
          editTextareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
      return;
    }

    const selection = e.currentTarget.selectionStart;
    const content = editingNote?.content || "";
    const placeholderText = "Type '/' for text and list formatting";

    if (content.includes(placeholderText)) {
      const placeholderStart = content.indexOf(placeholderText);
      const placeholderEnd = placeholderStart + placeholderText.length;

      if (selection >= placeholderStart && selection <= placeholderEnd) {
        const newText = content.replace(placeholderText, "");
        setEditingNote(
          editingNote ? { ...editingNote, content: newText } : null
        );

        setTimeout(() => {
          if (editTextareaRef.current) {
            editTextareaRef.current.setSelectionRange(
              placeholderStart,
              placeholderStart
            );
          }
        }, 0);
      }
    }
  };

  const handleEditSlashCommand = (command: SlashCommand) => {
    if (!editTextareaRef.current) return;

    const cursorPosition = editTextareaRef.current.selectionStart;
    const currentContent = editingNote?.content || "";

    const contentWithoutSlash =
      currentContent.slice(0, cursorPosition - 1) +
      currentContent.slice(cursorPosition);
    const { text, newPosition } = command.action(
      contentWithoutSlash,
      cursorPosition - 1
    );

    setEditingNote(editingNote ? { ...editingNote, content: text } : null);
    setShowEditSlashCommands(false);

    setTimeout(() => {
      if (editTextareaRef.current) {
        editTextareaRef.current.focus();
        editTextareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

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
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4" />
                      Edit note
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete note
                    </>
                  )}
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
      <Sheet open={isDetailsSheetOpen} onOpenChange={setIsDetailsSheetOpen}>
        <SheetContent
          side="right"
          className={cn(
            "overflow-y-auto sheet border-none p-4 pl-6 pt-7",
            isMobile ? "w-full max-w-none" : "w-[500px] max-w-[500px]"
          )}
        >
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold line-clamp-1">
                {note.title}
              </SheetTitle>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 space-y-3">
              <div className="text-xs text-muted-foreground">Tags</div>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 ">
                  {note.tags.map((tag) => (
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
                      </div>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Content</h3>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {note.content}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t space-y-2">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Created: {format(note.createdAt, "dd MMM, yyyy, hh:mm aa")}
                </div>
                {note.updatedAt && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Updated: {format(note.updatedAt, "dd MMM, yyyy, hh:mm aa")}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEditingNote(note);
                  setIsEditDialogOpen(true);
                  setIsDetailsSheetOpen(false);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
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
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
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
              <div className="relative">
                <Textarea
                  ref={editTextareaRef}
                  value={editingNote?.content}
                  onChange={handleEditTextareaChange}
                  onKeyDown={handleEditTextareaKeyDown}
                  className="min-h-[200px] resize-none font-mono"
                  placeholder="Type your note content here... (Type '/' for text and list formatting)"
                />
                <SlashCommandMenu
                  isOpen={showEditSlashCommands}
                  onClose={() => setShowEditSlashCommands(false)}
                  onSelect={handleEditSlashCommand}
                  triggerRef={editTextareaRef}
                />
              </div>
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
                          setEditingNote({
                            ...editingNote,
                            tags: editingNote.tags.filter((t) => t !== tag),
                          })
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
                  if (editingNote) {
                    setEditingNote({
                      ...editingNote,
                      tags: [...editingNote.tags, tag],
                    });
                  }
                }}
                key={editingNote?.tags.length || 0}
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
              disabled={
                !editingNote?.title.trim() ||
                !editingNote?.content.trim() ||
                isUpdating
              }
              onClick={async () => {
                if (editingNote) {
                  await handleUpdateNote(editingNote);
                  setIsEditDialogOpen(false);
                  setEditingNote(null);
                }
              }}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
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
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
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
  });

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
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto order-2 sm:order-1"
            onClick={() => {
              setIsAddingCustomTag(false);
              setNewCustomTag({
                name: "",
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
                const tagName = newCustomTag.name.toLowerCase();
                onTagSelect(tagName);
                setIsAddingCustomTag(false);
                setNewCustomTag({
                  name: "",
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
