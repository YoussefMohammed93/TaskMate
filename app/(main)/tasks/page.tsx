/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Plus,
  LayoutGrid,
  Columns,
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
  Table as TableIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetOverlay,
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
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { EditTaskDialog } from "./components/edit-task-dialog";
import { addMonths, addDays, addWeeks, setDay } from "date-fns";
import { DeleteTaskDialog } from "./components/delete-task-dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

type ViewType = "table" | "board" | "cards";

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
}

interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date | null;
  occurrences?: number | null;
}

// const taskStatuses = [
//   { value: "not_started", label: "Not Started" },
//   { value: "in_progress", label: "In Progress" },
//   { value: "completed", label: "Completed" },
// ] as const;

const priorities = [
  { value: "high", label: "High", color: "text-red-500" },
  { value: "medium", label: "Medium", color: "text-yellow-500" },
  { value: "low", label: "Low", color: "text-green-500" },
] as const;

const categories = [
  "Work",
  "Personal",
  "Shopping",
  "Health",
  "Education",
  "Finance",
] as const;

const defaultTags = [
  { id: "1", name: "Bug", color: "red" },
  { id: "2", name: "Feature", color: "blue" },
  { id: "3", name: "Documentation", color: "purple" },
  { id: "4", name: "Urgent", color: "orange" },
  { id: "5", name: "Enhancement", color: "green" },
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
  },
  medium: {
    text: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  high: {
    text: "text-red-500",
    bg: "bg-red-500/10",
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
    <div className="flex items-center gap-1 text-muted-foreground">
      <Repeat className="h-4 w-4" />
      <span className="text-xs">{getRecurrenceText()}</span>
    </div>
  );
};

const exampleTasks: Task[] = [
  {
    id: "1",
    title: "Complete project presentation",
    description: "Prepare slides and demo for the quarterly review meeting",
    priority: "high",
    category: "Work",
    dueDate: new Date(),
    status: "in_progress",
    tags: [
      { id: "1", name: "urgent", color: "orange" },
      { id: "2", name: "documentation", color: "purple" },
    ],
    subtasks: [
      { id: 1, title: "Create slides", completed: true },
      { id: 2, title: "Prepare demo", completed: false },
    ],
  },
  {
    id: "2",
    title: "Review documentation",
    description: "Review and update project documentation",
    priority: "medium",
    category: "Work",
    dueDate: new Date(),
    status: "not_started",
    tags: [{ id: "3", name: "documentation", color: "purple" }],
    subtasks: [
      { id: 3, title: "Read current docs", completed: false },
      { id: 4, title: "Update outdated sections", completed: false },
    ],
  },
  {
    id: "3",
    title: "Team meeting notes",
    description: "Write up and share meeting notes",
    priority: "low",
    category: "Work",
    dueDate: new Date(),
    status: "completed",
    tags: [{ id: "5", name: "enhancement", color: "green" }],
    subtasks: [
      { id: 5, title: "Draft notes", completed: true },
      { id: 6, title: "Share with team", completed: true },
    ],
  },
  {
    id: "4",
    title: "Weekly Team Meeting",
    description: "Regular team sync-up meeting",
    priority: "medium",
    category: "Work",
    dueDate: new Date(),
    status: "not_started",
    tags: [{ id: "1", name: "recurring", color: "blue" }],
    subtasks: [
      { id: 7, title: "Prepare agenda", completed: false },
      { id: 8, title: "Send meeting notes", completed: false },
    ],
    recurrence: {
      frequency: "weekly",
      interval: 1,
      daysOfWeek: [1],
      endDate: null,
    },
  },
  {
    id: "5",
    title: "Team Stand-up",
    description: "Daily team sync meeting",
    priority: "medium",
    category: "Work",
    dueDate: new Date(),
    status: "not_started",
    tags: [{ id: "1", name: "meeting", color: "blue" }],
    subtasks: [],
    recurrence: {
      frequency: "daily",
      interval: 1,
      endDate: null,
    },
  },
  {
    id: "6",
    title: "Weekly Report",
    description: "Submit weekly progress report",
    priority: "high",
    category: "Work",
    dueDate: new Date(),
    status: "not_started",
    tags: [{ id: "2", name: "report", color: "purple" }],
    subtasks: [],
    recurrence: {
      frequency: "weekly",
      interval: 1,
      daysOfWeek: [5],
      endDate: null,
    },
  },
  {
    id: "7",
    title: "Monthly Budget Review",
    description: "Review and adjust monthly budget",
    priority: "high",
    category: "Finance",
    dueDate: new Date(),
    status: "not_started",
    tags: [{ id: "3", name: "finance", color: "green" }],
    subtasks: [],
    recurrence: {
      frequency: "monthly",
      interval: 1,
      dayOfMonth: 1,
      endDate: null,
    },
  },
];

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
      <DropdownMenuTrigger asChild className="dark:bg-muted">
        <Button variant="outline" size="sm" className="h-8">
          <StatusIcon className={cn("h-4 w-4", currentStatus.className)} />
          {currentStatus.label}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dark:bg-secondary">
        {Object.entries(taskStatusConfig).map(([value, config]) => {
          const ItemIcon = config.icon;
          return (
            <DropdownMenuItem
              key={value}
              onClick={() => onStatusChange(value)}
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

interface CustomTag {
  id: string;
  name: string;
  color: string;
}

const TagSelect = ({
  selectedTags,
  onTagSelect,
}: {
  selectedTags: Tag[];
  onTagSelect: (tag: Tag) => void;
}) => {
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
      onValueChange={(value) => {
        if (value === "custom") {
          setIsAddingCustomTag(true);
        } else {
          const selectedTag = defaultTags.find((tag) => tag.id === value);
          if (selectedTag) onTagSelect(selectedTag);
        }
      }}
    >
      <SelectTrigger>
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
};

const RecurrenceSelector = ({
  value,
  onChange,
}: {
  value: RecurrencePattern | null;
  onChange: (pattern: RecurrencePattern | null) => void;
}) => {
  const [showCustom, setShowCustom] = useState(false);

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
                        // Close the dialog after selection
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
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskActions = ({
  task,
  customCategories,
  setCustomCategories,
  setTasks,
}: TaskActionsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleSaveTask = (updatedTask: Task) => {
    setTasks((prevTasks: Task[]) =>
      prevTasks.map((t) => (t.id === task.id ? updatedTask : t))
    );
  };

  return (
    <div className="flex items-center gap-2">
      {/* <EditTaskDialog
        // task={task}
        // editedTask={editedTask}
        // customCategories={customCategories}
        // setCustomCategories={setCustomCategories}
        // isOpen={isEditDialogOpen}
        // onOpenChange={setIsEditDialogOpen}
      /> */}

      <DeleteTaskDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        taskTitle={task.title}
        onDelete={() => {
          setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));
          setIsDeleteDialogOpen(false);
        }}
      />

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          setEditedTask(task);
          setIsEditDialogOpen(true);
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 text-destructive group"
        onClick={() => setIsDeleteDialogOpen(true)}
      >
        <Trash2 className="h-4 w-4 text-destructive group-hover:text-destructive" />
      </Button>
    </div>
  );
};

export default function Tasks() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ViewType>("board");
  const [tasks, setTasks] = useState(exampleTasks);
  const [selectedFilterTags, setSelectedFilterTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(
    []
  );

  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "",
    dueDate: new Date(),
    tags: [] as Tag[],
    recurrence: null as RecurrencePattern | null,
  });

  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [newCustomCategory, setNewCustomCategory] = useState({
    name: "",
    color: categoryColors[0].value,
  });

  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter((task) => {
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

  useEffect(() => {
    localStorage.setItem("taskView", view);
  }, [view]);

  const handleStatusChange = (taskId: string, newStatus: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const ViewToggle = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="dark:bg-muted/50">
        <Button variant="outline" className="gap-2">
          {view === "board" && <Columns className="h-4 w-4" />}
          {view === "cards" && <LayoutGrid className="h-4 w-4" />}
          {view === "table" && <TableIcon className="h-4 w-4" />}
          {view.charAt(0).toUpperCase() + view.slice(1)} View
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="dark:bg-secondary">
        <DropdownMenuItem
          onClick={() => {
            setView("board");
            localStorage.setItem("tasksView", "board");
          }}
        >
          <Columns className="h-4 w-4 mr-2" /> Board View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setView("cards");
            localStorage.setItem("tasksView", "cards");
          }}
        >
          <LayoutGrid className="h-4 w-4 mr-2" /> Cards View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setView("table");
            localStorage.setItem("tasksView", "table");
          }}
        >
          <TableIcon className="h-4 w-4 mr-2" /> Table View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const TableView = () => (
    <>
      {filteredTasks.length > 0 ? (
        <div className="rounded-md border overflow-auto md:mt-4">
          <Table>
            <TableHeader className="dark:bg-secondary">
              <TableRow>
                <TableHead className="min-w-[200px]">Task</TableHead>
                <TableHead className="min-w-[100px]">Category</TableHead>
                <TableHead className="min-w-[150px]">Tags</TableHead>
                <TableHead className="min-w-[100px]">Priority</TableHead>
                <TableHead className="min-w-[120px]">Due Date</TableHead>
                <TableHead className="min-w-[150px]">Recurrence</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Sub Tasks</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="dark:bg-secondary">
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="max-w-[200px]">
                    <div>
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        task.category.toLowerCase() === "work" &&
                          "text-blue-500 bg-blue-500/10",
                        task.category.toLowerCase() === "personal" &&
                          "text-purple-500 bg-purple-500/10",
                        task.category.toLowerCase() === "shopping" &&
                          "text-green-500 bg-green-500/10",
                        task.category.toLowerCase() === "health" &&
                          "text-red-500 bg-red-500/10",
                        task.category.toLowerCase() === "education" &&
                          "text-yellow-500 bg-yellow-500/10",
                        task.category.toLowerCase() === "finance" &&
                          "text-orange-500 bg-orange-500/10"
                      )}
                    >
                      {task.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {task.tags.map((tag) => (
                        <TagBadge key={tag.id} tag={tag} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          task.priority === "high" &&
                            "text-red-500 bg-red-500/10",
                          task.priority === "medium" &&
                            "text-yellow-500 bg-yellow-500/10",
                          task.priority === "low" &&
                            "text-green-500 bg-green-500/10"
                        )}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{format(task.dueDate, "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    {task.recurrence ? (
                      <RecurringIndicator recurrence={task.recurrence} />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        none
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <TaskStatusDropdown
                      status={task.status}
                      onStatusChange={(newStatus) => {
                        handleStatusChange(task.id, newStatus);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {task.subtasks && (
                      <div className="flex items-center gap-1">
                        <ListChecks className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {task.subtasks.filter((st) => st.completed).length}/
                          {task.subtasks.length}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <TaskActions
                      task={task}
                      customCategories={customCategories}
                      setCustomCategories={setCustomCategories}
                      setTasks={setTasks}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <NoTasksFound
          onClearFilters={() =>
            handleClearFilters({
              setSearchQuery,
              setSelectedFilterTags,
              setPriorityFilter,
              setStatusFilter,
            })
          }
        />
      )}
    </>
  );

  const TaskCard = ({
    task,
    children,
  }: {
    task: Task;
    children?: React.ReactNode;
  }) => {
    const priorityColor =
      priorityColors[task.priority as keyof typeof priorityColors];
    const completedSubtasks =
      task.subtasks?.filter((st) => st.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const isMobile = useIsMobile();

    return (
      <>
        <Card className="cursor-pointer">
          <CardHeader
            className="p-3 sm:p-4"
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest(".task-actions")) {
                setSelectedTask(task);
                setIsTaskSheetOpen(true);
              }
            }}
          >
            <div className="flex flex-col gap-4 xl:gap-2">
              <div className="flex items-start justify-between flex-col xl:flex-row gap-1 sm:gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm sm:text-base line-clamp-1">
                    {task.title}
                  </CardTitle>
                  <CardDescription className="my-2 xl:my-1 text-xs sm:text-sm line-clamp-2">
                    {task.description}
                  </CardDescription>
                  {task.recurrence && (
                    <div className="mt-1 sm:mt-2">
                      <RecurringIndicator recurrence={task.recurrence} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 sm:gap-2 xl:ml-2 task-actions">
                  <TaskStatusDropdown
                    status={task.status}
                    onStatusChange={(newStatus) =>
                      handleStatusChange(task.id, newStatus)
                    }
                  />
                  <TaskActions
                    task={task}
                    customCategories={customCategories}
                    setCustomCategories={setCustomCategories}
                    setTasks={setTasks}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    task.category.toLowerCase() === "work" &&
                      "text-blue-500 bg-blue-500/10",
                    task.category.toLowerCase() === "personal" &&
                      "text-purple-500 bg-purple-500/10",
                    task.category.toLowerCase() === "shopping" &&
                      "text-green-500 bg-green-500/10",
                    task.category.toLowerCase() === "health" &&
                      "text-red-500 bg-red-500/10",
                    task.category.toLowerCase() === "education" &&
                      "text-yellow-500 bg-yellow-500/10",
                    task.category.toLowerCase() === "finance" &&
                      "text-orange-500 bg-orange-500/10"
                  )}
                >
                  {task.category}
                </Badge>
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
                {task.tags.map((tag: Tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                {format(task.dueDate, "MMM dd")}
              </div>
              <div className="flex items-center gap-1">
                <ListChecks className="h-3 w-3 sm:h-4 sm:w-4" />
                {completedSubtasks}/{totalSubtasks}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Details Sheet */}
        <Sheet open={isTaskSheetOpen} onOpenChange={setIsTaskSheetOpen}>
          <SheetContent
            side="right"
            className={cn(
              "overflow-y-auto sheet border-none",
              isMobile ? "w-full max-w-none" : "w-[500px] max-w-[500px]"
            )}
          >
            <SheetHeader>
              <SheetTitle className="text-xl font-semibold">
                {selectedTask?.title}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedTask?.description}
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Status</h3>
                <div className="flex items-center gap-2">
                  {selectedTask && (
                    <TaskStatusDropdown
                      status={selectedTask.status}
                      onStatusChange={(newStatus) =>
                        handleStatusChange(selectedTask.id, newStatus)
                      }
                    />
                  )}
                </div>
              </div>

              {/* Priority & Category */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Details</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      selectedTask &&
                        priorityColors[
                          selectedTask.priority as keyof typeof priorityColors
                        ].text,
                      selectedTask &&
                        priorityColors[
                          selectedTask.priority as keyof typeof priorityColors
                        ].bg
                    )}
                  >
                    {selectedTask?.priority}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {selectedTask?.category}
                  </Badge>
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Due Date</h3>
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {selectedTask?.dueDate.toLocaleDateString()}
                </div>
              </div>

              {/* Subtasks */}
              {selectedTask?.subtasks && selectedTask.subtasks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Subtasks</h3>
                  <div className="space-y-2">
                    {selectedTask.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={() => {
                            // Add your subtask toggle logic here
                          }}
                        />
                        <span className="text-sm">{subtask.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // Add your edit logic here
                    setIsTaskSheetOpen(false);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    // Add your delete logic here
                    setIsTaskSheetOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  };

  const BoardView = () => {
    const notStartedTasks = filteredTasks.filter(
      (task) => task.status === "not_started"
    );
    const inProgressTasks = filteredTasks.filter(
      (task) => task.status === "in_progress"
    );
    const completedTasks = filteredTasks.filter(
      (task) => task.status === "completed"
    );

    const renderTask = (task: Task) => (
      <TaskCard key={task.id} task={task}>
        <Badge
          variant="outline"
          className={cn(
            "capitalize",
            priorityColors[task.priority as keyof typeof priorityColors].text,
            priorityColors[task.priority as keyof typeof priorityColors].bg
          )}
        >
          {task.priority}
        </Badge>
      </TaskCard>
    );

    return (
      <>
        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Not Started</h3>
                <Badge variant="outline">{notStartedTasks.length}</Badge>
              </div>
              <div className="space-y-3">{notStartedTasks.map(renderTask)}</div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">In Progress</h3>
                <Badge variant="outline">{inProgressTasks.length}</Badge>
              </div>
              <div className="space-y-3">{inProgressTasks.map(renderTask)}</div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Completed</h3>
                <Badge variant="outline">{completedTasks.length}</Badge>
              </div>
              <div className="space-y-3">{completedTasks.map(renderTask)}</div>
            </div>
          </div>
        ) : (
          <NoTasksFound
            onClearFilters={() =>
              handleClearFilters({
                setSearchQuery,
                setSelectedFilterTags,
                setPriorityFilter,
                setStatusFilter,
              })
            }
          />
        )}
      </>
    );
  };

  const CardsView = () => (
    <>
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:pt-2">
          {filteredTasks.map((task) => (
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
        </div>
      ) : (
        <NoTasksFound
          onClearFilters={() =>
            handleClearFilters({
              setSearchQuery,
              setSelectedFilterTags,
              setPriorityFilter,
              setStatusFilter,
            })
          }
        />
      )}
    </>
  );

  const createRecurringTasks = (task: Task) => {
    if (!task.recurrence) return [task];

    const tasks: Task[] = [];
    let currentDate = task.dueDate;
    let count = 0;

    while (true) {
      tasks.push({
        ...task,
        id: (Date.now() + count).toString(),
        dueDate: currentDate,
      });

      count++;

      if (task.recurrence.occurrences && count >= task.recurrence.occurrences) {
        break;
      }
      if (task.recurrence.endDate && currentDate >= task.recurrence.endDate) {
        break;
      }

      switch (task.recurrence.frequency) {
        case "daily":
          currentDate = addDays(currentDate, task.recurrence.interval);
          break;
        case "weekly":
          currentDate = addWeeks(currentDate, task.recurrence.interval);
          break;
        case "monthly":
          currentDate = addMonths(currentDate, task.recurrence.interval);
          break;
      }
    }

    return tasks;
  };

  const handleCreateTask = () => {
    const newTasks = createRecurringTasks({
      ...newTask,
      id: Date.now().toString(),
      status: "not_started",
      subtasks: [],
    });
    setTasks([...tasks, ...newTasks]);
  };

  useEffect(() => {
    const savedView = localStorage.getItem("tasksView");
    if (
      savedView &&
      (savedView === "board" || savedView === "cards" || savedView === "table")
    ) {
      setView(savedView as ViewType);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("taskView", view);
    }
  }, [view, mounted]);

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin 2-8 h-8" />
      </div>
    );
  }

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
      <div className="flex flex-col gap-4">
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
          <ViewToggle />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="dark:bg-muted/50">
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="task-name">Task Name</Label>
                  <Input id="task-name" placeholder="Enter task name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter task description"
                  />
                </div>
                <div className="grid grid-cols-2 items-start gap-4">
                  <div className="grid gap-2">
                    <Label>Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                            className={priority.color}
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
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category}
                              value={category.toLowerCase()}
                            >
                              {category}
                            </SelectItem>
                          ))}
                          {customCategories.map((category) => (
                            <SelectItem
                              key={category.name}
                              value={category.name.toLowerCase()}
                            >
                              {category.name}
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
                          <div className="flex-1 space-y-2">
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
                          <Select
                            value={newCustomCategory.color}
                            onValueChange={(value) =>
                              setNewCustomCategory({
                                ...newCustomCategory,
                                color:
                                  value as (typeof categoryColors)[number]["value"],
                              })
                            }
                          >
                            <SelectTrigger className="w-full sm:w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryColors.map((color) => (
                                <SelectItem
                                  key={color.value}
                                  value={color.value}
                                  className="bg-transparent"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "w-2 h-2 rounded-full",
                                        color.value
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
                              const newCategory = {
                                name: newCustomCategory.name,
                                color: newCustomCategory.color,
                              };
                              setCustomCategories([
                                ...customCategories,
                                newCategory,
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
                    <div className="flex items-center gap-2">
                      <Input placeholder="Add subtask" />
                      <Button size="icon" variant="outline">
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
                    selectedTags={newTask.tags}
                    onTagSelect={(tag) => {
                      setNewTask({
                        ...newTask,
                        tags: [...newTask.tags, tag],
                      });
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <RecurrenceSelector
                    value={newTask.recurrence}
                    onChange={(pattern) =>
                      setNewTask({ ...newTask, recurrence: pattern })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="destructive">Close</Button>
                </DialogClose>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="block lg:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-5">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="min-w-[120px] whitespace-nowrap">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {priorities.map((priority) => (
                <SelectItem
                  key={priority.value}
                  value={priority.value}
                  className={priority.color}
                >
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
          <ViewToggle />
          <Dialog>
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
                  <Input id="task-name" placeholder="Enter task name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter task description"
                  />
                </div>
                <div className="grid grid-cols-1 items-start gap-4">
                  <div className="grid gap-2">
                    <Label>Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                            className={priority.color}
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
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category}
                              value={category.toLowerCase()}
                            >
                              {category}
                            </SelectItem>
                          ))}
                          {customCategories.map((category) => (
                            <SelectItem
                              key={category.name}
                              value={category.name.toLowerCase()}
                              className={category.color}
                            >
                              {category.name}
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
                          <div className="flex-1 space-y-2">
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
                          <Select
                            value={newCustomCategory.color}
                            onValueChange={(value) =>
                              setNewCustomCategory({
                                ...newCustomCategory,
                                color:
                                  value as (typeof categoryColors)[number]["value"],
                              })
                            }
                          >
                            <SelectTrigger className="w-full sm:w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryColors.map((color) => (
                                <SelectItem
                                  key={color.value}
                                  value={color.value}
                                  className="bg-transparent"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "w-3 h-3 rounded-full",
                                        color.value
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
                              const newCategory = {
                                name: newCustomCategory.name,
                                color: newCustomCategory.color,
                              };
                              setCustomCategories([
                                ...customCategories,
                                newCategory,
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
                    <div className="flex items-center gap-2">
                      <Input placeholder="Add subtask" />
                      <Button size="icon" variant="outline">
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
                    selectedTags={newTask.tags}
                    onTagSelect={(tag) => {
                      setNewTask({
                        ...newTask,
                        tags: [...newTask.tags, tag],
                      });
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <RecurrenceSelector
                    value={newTask.recurrence}
                    onChange={(pattern) =>
                      setNewTask({ ...newTask, recurrence: pattern })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="destructive">Close</Button>
                </DialogClose>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="mt-2 lg:mt-4">
        {view === "board" && <BoardView />}
        {view === "cards" && <CardsView />}
        {view === "table" && <TableView />}
      </div>
    </div>
  );
}

interface NoTasksFoundProps {
  onClearFilters: () => void;
}

const NoTasksFound = ({ onClearFilters }: NoTasksFoundProps) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="rounded-full bg-muted p-3 mb-4">
      <Search className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="font-semibold mb-1">No tasks found</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Try adjusting your search or filters to find what you&apos;re looking for.
    </p>
    <Button variant="outline" onClick={onClearFilters} className="gap-2">
      <X className="h-4 w-4" />
      Clear all filters
    </Button>
  </div>
);

const handleClearFilters = ({
  setSearchQuery,
  setSelectedFilterTags,
  setPriorityFilter,
  setStatusFilter,
}: {
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFilterTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  setPriorityFilter: React.Dispatch<React.SetStateAction<string>>;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
}) => {
  setSearchQuery("");
  setSelectedFilterTags([]);
  setPriorityFilter("all");
  setStatusFilter("all");
};
