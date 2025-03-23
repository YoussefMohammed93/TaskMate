"use client";

import {
  Plus,
  Calendar,
  Clock,
  ChevronDown,
  Check,
  X,
  Circle,
  CheckCircle2,
  ListChecks,
  Repeat,
  Loader2,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  GripVertical,
  ClipboardX,
} from "lucide-react";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { priorities } from "./constants";
import { useMemo, useState } from "react";
import { addMonths, setDay } from "date-fns";
import { api } from "@/convex/_generated/api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { TagSelect } from "./components/tag-select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery } from "convex/react";
import { EditTaskDialog } from "./components/edit-task-dialog";
import { DeleteTaskDialog } from "./components/delete-task-dialog";
import { EditSubtaskDialog } from "./components/edit-subtask-dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Tag = {
  id: string;
  name: string;
  color: string;
};

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "custom";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  dueDate: Date;
  status: string;
  tags: Tag[];
  subtasks: { id: number; title: string; completed: boolean }[];
  recurrence?: RecurrencePattern | null;
  createdAt: string;
  updatedAt?: string;
}

interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date | null;
  occurrences?: number | null;
}

const categories = [
  "Work",
  "Study",
  "Personal",
  "Sport",
  "Programming",
  "University",
  "Praying",
  "Reading",
] as const;

const recurrenceOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
] as const;

const weekDays = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
] as const;

const priorityColors = {
  low: {
    text: "text-blue-500",
    bg: "bg-blue-500/10",
    borderColor: "border-blue-500",
  },
  medium: {
    text: "text-yellow-500",
    bg: "bg-yellow-500/10",
    borderColor: "border-yellow-500",
  },
  high: {
    text: "text-red-500",
    bg: "bg-red-500/10",
    borderColor: "border-red-500",
  },
} as const;

const taskStatusConfig = {
  not_started: {
    label: "Not Started",
    icon: Circle,
    className: "text-slate-500",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    className: "text-blue-500",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-green-500",
  },
} as const;

type CategoryColorOption = {
  value: string;
  label: string;
};

const categoryColors: CategoryColorOption[] = [
  { value: "bg-red-500", label: "Red" },
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-yellow-500", label: "Yellow" },
] as const;

const RecurringIndicator = ({
  recurrence,
}: {
  recurrence: RecurrencePattern;
}) => {
  const getRecurrenceText = () => {
    switch (recurrence.frequency) {
      case "daily":
        return `Every ${recurrence.interval > 1 ? `${recurrence.interval} days` : "day"}`;
      case "weekly":
        if (recurrence.daysOfWeek?.length === 1) {
          return `Every ${recurrence.interval > 1 ? `${recurrence.interval} weeks` : "week"} on ${format(setDay(new Date(), recurrence.daysOfWeek[0]), "EEEE")}`;
        }
        return `Every ${recurrence.interval > 1 ? `${recurrence.interval} weeks` : "week"}`;
      case "monthly":
        return `Every ${recurrence.interval > 1 ? `${recurrence.interval} months` : "month"} on day ${recurrence.dayOfMonth}`;
      default:
        return "Recurring";
    }
  };

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Repeat className="h-3.5 w-3.5" />
      <span className="text-xs">{getRecurrenceText()}</span>
    </div>
  );
};

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  dueDate: Date;
  status: string;
  tags: Tag[];
  subtasks: Subtask[];
  recurrence?: RecurrencePattern | null;
  createdAt: string;
  updatedAt?: string;
}

type CategoryColor = (typeof categoryColors)[number]["value"];

interface CustomCategory {
  name: string;
  color: CategoryColor;
}

const TaskStatusDropdown = ({
  status,
  onStatusChange,
}: {
  status: string;
  onStatusChange: (newStatus: string) => void;
}) => {
  const currentStatus =
    taskStatusConfig[status as keyof typeof taskStatusConfig];
  const StatusIcon = currentStatus.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="dark:bg-muted task-actions"
        onClick={(e) => e.stopPropagation()}
      >
        <Button variant="outline" size="sm" className="h-8">
          <StatusIcon className={cn("h-4 w-4", currentStatus.className)} />
          {currentStatus.label}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="dark:bg-secondary"
        onClick={(e) => e.stopPropagation()}
      >
        {Object.entries(taskStatusConfig).map(([value, config]) => {
          const ItemIcon = config.icon;
          return (
            <DropdownMenuItem
              key={value}
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(value);
              }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <ItemIcon className={cn("h-4 w-4 mr-2", config.className)} />
                {config.label}
              </div>
              {status === value && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TagBadge = ({ tag, onRemove }: { tag: Tag; onRemove?: () => void }) => {
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
          <button
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
            className="ml-1 rounded-full hover:bg-black/10"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </Badge>
  );
};

const RecurrenceSelector = ({
  value,
  onChange,
}: {
  value: RecurrencePattern | null;
  onChange: (pattern: RecurrencePattern | null) => void;
}) => {
  const [, setShowCustom] = useState(false);

  const handleFrequencyChange = (frequency: RecurrenceFrequency) => {
    if (frequency === "custom") {
      setShowCustom(true);
      return;
    }

    const newPattern: RecurrencePattern = {
      frequency,
      interval: 1,
      daysOfWeek: frequency === "weekly" ? [new Date().getDay()] : undefined,
      dayOfMonth: frequency === "monthly" ? new Date().getDate() : undefined,
      endDate: null,
    };
    onChange(newPattern);
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Switch
          checked={!!value}
          onCheckedChange={(checked) => {
            if (checked) {
              handleFrequencyChange("daily");
            } else {
              onChange(null);
            }
          }}
        />
        <Label>Recurring Task</Label>
      </div>
      {value && (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Frequency</Label>
            <Select
              value={value.frequency}
              onValueChange={(v) =>
                handleFrequencyChange(v as RecurrenceFrequency)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {recurrenceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Repeat every</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                className="w-20"
                value={value.interval}
                onChange={(e) =>
                  onChange({
                    ...value,
                    interval: parseInt(e.target.value) || 1,
                  })
                }
              />
              <span>
                {value.frequency === "daily" && "days"}
                {value.frequency === "weekly" && "weeks"}
                {value.frequency === "monthly" && "months"}
              </span>
            </div>
          </div>
          {value.frequency === "weekly" && (
            <div className="grid gap-2">
              <Label>Repeat on</Label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <Button
                    key={day.value}
                    variant={
                      value.daysOfWeek?.includes(day.value)
                        ? "default"
                        : "outline"
                    }
                    className="w-10 h-10 p-0"
                    onClick={() => {
                      const newDays = value.daysOfWeek?.includes(day.value)
                        ? value.daysOfWeek.filter((d) => d !== day.value)
                        : [...(value.daysOfWeek || []), day.value];
                      onChange({ ...value, daysOfWeek: newDays });
                    }}
                  >
                    {day.label[0]}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {value.frequency === "monthly" && (
            <div className="grid gap-2">
              <Label>Day of month</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={value.dayOfMonth}
                onChange={(e) =>
                  onChange({
                    ...value,
                    dayOfMonth: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label>Ends</Label>
            <Select
              value={
                value.endDate ? "on" : value.occurrences ? "after" : "never"
              }
              onValueChange={(v) => {
                if (v === "never") {
                  onChange({ ...value, endDate: null, occurrences: null });
                } else if (v === "after") {
                  onChange({ ...value, endDate: null, occurrences: 10 });
                } else {
                  onChange({
                    ...value,
                    endDate: addMonths(new Date(), 1),
                    occurrences: null,
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="after">After</SelectItem>
                <SelectItem value="on">On date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {value.occurrences && (
            <div className="grid gap-2">
              <Label>Number of occurrences</Label>
              <Input
                type="number"
                min="1"
                value={value.occurrences}
                onChange={(e) =>
                  onChange({
                    ...value,
                    occurrences: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          )}
          {value.endDate && (
            <div className="grid gap-2">
              <Label>End date</Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !value.endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {value.endDate
                      ? format(value.endDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[300px] p-0">
                  <DialogHeader className="px-4 pt-4">
                    <DialogTitle>Select End Date</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center justify-center p-4 pt-0">
                    <CalendarComponent
                      mode="single"
                      selected={value.endDate}
                      onSelect={(newDate) => {
                        onChange({ ...value, endDate: newDate });
                        const closeButton = document.querySelector(
                          "[data-dialog-close]"
                        );
                        if (closeButton instanceof HTMLElement) {
                          closeButton.click();
                        }
                      }}
                      initialFocus
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface TaskActionsProps {
  task: Task;
  customCategories: CustomCategory[];
  setCustomCategories: React.Dispatch<React.SetStateAction<CustomCategory[]>>;
  selectedTask: Task | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>;
}

const TaskActions = ({
  task,
  selectedTask,
  setSelectedTask,
}: TaskActionsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const updateTask = useMutation(api.tasks.updateTask);

  const handleSaveTask = async (editedTask: Task) => {
    const toastId = toast.loading(`Updating "${editedTask.title}"...`);

    try {
      setIsEditing(true);
      await updateTask({
        taskId: editedTask.id as Id<"tasks">,
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority,
        category: editedTask.category,
        dueDate: editedTask.dueDate.toISOString(),
        status: editedTask.status,
        tags: editedTask.tags,
        subtasks: editedTask.subtasks,
        recurrence: editedTask.recurrence
          ? {
              frequency: editedTask.recurrence.frequency,
              interval: editedTask.recurrence.interval,
              endDate: editedTask.recurrence.endDate?.toISOString(),
              occurrences: editedTask.recurrence.occurrences ?? undefined,
              daysOfWeek: editedTask.recurrence.daysOfWeek,
              dayOfMonth: editedTask.recurrence.dayOfMonth,
            }
          : undefined,
      });

      if (selectedTask && selectedTask.id === editedTask.id) {
        setSelectedTask({
          ...editedTask,
          createdAt: selectedTask.createdAt,
          updatedAt: new Date().toISOString(),
        });
      }

      toast.success("Task updated successfully", {
        id: toastId,
        description: `"${editedTask.title}" has been updated.`,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task", {
        id: toastId,
        description: "Please try again later.",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const deleteTask = useMutation(api.tasks.deleteTask);

  const handleDeleteTask = async () => {
    const toastId = toast.loading(`Deleting "${task.title}"...`);
    try {
      setIsDeleting(true);
      await deleteTask({
        taskId: task.id as Id<"tasks">,
      });
      setIsDeleteDialogOpen(false);
      toast.success("Task deleted successfully", {
        id: toastId,
        description: `"${task.title}" has been deleted.`,
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task", {
        id: toastId,
        description: "Please try again later.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <EditTaskDialog
        task={{
          ...task,
          recurrence: task.recurrence
            ? {
                ...task.recurrence,
                frequency: task.recurrence.frequency as
                  | "daily"
                  | "weekly"
                  | "monthly"
                  | "yearly"
                  | "custom",
              }
            : null,
        }}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={async (task: import("./types").Task) => {
          await handleSaveTask({
            id: task.id,
            title: task.title,
            description: task.description || "",
            priority: task.priority,
            category: task.category,
            dueDate: task.dueDate,
            tags: task.tags,
            subtasks: task.subtasks || [],
            recurrence: task.recurrence
              ? {
                  ...task.recurrence,
                  frequency: task.recurrence.frequency as
                    | "daily"
                    | "weekly"
                    | "monthly"
                    | "custom",
                }
              : null,
            status: task.status,
            createdAt: task.createdAt,
          });
        }}
        isEditing={isEditing}
        customCategories={[]}
      />
      <DeleteTaskDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        taskTitle={task.title}
        onDelete={handleDeleteTask}
        isDeleting={isDeleting}
      />
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit task</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive group"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 text-destructive group-hover:text-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete task</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default function Tasks() {
  const [selectedFilterTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(
    []
  );
  const [newTask, setNewTask] = useState<Task>({
    id: "",
    title: "",
    description: "",
    priority: "medium",
    category: categories[0].toLowerCase(),
    dueDate: new Date(),
    status: "not_started",
    tags: [],
    subtasks: [],
    recurrence: null,
    createdAt: new Date().toISOString(),
  });
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [newCustomCategory, setNewCustomCategory] = useState<CustomCategory>({
    name: "",
    color: categoryColors[0].value,
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [tagSelectKey, setTagSelectKey] = useState(0);
  const [editingSubtask, setEditingSubtask] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deletingSubtask, setDeletingSubtask] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeletingSubtaskId, setIsDeletingSubtaskId] = useState<string | null>(
    null
  );
  const [isEditingSubtaskId, setIsEditingSubtaskId] = useState<string | null>(
    null
  );

  const updateSubtask = useMutation(api.tasks.updateSubtask);
  const deleteSubtask = useMutation(api.tasks.deleteSubtask);

  const handleUpdateSubtask = async (
    taskId: Id<"tasks">,
    subtaskId: string,
    newTitle: string
  ) => {
    setIsEditingSubtaskId(subtaskId);
    try {
      await updateSubtask({ taskId, subtaskId, title: newTitle });

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          subtasks: selectedTask.subtasks.map((subtask) =>
            subtask.id.toString() === subtaskId
              ? { ...subtask, title: newTitle }
              : subtask
          ),
        });
      }
    } catch (error) {
      throw error;
    } finally {
      setIsEditingSubtaskId(null);
    }
  };

  const handleDeleteSubtask = async (
    taskId: Id<"tasks">,
    subtaskId: string
  ) => {
    const toastId = toast.loading(`Deleting subtask...`);
    setIsDeletingSubtaskId(subtaskId);
    try {
      await deleteSubtask({ taskId, subtaskId });

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          subtasks: selectedTask.subtasks.filter(
            (subtask) => subtask.id.toString() !== subtaskId
          ),
        });
      }
      setDeletingSubtask(null);
      toast.success("Subtask deleted successfully", {
        id: toastId,
        description: `"${deletingSubtask?.title}" has been deleted.`,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete subtask", {
        id: toastId,
        description: "Please try again later.",
      });
    } finally {
      setIsDeletingSubtaskId(null);
    }
  };

  const addNewSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask = {
        id: newTask.subtasks.length + 1,
        title: newSubtaskTitle.trim(),
        completed: false,
      };
      setNewTask({
        ...newTask,
        subtasks: [...newTask.subtasks, newSubtask],
      });
      setNewSubtaskTitle("");
    }
  };

  const tasks = useQuery(api.tasks.list);

  const transformedTasks: Task[] = useMemo(() => {
    if (!tasks) return [];

    return tasks.map((task) => ({
      id: task._id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      category: task.category,
      dueDate: new Date(task.dueDate),
      status: task.status,
      tags: task.tags || [],
      subtasks: task.subtasks || [],
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      recurrence: task.recurrence
        ? {
            frequency: task.recurrence.frequency as RecurrenceFrequency,
            interval: task.recurrence.interval,
            daysOfWeek: task.recurrence.daysOfWeek,
            dayOfMonth: task.recurrence.dayOfMonth,
            endDate: task.recurrence.endDate
              ? new Date(task.recurrence.endDate)
              : undefined,
            occurrences: task.recurrence.occurrences,
          }
        : undefined,
    }));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return transformedTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags =
        selectedFilterTags.length === 0 ||
        selectedFilterTags.every((filterTag) =>
          task.tags.some((taskTag) => taskTag.id === filterTag.id)
        );

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && task.status === "completed") ||
        (statusFilter === "not_completed" && task.status !== "completed");

      return matchesSearch && matchesTags && matchesPriority && matchesStatus;
    });
  }, [
    transformedTasks,
    searchQuery,
    selectedFilterTags,
    priorityFilter,
    statusFilter,
  ]);

  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);

  const handleStatusChange = async (taskId: Id<"tasks">, newStatus: string) => {
    try {
      await updateTaskStatus({
        taskId,
        status: newStatus,
      });

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          status: newStatus,
        });
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const TaskCard = ({ task }: { task: Task; children?: React.ReactNode }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: task.id,
    });

    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : undefined;

    const priorityColor =
      priorityColors[task.priority as keyof typeof priorityColors];
    const completedSubtasks =
      task.subtasks?.filter((st) => st.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const isMobile = useIsMobile();
    const updateSubtaskStatus = useMutation(api.tasks.updateSubtaskStatus);

    const wrappedUpdateSubtaskStatus = async (params: {
      taskId: Id<"tasks">;
      subtaskId: string;
      completed: boolean;
    }) => {
      await updateSubtaskStatus(params);
    };

    return (
      <div ref={setNodeRef} style={style}>
        <Card className="relative cursor-pointer border-none shadow-sm">
          <CardHeader
            className="p-4 space-y-3"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const isInteractive = target.closest(
                "button, [role='checkbox'], [role='combobox'], .task-actions, .drag-handle"
              );
              if (!isInteractive) {
                setSelectedTask(task);
                setIsTaskSheetOpen(true);
              }
            }}
          >
            <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold line-clamp-1">
                  {task.title}
                </CardTitle>
              </div>
              <div className="flex items-start md:items-end flex-col sm:flex-row-reverse gap-2 task-actions">
                <div className="flex items-center gap-2">
                  <TaskActions
                    task={task}
                    customCategories={customCategories}
                    setCustomCategories={setCustomCategories}
                    selectedTask={selectedTask}
                    setSelectedTask={setSelectedTask}
                  />
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          {...attributes}
                          {...listeners}
                          className="hidden md:flex drag-handle cursor-grab active:cursor-grabbing items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background dark:bg-muted hover:dark:bg-muted/50 hover:text-accent-foreground h-8 w-8 p-1.5 hover:bg-muted"
                        >
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Drag to reorder</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex md:hidden">
                  <TaskStatusDropdown
                    status={task.status}
                    onStatusChange={(newStatus) =>
                      handleStatusChange(task.id as Id<"tasks">, newStatus)
                    }
                  />
                </div>
              </div>
            </div>
            {task.description && (
              <div className="text-sm text-muted-foreground">
                <p className="line-clamp-3">{task.description}</p>
              </div>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Progress ({completedSubtasks}/{totalSubtasks})
                  </span>
                  <span>
                    {Math.round((completedSubtasks / totalSubtasks) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(completedSubtasks / totalSubtasks) * 100}
                  className="h-1.5"
                />
              </div>
            )}
          </CardHeader>
          <CardContent
            className="px-4 pb-4 pt-0"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const isInteractive = target.closest(
                "button, [role='checkbox'], [role='combobox'], .task-actions"
              );
              if (!isInteractive) {
                setSelectedTask(task);
                setIsTaskSheetOpen(true);
              }
            }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  priorityColor.text,
                  priorityColor.bg
                )}
              >
                {task.priority}
              </Badge>
              {task.category && (
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    customCategories.find(
                      (c) =>
                        c.name.toLowerCase() === task.category.toLowerCase()
                    )
                      ? `text-${customCategories.find((c) => c.name.toLowerCase() === task.category.toLowerCase())?.color}-500 bg-${customCategories.find((c) => c.name.toLowerCase() === task.category.toLowerCase())?.color}-500/10`
                      : cn(
                          task.category.toLowerCase() === "work" &&
                            "text-blue-500 bg-blue-500/10",
                          task.category.toLowerCase() === "study" &&
                            "text-purple-500 bg-purple-500/10",
                          task.category.toLowerCase() === "personal" &&
                            "text-green-500 bg-green-500/10",
                          task.category.toLowerCase() === "sport" &&
                            "text-red-500 bg-red-500/10",
                          task.category.toLowerCase() === "programming" &&
                            "text-yellow-500 bg-yellow-500/10",
                          task.category.toLowerCase() === "university" &&
                            "text-orange-500 bg-orange-500/10",
                          task.category.toLowerCase() === "praying" &&
                            "text-cyan-500 bg-cyan-500/10",
                          task.category.toLowerCase() === "reading" &&
                            "text-pink-500 bg-pink-500/10"
                        )
                  )}
                >
                  {task.category}
                </Badge>
              )}
              {task.tags.slice(0, 2).map((tag: Tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
              {task.tags.length > 2 && (
                <Badge
                  variant="outline"
                  className="text-xs cursor-default dark:bg-muted/50"
                >
                  +{task.tags.length - 2} more
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {format(task.dueDate, "dd MMM, hh:mm a")}
              </div>
              {task.recurrence && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <RecurringIndicator recurrence={task.recurrence} />
                </div>
              )}
              {task.subtasks.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ListChecks className="h-3.5 w-3.5" />
                  {task.subtasks.filter((st) => st.completed).length}/
                  {task.subtasks.length}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Sheet open={isTaskSheetOpen} onOpenChange={setIsTaskSheetOpen}>
          <SheetContent
            side="right"
            className={cn(
              "overflow-y-auto sheet border-none p-4 pl-6 pt-7",
              isMobile ? "w-full max-w-none" : "w-[500px] max-w-[500px]"
            )}
          >
            <SheetHeader className="space-y-4">
              <div className="flex items-center justify-between pt-5">
                <SheetTitle className="text-xl font-semibold line-clamp-1">
                  {selectedTask?.title}
                </SheetTitle>
                <TaskActions
                  task={selectedTask!}
                  customCategories={customCategories}
                  setCustomCategories={setCustomCategories}
                  selectedTask={selectedTask}
                  setSelectedTask={setSelectedTask}
                />
              </div>
              {selectedTask?.subtasks && selectedTask.subtasks.length > 0 && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <ListChecks className="h-4 w-4" />
                    <span>Subtasks :</span>
                  </div>
                  <div>
                    {selectedTask.subtasks.filter((st) => st.completed).length}/
                    {selectedTask.subtasks.length}
                  </div>
                </div>
              )}
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Status</h3>
                  {selectedTask && (
                    <TaskStatusDropdown
                      status={selectedTask.status}
                      onStatusChange={(newStatus) =>
                        handleStatusChange(
                          selectedTask.id as Id<"tasks">,
                          newStatus
                        )
                      }
                    />
                  )}
                </div>
              </div>
              {selectedTask?.description && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Description</h3>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {selectedTask.description}
                    </p>
                  </div>
                </div>
              )}
              {selectedTask?.subtasks && selectedTask.subtasks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Subtasks</h3>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="space-y-2">
                      {selectedTask.subtasks.map((subtask, index) => (
                        <div
                          key={subtask.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            id={`subtask-${index}`}
                            checked={subtask.completed}
                            onCheckedChange={(checked) => {
                              handleSubtaskToggle(
                                selectedTask.id as Id<"tasks">,
                                subtask.id.toString(),
                                checked as boolean,
                                wrappedUpdateSubtaskStatus,
                                selectedTask,
                                setSelectedTask
                              );
                            }}
                          />
                          <label
                            htmlFor={`subtask-${index}`}
                            className={cn(
                              "flex-1 cursor-pointer",
                              subtask.completed &&
                                "line-through text-muted-foreground"
                            )}
                          >
                            {subtask.title}
                          </label>
                          <div className="flex items-center gap-2">
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="h-8 w-8"
                                    disabled={
                                      isEditingSubtaskId === subtask.id.toString()
                                    }
                                    onClick={() =>
                                      setEditingSubtask({
                                        id: subtask.id.toString(),
                                        title: subtask.title,
                                      })
                                    }
                                  >
                                    {isEditingSubtaskId === subtask.id.toString() ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Pencil className="h-3 w-3" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit subtask</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    disabled={
                                      isDeletingSubtaskId === subtask.id.toString()
                                    }
                                    onClick={() =>
                                      setDeletingSubtask({
                                        id: subtask.id.toString(),
                                        title: subtask.title,
                                      })
                                    }
                                  >
                                    {isDeletingSubtaskId === subtask.id.toString() ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete subtask</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>
                          {
                            selectedTask.subtasks.filter((st) => st.completed)
                              .length
                          }
                          /{selectedTask.subtasks.length}
                        </span>
                      </div>
                      <Progress
                        value={
                          (selectedTask.subtasks.filter((st) => st.completed)
                            .length /
                            selectedTask.subtasks.length) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              )}
              <EditSubtaskDialog
                isOpen={!!editingSubtask}
                onOpenChange={(open) => !open && setEditingSubtask(null)}
                subtaskTitle={editingSubtask?.title ?? ""}
                onSave={async (newTitle) => {
                  try {
                    await handleUpdateSubtask(
                      selectedTask!.id as Id<"tasks">,
                      editingSubtask!.id,
                      newTitle
                    );
                    setEditingSubtask(null);
                  } catch (error) {
                    throw error;
                  }
                }}
                isLoading={isEditingSubtaskId === editingSubtask?.id}
              />
              <DeleteTaskDialog
                isOpen={!!deletingSubtask}
                onOpenChange={(open) => !open && setDeletingSubtask(null)}
                taskTitle={deletingSubtask?.title ?? ""}
                onDelete={async () => {
                  await handleDeleteSubtask(
                    selectedTask!.id as Id<"tasks">,
                    deletingSubtask!.id
                  );
                }}
                isDeleting={isDeletingSubtaskId === deletingSubtask?.id}
              />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Details</h3>
                <div className="rounded-lg bg-muted/50 p-3 space-y-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Priority
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedTask && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            priorityColors[
                              selectedTask.priority as keyof typeof priorityColors
                            ].text,
                            priorityColors[
                              selectedTask.priority as keyof typeof priorityColors
                            ].bg
                          )}
                        >
                          {selectedTask.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Category
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedTask && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            selectedTask.category.toLowerCase() === "work" &&
                              "text-blue-500 bg-blue-500/10",
                            selectedTask.category.toLowerCase() === "study" &&
                              "text-purple-500 bg-purple-500/10",
                            selectedTask.category.toLowerCase() ===
                              "personal" && "text-green-500 bg-green-500/10",
                            selectedTask.category.toLowerCase() === "sport" &&
                              "text-red-500 bg-red-500/10",
                            selectedTask.category.toLowerCase() ===
                              "programming" &&
                              "text-yellow-500 bg-yellow-500/10",
                            selectedTask.category.toLowerCase() ===
                              "university" &&
                              "text-orange-500 bg-orange-500/10",
                            selectedTask.category.toLowerCase() === "praying" &&
                              "text-cyan-500 bg-cyan-500/10",
                            selectedTask.category.toLowerCase() === "reading" &&
                              "text-pink-500 bg-pink-500/10"
                          )}
                        >
                          {selectedTask.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {selectedTask?.tags && selectedTask.tags.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Tags</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTask.tags.map((tag: Tag) => (
                          <TagBadge key={tag.id} tag={tag} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {selectedTask?.recurrence && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium mr-3">Recurrence</h3>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <RecurringIndicator recurrence={selectedTask.recurrence} />
                  </div>
                </div>
              )}
              <div className="pt-4 border-t space-y-2">
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 sm:gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Created:{" "}
                    {selectedTask?.createdAt
                      ? format(
                          new Date(selectedTask.createdAt),
                          "dd MMM, yyyy, hh:mm aa"
                        )
                      : "Not available"}
                  </div>
                  {selectedTask?.updatedAt && (
                    <div className="flex items-center gap-2 sm:gap-1">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Updated:{" "}
                      {format(
                        new Date(selectedTask.updatedAt),
                        "dd MMM, yyyy, hh:mm aa"
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  };

  const BoardView = () => {
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [, setActiveDroppable] = useState<string | null>(null);
    const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      })
    );

    if (!tasks) {
      return (
        <div className="w-full h-[50vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (tasks && filteredTasks.length === 0) {
      const hasNoTasks = tasks.length === 0;
      const hasActiveFilters =
        searchQuery || priorityFilter !== "all" || statusFilter !== "all";

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
            <div className="relative p-6 bg-secondary dark:bg-muted/50 backdrop-blur-sm rounded-full ring-1 ring-border/50">
              {hasActiveFilters ? (
                <Search className="size-14 text-primary/70" strokeWidth={1.5} />
              ) : (
                <ClipboardX
                  className="size-14 text-primary/70"
                  strokeWidth={1.5}
                />
              )}
            </div>
          </div>
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl font-semibold tracking-tight">
              {hasNoTasks ? "No Tasks Yet" : "No tasks found"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {hasNoTasks ? (
                <>
                  Ready to get organized? Start by creating your first task
                  using the
                  <b className="font-semibold text-primary"> New Task </b>
                  button above.
                </>
              ) : (
                <>
                  {searchQuery && (
                    <span>
                      Search Term:{" "}
                      <b>
                        <q> {searchQuery}</q>
                      </b>
                      <br />
                    </span>
                  )}
                  {priorityFilter !== "all" && (
                    <span>
                      Priority Filter:{" "}
                      <b>
                        {priorityFilter.charAt(0).toUpperCase() +
                          priorityFilter.slice(1)}
                      </b>
                      <br />
                    </span>
                  )}
                  {statusFilter !== "all" && (
                    <span>
                      Status Filter:{" "}
                      <b>
                        {statusFilter
                          .replace("_", " ")
                          .charAt(0)
                          .toUpperCase() +
                          statusFilter.replace("_", " ").slice(1)}
                      </b>
                      <br />
                    </span>
                  )}
                  <span className="block mt-2">
                    Try adjusting your search criteria or filters to find what
                    you&apos;re looking for.
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      );
    }

    const notStartedTasks = filteredTasks.filter(
      (task) => task.status === "not_started"
    );
    const inProgressTasks = filteredTasks.filter(
      (task) => task.status === "in_progress"
    );
    const completedTasks = filteredTasks.filter(
      (task) => task.status === "completed"
    );

    const handleDragStart = (event: DragStartEvent) => {
      const { active } = event;
      const task = filteredTasks.find((t) => t.id === active.id);
      if (task) setActiveTask(task);
    };

    const handleDragOver = (event: DragOverEvent) => {
      const { over } = event;
      setActiveDroppable(over ? over.id.toString() : null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) return;

      const activeTask = filteredTasks.find((t) => t.id === active.id);
      const newStatus = over.id;

      if (activeTask && newStatus && activeTask.status !== newStatus) {
        try {
          await updateTaskStatus({
            taskId: activeTask.id as Id<"tasks">,
            status: newStatus.toString(),
          });

          if (selectedTask && selectedTask.id === activeTask.id) {
            setSelectedTask({
              ...selectedTask,
              status: newStatus.toString(),
            });
          }

          toast.success(
            `Task moved to ${newStatus.toString().replace(/_/g, " ")}`
          );
        } catch (error) {
          console.error("Failed to update task status:", error);
          toast.error("Failed to update task status");
        }
      }

      setActiveTask(null);
      setActiveDroppable(null);
    };

    const DroppableColumn = ({
      id,
      title,
      tasks,
      color,
    }: {
      id: string;
      title: string;
      tasks: Task[];
      color: string;
    }) => {
      const { setNodeRef, isOver } = useDroppable({ id });

      return (
        <div
          ref={setNodeRef}
          className={cn(
            "space-y-4 bg-secondary dark:bg-muted/60 p-5 rounded-xl h-fit transition-colors duration-200",
            isOver && "bg-muted/80 dark:bg-muted/80 ring-2 ring-primary/20"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", color)} />
              <h3 className="font-semibold">{title}</h3>
            </div>
            <Badge
              className={cn(
                "text-white hover:bg-opacity-100",
                color.replace("bg-", "bg-opacity-80 bg-")
              )}
            >
              {tasks.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task}>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    priorityColors[task.priority as keyof typeof priorityColors]
                      .text,
                    priorityColors[task.priority as keyof typeof priorityColors]
                      .bg
                  )}
                >
                  {task.priority}
                </Badge>
              </TaskCard>
            ))}
            {isOver && tasks.length === 0 && (
              <div className="h-24 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Drop here</p>
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
          <DroppableColumn
            id="not_started"
            title="Not Started"
            tasks={notStartedTasks}
            color="bg-gray-500"
          />
          <DroppableColumn
            id="in_progress"
            title="In Progress"
            tasks={inProgressTasks}
            color="bg-blue-500"
          />
          <DroppableColumn
            id="completed"
            title="Completed"
            tasks={completedTasks}
            color="bg-green-500"
          />
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-50">
              <TaskCard task={activeTask}>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    priorityColors[
                      activeTask.priority as keyof typeof priorityColors
                    ].text,
                    priorityColors[
                      activeTask.priority as keyof typeof priorityColors
                    ].bg
                  )}
                >
                  {activeTask.priority}
                </Badge>
              </TaskCard>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  };

  const createTask = useMutation(api.tasks.createTask);

  const handleCreateTask = async () => {
    const toastId = toast.loading("Creating task...");
    setIsCreating(true);

    try {
      await createTask({
        title: newTask.title,
        description: newTask.description || "",
        priority: newTask.priority,
        category: newTask.category,
        dueDate: newTask.dueDate.toISOString(),
        status: "not_started",
        tags: newTask.tags,
        subtasks: newTask.subtasks.map((subtask) => ({
          id: subtask.id,
          title: subtask.title,
          completed: false,
        })),
        recurrence: newTask.recurrence
          ? {
              frequency: newTask.recurrence.frequency,
              interval: newTask.recurrence.interval,
              endDate: newTask.recurrence.endDate?.toISOString(),
              occurrences: newTask.recurrence.occurrences ?? undefined,
              daysOfWeek: newTask.recurrence.daysOfWeek,
              dayOfMonth: newTask.recurrence.dayOfMonth,
            }
          : undefined,
      });

      toast.success("Task created successfully", {
        id: toastId,
        description: `"${newTask.title}" has been created.`,
      });

      setNewTask({
        id: "",
        title: "",
        description: "",
        priority: "medium",
        category: categories[0].toLowerCase(),
        dueDate: new Date(),
        status: "not_started",
        tags: [],
        subtasks: [],
        recurrence: null,
        createdAt: new Date().toISOString(),
      });

      setIsNewTaskDialogOpen(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task", {
        id: toastId,
        description: "Please try again later.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const TaskFilters = () => (
    <div className="flex flex-wrap gap-2">
      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Priority Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          {priorities.map((priority) => (
            <SelectItem key={priority.value} value={priority.value}>
              {priority.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tasks</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="not_completed">Not Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="pb-2 space-y-4 md:space-y-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1 text-xl font-light">
            Organize and track your tasks efficiently
          </p>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-4">
        <div className="block lg:hidden w-full relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9"
          />
        </div>
        <div className="flex lg:hidden items-center justify-between gap-2 w-full">
          <Dialog
            open={isNewTaskDialogOpen}
            onOpenChange={setIsNewTaskDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto dark:bg-muted/50">
                <Plus className="h-4 w-4" />
                <span>New Task</span>
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>
      <div className="block lg:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="min-w-[120px] whitespace-nowrap">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {priorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="min-w-[120px] whitespace-nowrap">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="not_completed">Not Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex-1 flex items-center gap-2">
          <div className="w-[300px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
            />
          </div>
          <TaskFilters />
        </div>
        <div className="flex items-center gap-2">
          <Dialog
            open={isNewTaskDialogOpen}
            onOpenChange={setIsNewTaskDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="dark:bg-muted/50">
                <Plus className="h-4 w-4" />
                <span>New Task</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="task-name">Task Name</Label>
                  <Input
                    id="task-name"
                    placeholder="Enter task name"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter task description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 items-start gap-4">
                  <div className="grid gap-2">
                    <Label>Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) =>
                        setNewTask({ ...newTask, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    {!isAddingCustomCategory ? (
                      <Select
                        value={newTask.category}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            setIsAddingCustomCategory(true);
                          } else {
                            setNewTask({ ...newTask, category: value });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {newTask.category && (
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "w-3 h-3 rounded-full",
                                    customCategories.find(
                                      (cat) =>
                                        cat.name.toLowerCase() ===
                                        newTask.category
                                    )?.color ||
                                      (newTask.category.toLowerCase() ===
                                        "work" &&
                                        "bg-blue-500") ||
                                      (newTask.category.toLowerCase() ===
                                        "study" &&
                                        "bg-purple-500") ||
                                      (newTask.category.toLowerCase() ===
                                        "personal" &&
                                        "bg-green-500") ||
                                      (newTask.category.toLowerCase() ===
                                        "sport" &&
                                        "bg-red-500") ||
                                      (newTask.category.toLowerCase() ===
                                        "programming" &&
                                        "bg-yellow-500") ||
                                      (newTask.category.toLowerCase() ===
                                        "university" &&
                                        "bg-orange-500") ||
                                      (newTask.category.toLowerCase() ===
                                        "praying" &&
                                        "bg-cyan-500") ||
                                      (newTask.category.toLowerCase() ===
                                        "reading" &&
                                        "bg-pink-500")
                                  )}
                                />
                                {newTask.category.charAt(0).toUpperCase() +
                                  newTask.category.slice(1)}
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category}
                              value={category.toLowerCase()}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "w-3 h-3 rounded-full",
                                    category.toLowerCase() === "work" &&
                                      "bg-blue-500",
                                    category.toLowerCase() === "study" &&
                                      "bg-purple-500",
                                    category.toLowerCase() === "personal" &&
                                      "bg-green-500",
                                    category.toLowerCase() === "sport" &&
                                      "bg-red-500",
                                    category.toLowerCase() === "programming" &&
                                      "bg-yellow-500",
                                    category.toLowerCase() === "university" &&
                                      "bg-orange-500",
                                    category.toLowerCase() === "praying" &&
                                      "bg-cyan-500",
                                    category.toLowerCase() === "reading" &&
                                      "bg-pink-500"
                                  )}
                                />
                                {category}
                              </div>
                            </SelectItem>
                          ))}
                          {customCategories.map((category) => (
                            <SelectItem
                              key={category.name}
                              value={category.name.toLowerCase()}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "w-3 h-3 rounded-full",
                                    category.color
                                  )}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                          <SelectSeparator />
                          <SelectItem value="custom">
                            + Add Custom Category
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex-1">
                            <Input
                              placeholder="Enter category name"
                              value={newCustomCategory.name}
                              onChange={(e) =>
                                setNewCustomCategory({
                                  ...newCustomCategory,
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
                              setIsAddingCustomCategory(false);
                              setNewCustomCategory({
                                name: "",
                                color: categoryColors[0].value,
                              });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="w-full sm:w-auto order-1 sm:order-2"
                            disabled={newCustomCategory.name.length < 3}
                            onClick={() => {
                              setCustomCategories([
                                ...customCategories,
                                {
                                  name: newCustomCategory.name,
                                  color: categoryColors[0].value,
                                },
                              ]);
                              setNewTask({
                                ...newTask,
                                category: newCustomCategory.name.toLowerCase(),
                              });
                              setIsAddingCustomCategory(false);
                              setNewCustomCategory({
                                name: "",
                                color: categoryColors[0].value,
                              });
                            }}
                          >
                            Add Category
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Due Date</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[300px] p-0">
                      <DialogHeader className="px-4 pt-4">
                        <DialogTitle>Select Date</DialogTitle>
                      </DialogHeader>
                      <div className="flex items-center justify-center p-4 pt-0">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={(newDate) => {
                            setDate(newDate);
                            setNewTask({
                              ...newTask,
                              dueDate: newDate || new Date(),
                            });
                            const closeButton = document.querySelector(
                              "[data-dialog-close]"
                            );
                            if (closeButton instanceof HTMLElement) {
                              closeButton.click();
                            }
                          }}
                          initialFocus
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid gap-2">
                  <Label>Subtasks</Label>
                  <div className="space-y-2">
                    {newTask.subtasks.map((subtask, index) => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <Input
                          value={subtask.title}
                          onChange={(e) => {
                            const updatedSubtasks = [...newTask.subtasks];
                            updatedSubtasks[index].title = e.target.value;
                            setNewTask({
                              ...newTask,
                              subtasks: updatedSubtasks,
                            });
                          }}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            const updatedSubtasks = newTask.subtasks.filter(
                              (_, i) => i !== index
                            );
                            setNewTask({
                              ...newTask,
                              subtasks: updatedSubtasks,
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add subtask"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newSubtaskTitle.trim()) {
                            addNewSubtask();
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={addNewSubtask}
                        disabled={!newSubtaskTitle.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {newTask.tags.map((tag) => (
                      <TagBadge
                        key={tag.id}
                        tag={tag}
                        onRemove={() => {
                          setNewTask({
                            ...newTask,
                            tags: newTask.tags.filter((t) => t.id !== tag.id),
                          });
                        }}
                      />
                    ))}
                  </div>
                  <TagSelect
                    key={tagSelectKey}
                    selectedTags={newTask.tags}
                    onTagSelect={(tag) => {
                      setNewTask({
                        ...newTask,
                        tags: [...newTask.tags, tag],
                      });
                      setTagSelectKey((prev) => prev + 1);
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Recurrence</Label>
                  <RecurrenceSelector
                    value={newTask.recurrence ?? null}
                    onChange={(pattern) =>
                      setNewTask({ ...newTask, recurrence: pattern })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline" disabled={isCreating}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button onClick={handleCreateTask} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Task"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="mt-2 lg:mt-4">
        <BoardView />
      </div>
    </div>
  );
}

const handleSubtaskToggle = async (
  taskId: Id<"tasks">,
  subtaskId: string,
  checked: boolean,
  updateSubtaskStatus: (params: {
    taskId: Id<"tasks">;
    subtaskId: string;
    completed: boolean;
  }) => Promise<void>,
  selectedTask: Task | null,
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>
) => {
  try {
    await updateSubtaskStatus({
      taskId,
      subtaskId,
      completed: checked,
    });

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({
        ...selectedTask,
        subtasks: selectedTask.subtasks.map((st) =>
          st.id.toString() === subtaskId ? { ...st, completed: checked } : st
        ),
      });
    }
  } catch (error) {
    console.error("Failed to update subtask status:", error);
  }
};
