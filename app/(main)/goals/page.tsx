"use client";

import {
  GoalCategory,
  GoalTimeframe,
  Goal,
  priorityColors,
  GoalPriority,
  GoalStatus,
} from "./types";
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  Search,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIES: { label: string; value: GoalCategory }[] = [
  { label: "Personal", value: "personal" },
  { label: "Work", value: "work" },
  { label: "Health", value: "health" },
  { label: "Financial", value: "financial" },
  { label: "Shopping", value: "shopping" },
  { label: "Education", value: "education" },
];

const TIMEFRAMES: { label: string; value: GoalTimeframe }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

const PRIORITIES: { label: string; value: GoalPriority }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const GOAL_STATUSES: { label: string; value: GoalStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Upcoming", value: "upcoming" },
];

interface NewGoal {
  title: string;
  description: string;
  category: GoalCategory | "";
  timeframe: GoalTimeframe | "";
  priority: GoalPriority | "";
  startDate: Date | null;
  endDate: Date | null;
  milestones: { id: string; title: string; completed: boolean }[];
}

export default function Goals() {
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory>("all");
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<GoalTimeframe>("all");
  const goals = useQuery(api.goals.list);
  const isLoading = !goals;
  const createGoal = useMutation(api.goals.createGoal);
  const updateGoal = useMutation(api.goals.updateGoal);
  const deleteGoal = useMutation(api.goals.deleteGoal);
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<NewGoal>({
    title: "",
    description: "",
    category: "",
    timeframe: "",
    priority: "",
    startDate: null,
    endDate: null,
    milestones: [],
  });
  const [newMilestone, setNewMilestone] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isGoalSheetOpen, setIsGoalSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingMilestone, setEditingMilestone] = useState("");
  const isMobile = useIsMobile();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const calculateProgress = (milestones: { completed: boolean }[]) => {
    if (!milestones.length) return 0;
    const completedMilestones = milestones.filter((m) => m.completed).length;
    return (completedMilestones / milestones.length) * 100;
  };

  const calculateStats = () => {
    const total = goals?.length ?? 0;
    const completed =
      goals?.filter((g) => g.status === "completed").length ?? 0;
    const active = goals?.filter((g) => g.status === "active").length ?? 0;
    const upcoming = goals?.filter((g) => g.status === "upcoming").length ?? 0;

    const totalMilestones = goals?.reduce(
      (acc, goal) => acc + goal.milestones.length,
      0
    );
    const completedMilestones = goals?.reduce(
      (acc, goal) => acc + goal.milestones.filter((m) => m.completed).length,
      0
    );

    return {
      totalGoals: total,
      completedGoals: completed,
      activeGoals: active,
      upcomingGoals: upcoming,
      completionRate:
        (totalMilestones ?? 0) > 0
          ? ((completedMilestones ?? 0) / (totalMilestones ?? 0)) * 100
          : 0,
    };
  };

  const filteredGoals = goals?.filter((goal) => {
    if (selectedCategory !== "all" && goal.category !== selectedCategory)
      return false;
    if (selectedTimeframe !== "all" && goal.timeframe !== selectedTimeframe)
      return false;
    return true;
  });

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsGoalSheetOpen(true);
  };

  const renderGoalCard = (goal: Goal) => (
    <Card
      key={goal.id}
      className="cursor-pointer"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        const isInteractive = target.closest(
          '.goal-actions, button, [role="checkbox"], [role="combobox"]'
        );

        if (!isInteractive) {
          handleGoalClick(goal);
        }
      }}
    >
      <CardHeader className="relative p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("capitalize", priorityColors[goal.priority].text)}
            >
              {goal.priority}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {goal.category}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {goal.timeframe}
            </Badge>
          </div>
          <div className="goal-actions">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(goal);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit goal
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(goal);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete goal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardTitle className="text-lg mt-2">{goal.title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Progress</span>
              <span>
                {goal.milestones.filter((m) => m.completed).length}/
                {goal.milestones.length} Milestones
              </span>
            </div>
            <Progress
              value={calculateProgress(goal.milestones)}
              className="h-2"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Due {new Date(goal.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="capitalize">{goal.timeframe}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleCreateGoal = async () => {
    if (!newGoal.startDate || !newGoal.endDate) {
      toast.error("Start and end dates are required");
      return;
    }

    const startDate = new Date(newGoal.startDate);
    const endDate = new Date(newGoal.endDate);

    if (endDate < startDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    if (newGoal.milestones.length === 0) {
      toast.error("At least one milestone is required");
      return;
    }

    setIsCreating(true);

    try {
      const today = new Date();
      let status: GoalStatus = "active";
      if (startDate > today) {
        status = "upcoming";
      }

      const goalData = {
        ...newGoal,
        status,
        progress: 0,
        startDate: newGoal.startDate.toISOString(),
        endDate: newGoal.endDate.toISOString(),
      };

      await createGoal(goalData);
      setIsNewGoalDialogOpen(false);
      setNewGoal({
        title: "",
        description: "",
        category: "",
        timeframe: "",
        priority: "",
        startDate: null,
        endDate: null,
        milestones: [],
      });
    } catch (error) {
      console.error("Failed to create goal:", error);
      toast.error("Failed to create goal", {
        description: "Please try again later.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      setNewGoal({
        ...newGoal,
        milestones: [
          ...newGoal.milestones,
          {
            id: Math.random().toString(36).substr(2, 9),
            title: newMilestone,
            completed: false,
          },
        ],
      });
      setNewMilestone("");
    }
  };

  const handleDeleteClick = (goal: Goal) => {
    setGoalToDelete(goal);
    setIsDeleteDialogOpen(true);
    setIsGoalSheetOpen(false);
  };

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;

    setIsDeleting(true);
    const toastId = toast.loading(`Deleting "${goalToDelete.title}"...`);

    try {
      await deleteGoal({ goalId: goalToDelete.id as Id<"goals"> });
      toast.success("Goal deleted successfully", {
        id: toastId,
        description: `"${goalToDelete.title}" has been deleted.`,
      });
      setIsDeleteDialogOpen(false);
      setGoalToDelete(null);
    } catch (error) {
      console.error("Failed to delete goal:", error);
      toast.error("Failed to delete goal", {
        id: toastId,
        description: "Please try again later.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (goal: Goal) => {
    setEditingGoal(goal);
    setIsEditDialogOpen(true);
    setIsGoalSheetOpen(false);
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal) return;

    if (!editingGoal.startDate || !editingGoal.endDate) {
      toast.error("Start and end dates are required");
      return;
    }

    const startDate = new Date(editingGoal.startDate);
    const endDate = new Date(editingGoal.endDate);

    if (endDate < startDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    if (editingGoal.milestones.length === 0) {
      toast.error("At least one milestone is required");
      return;
    }

    setIsUpdating(true);
    const toastId = toast.loading(`Updating "${editingGoal.title}"...`);

    try {
      await updateGoal({
        goalId: editingGoal.id as Id<"goals">,
        title: editingGoal.title,
        description: editingGoal.description,
        category: editingGoal.category,
        timeframe: editingGoal.timeframe,
        priority: editingGoal.priority,
        status: editingGoal.status,
        startDate: editingGoal.startDate,
        endDate: editingGoal.endDate,
        milestones: editingGoal.milestones,
      });

      toast.success("Goal updated successfully", {
        id: toastId,
        description: `"${editingGoal.title}" has been updated.`,
      });
      setIsEditDialogOpen(false);
      setEditingGoal(null);
    } catch (error) {
      console.error("Failed to update goal:", error);
      toast.error("Failed to update goal", {
        id: toastId,
        description: "Please try again later.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddEditingMilestone = () => {
    if (editingMilestone.trim() && editingGoal) {
      setEditingGoal({
        ...editingGoal,
        milestones: [
          ...editingGoal.milestones,
          {
            id: Math.random().toString(36).substr(2, 9),
            title: editingMilestone,
            completed: false,
          },
        ],
      });
      setEditingMilestone("");
    }
  };

  const handleMilestoneToggle = async (
    goalId: string,
    milestoneId: string,
    checked: boolean
  ) => {
    if (!selectedGoal) return;

    const originalGoal = { ...selectedGoal };

    try {
      setSelectedGoal((prevGoal) => {
        if (!prevGoal) return null;
        return {
          ...prevGoal,
          milestones: prevGoal.milestones.map((milestone) =>
            milestone.id === milestoneId
              ? { ...milestone, completed: checked }
              : milestone
          ),
        };
      });

      const updatedGoal = await updateGoal({
        goalId: goalId as Id<"goals">,
        title: originalGoal.title,
        description: originalGoal.description,
        category: originalGoal.category,
        timeframe: originalGoal.timeframe,
        priority: originalGoal.priority,
        status: originalGoal.status,
        startDate: originalGoal.startDate,
        endDate: originalGoal.endDate,
        milestones: originalGoal.milestones.map((milestone) =>
          milestone.id === milestoneId
            ? { ...milestone, completed: checked }
            : milestone
        ),
      });

      if (!updatedGoal) {
        throw new Error("Failed to update milestone");
      }

      setSelectedGoal({
        ...updatedGoal,
        id: updatedGoal._id,
        category: updatedGoal.category as GoalCategory,
        priority: updatedGoal.priority as GoalPriority,
        timeframe: updatedGoal.timeframe as GoalTimeframe,
        status: updatedGoal.status as GoalStatus,
      });
    } catch (error) {
      console.error("Failed to update milestone:", error);

      setSelectedGoal(originalGoal);

      toast.error("Failed to update milestone", {
        description: "Please try again",
      });
    }
  };

  const GoalDetails = () => {
    if (!selectedGoal) return null;

    const handleStatusChange = async (newStatus: GoalStatus) => {
      try {
        await updateGoal({
          goalId: selectedGoal.id as Id<"goals">,
          title: selectedGoal.title,
          description: selectedGoal.description,
          category: selectedGoal.category,
          timeframe: selectedGoal.timeframe,
          priority: selectedGoal.priority,
          status: newStatus,
          startDate: selectedGoal.startDate,
          endDate: selectedGoal.endDate,
          milestones: selectedGoal.milestones,
        });

        setSelectedGoal({
          ...selectedGoal,
          status: newStatus,
        });

        toast.success(`Goal moved to ${newStatus}`);
      } catch (error) {
        console.error("Failed to update goal status:", error);
        toast.error("Failed to update goal status");
      }
    };

    return (
      <Sheet open={isGoalSheetOpen} onOpenChange={setIsGoalSheetOpen}>
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
                {selectedGoal.title}
              </SheetTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  priorityColors[selectedGoal.priority].text
                )}
              >
                {selectedGoal.priority}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {selectedGoal.category}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {selectedGoal.timeframe}
              </Badge>
            </div>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Status</h3>
              <Select
                value={selectedGoal.status}
                onValueChange={(value: GoalStatus) => handleStatusChange(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_STATUSES.map(
                    (status: { label: string; value: GoalStatus }) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            {selectedGoal.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Description</h3>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedGoal.description}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Timeline</h3>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Start:{" "}
                    {new Date(selectedGoal.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    End: {new Date(selectedGoal.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            {selectedGoal.milestones.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Milestones</h3>
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="space-y-2">
                    {selectedGoal.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          id={milestone.id}
                          checked={milestone.completed}
                          onCheckedChange={(checked) => {
                            if (typeof checked === "boolean") {
                              handleMilestoneToggle(
                                selectedGoal.id,
                                milestone.id,
                                checked
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={milestone.id}
                          className={cn(
                            "text-sm text-muted-foreground",
                            milestone.completed && "line-through"
                          )}
                        >
                          {milestone.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="pt-4 border-t space-y-2 mt-5">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Created:{" "}
                {format(
                  new Date(selectedGoal.createdAt),
                  "dd MMM, yyyy, hh:mm aa"
                )}
              </div>
              {selectedGoal.updatedAt && (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Updated:{" "}
                  {format(
                    new Date(selectedGoal.updatedAt),
                    "dd MMM, yyyy, hh:mm aa"
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                handleEditClick(selectedGoal);
                setIsGoalSheetOpen(false);
              }}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                handleDeleteClick(selectedGoal);
                setIsGoalSheetOpen(false);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="w-full sm:w-auto flex items-start sm:justify-between">
          <div className="w-full sm:w-auto space-y-2">
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-8 w-full sm:w-[300px]" />
          </div>
          <Skeleton className="hidden sm:block h-10 w-[140px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-[140px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="space-y-4">
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-[140px]" />
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!isLoading && goals && filteredGoals?.length === 0) {
    const hasNoGoals = goals.length === 0;
    const hasActiveFilters =
      selectedCategory !== "all" || selectedTimeframe !== "all";

    return (
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-tight">Goals</h1>
            <p className="text-muted-foreground mt-1 text-xl font-light">
              Track and manage your personal and professional goals
            </p>
          </div>
          <Dialog
            open={isNewGoalDialogOpen}
            onOpenChange={setIsNewGoalDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                className="w-full sm:w-auto gap-2 dark:bg-muted/50"
                variant="outline"
              >
                <Plus className="h-4 w-4" /> Create New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, title: e.target.value })
                    }
                    placeholder="Enter goal title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, description: e.target.value })
                    }
                    placeholder="Enter goal description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value: GoalCategory) =>
                        setNewGoal({ ...newGoal, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Timeframe</Label>
                    <Select
                      value={newGoal.timeframe}
                      onValueChange={(value: GoalTimeframe) =>
                        setNewGoal({ ...newGoal, timeframe: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEFRAMES.map((timeframe) => (
                          <SelectItem
                            key={timeframe.value}
                            value={timeframe.value}
                          >
                            {timeframe.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select
                    value={newGoal.priority}
                    onValueChange={(value: GoalPriority) =>
                      setNewGoal({ ...newGoal, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((priority) => (
                        <SelectItem
                          key={priority.value}
                          value={priority.value}
                          className={priorityColors[priority.value].text}
                        >
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      required
                      value={
                        newGoal.startDate?.toISOString().split("T")[0] || ""
                      }
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          startDate: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      End Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      required
                      min={newGoal.startDate?.toISOString().split("T")[0] || ""}
                      value={newGoal.endDate?.toISOString().split("T")[0] || ""}
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          endDate: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>
                    Milestones <span className="text-destructive">*</span>
                  </Label>
                  <div className="space-y-2">
                    {newGoal.milestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className="flex items-center gap-2"
                      >
                        <Input
                          value={milestone.title}
                          onChange={(e) => {
                            const updatedMilestones = [...newGoal.milestones];
                            updatedMilestones[index].title = e.target.value;
                            setNewGoal({
                              ...newGoal,
                              milestones: updatedMilestones,
                            });
                          }}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            const updatedMilestones = newGoal.milestones.filter(
                              (_, i) => i !== index
                            );
                            setNewGoal({
                              ...newGoal,
                              milestones: updatedMilestones,
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add a milestone"
                        value={newMilestone}
                        onChange={(e) => setNewMilestone(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddMilestone();
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleAddMilestone}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleCreateGoal}
                  disabled={
                    isCreating ||
                    !newGoal.title ||
                    !newGoal.category ||
                    !newGoal.timeframe ||
                    !newGoal.priority ||
                    !newGoal.startDate ||
                    !newGoal.endDate ||
                    newGoal.milestones.length === 0
                  }
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Goal"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4  md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateStats().totalGoals}
              </div>
              <Progress
                value={calculateStats().completionRate}
                className="mt-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Goals
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateStats().activeGoals}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {calculateStats().activeGoals} goals in progress
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateStats().completedGoals}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {calculateStats().completionRate.toFixed(0)}% completion rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateStats().upcomingGoals}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {calculateStats().upcomingGoals} goals planned
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="flex w-full gap-4 sm:w-auto">
          <Select
            value={selectedCategory}
            onValueChange={(value: GoalCategory) => setSelectedCategory(value)}
          >
            <SelectTrigger className="w-[50%] sm:w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedTimeframe}
            onValueChange={(value: GoalTimeframe) =>
              setSelectedTimeframe(value)
            }
          >
            <SelectTrigger className="w-[50%] sm:w-[180px]">
              <SelectValue placeholder="Select Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Timeframes</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="active" className="w-full sm:w-auto">
              Active Goals
            </TabsTrigger>
            <TabsTrigger value="completed" className="w-full sm:w-auto">
              Completed
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="w-full sm:w-auto">
              Upcoming
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
                <div className="relative p-6 bg-secondary dark:bg-muted/50 backdrop-blur-sm rounded-full ring-1 ring-border/50">
                  {hasActiveFilters ? (
                    <Search
                      className="size-14 text-primary/70"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <Target
                      className="size-14 text-primary/70"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-3 max-w-xl">
                <h3 className="text-2xl font-semibold tracking-tight">
                  {hasNoGoals ? "No Goals Yet" : "No goals found"}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {hasNoGoals ? (
                    <>
                      Ready to achieve something great? Start by creating your
                      first goal using the{" "}
                      <b className="font-semibold text-primary">New Goal</b>{" "}
                      button above.
                    </>
                  ) : (
                    <>
                      {selectedCategory !== "all" && (
                        <span>
                          Category Filter:{" "}
                          <b>
                            {selectedCategory.charAt(0).toUpperCase() +
                              selectedCategory.slice(1)}
                          </b>
                          <br />
                        </span>
                      )}
                      {selectedTimeframe !== "all" && (
                        <span>
                          Timeframe Filter:{" "}
                          <b>
                            {selectedTimeframe.charAt(0).toUpperCase() +
                              selectedTimeframe.slice(1)}
                          </b>
                          <br />
                        </span>
                      )}
                      <span className="block mt-2">
                        Try adjusting your filters to find what you&apos;re
                        looking for.
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
                <div className="relative p-6 bg-secondary dark:bg-muted/50 backdrop-blur-sm rounded-full ring-1 ring-border/50">
                  {hasActiveFilters ? (
                    <Search
                      className="size-14 text-primary/70"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <CheckCircle2
                      className="size-14 text-primary/70"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-3 max-w-xl">
                <h3 className="text-2xl font-semibold tracking-tight">
                  {hasNoGoals
                    ? "No Completed Goals Yet"
                    : "No completed goals found"}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {hasNoGoals ? (
                    <>
                      Complete your active goals to see them here. Start by
                      creating a new goal using the{" "}
                      <b className="font-semibold text-primary">New Goal</b>{" "}
                      button above.
                    </>
                  ) : (
                    <>
                      {selectedCategory !== "all" && (
                        <span>
                          Category Filter:{" "}
                          <b>
                            {selectedCategory.charAt(0).toUpperCase() +
                              selectedCategory.slice(1)}
                          </b>
                          <br />
                        </span>
                      )}
                      {selectedTimeframe !== "all" && (
                        <span>
                          Timeframe Filter:{" "}
                          <b>
                            {selectedTimeframe.charAt(0).toUpperCase() +
                              selectedTimeframe.slice(1)}
                          </b>
                          <br />
                        </span>
                      )}
                      <span className="block mt-2">
                        Try adjusting your filters to find completed goals.
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="upcoming" className="space-y-4">
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
                <div className="relative p-6 bg-secondary dark:bg-muted/50 backdrop-blur-sm rounded-full ring-1 ring-border/50">
                  {hasActiveFilters ? (
                    <Search
                      className="size-14 text-primary/70"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <ArrowUpRight
                      className="size-14 text-primary/70"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-3 max-w-xl">
                <h3 className="text-2xl font-semibold tracking-tight">
                  {hasNoGoals
                    ? "No Upcoming Goals Yet"
                    : "No upcoming goals found"}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {hasNoGoals ? (
                    <>
                      Plan for the future by creating new goals. Start by using
                      the <b className="font-semibold text-primary">New Goal</b>{" "}
                      button above.
                    </>
                  ) : (
                    <>
                      {selectedCategory !== "all" && (
                        <span>
                          Category Filter:{" "}
                          <b>
                            {selectedCategory.charAt(0).toUpperCase() +
                              selectedCategory.slice(1)}
                          </b>
                          <br />
                        </span>
                      )}
                      {selectedTimeframe !== "all" && (
                        <span>
                          Timeframe Filter:{" "}
                          <b>
                            {selectedTimeframe.charAt(0).toUpperCase() +
                              selectedTimeframe.slice(1)}
                          </b>
                          <br />
                        </span>
                      )}
                      <span className="block mt-2">
                        Try adjusting your filters to find upcoming goals.
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-tight">Goals</h1>
            <p className="text-muted-foreground mt-1 text-xl font-light">
              Track and manage your personal and professional goals
            </p>
          </div>
          <Dialog
            open={isNewGoalDialogOpen}
            onOpenChange={setIsNewGoalDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                className="w-full sm:w-auto gap-2 dark:bg-muted/50"
                variant="outline"
              >
                <Plus className="h-4 w-4" /> Create New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, title: e.target.value })
                    }
                    placeholder="Enter goal title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, description: e.target.value })
                    }
                    placeholder="Enter goal description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value: GoalCategory) =>
                        setNewGoal({ ...newGoal, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Timeframe</Label>
                    <Select
                      value={newGoal.timeframe}
                      onValueChange={(value: GoalTimeframe) =>
                        setNewGoal({ ...newGoal, timeframe: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEFRAMES.map((timeframe) => (
                          <SelectItem
                            key={timeframe.value}
                            value={timeframe.value}
                          >
                            {timeframe.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select
                    value={newGoal.priority}
                    onValueChange={(value: GoalPriority) =>
                      setNewGoal({ ...newGoal, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((priority) => (
                        <SelectItem
                          key={priority.value}
                          value={priority.value}
                          className={priorityColors[priority.value].text}
                        >
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      required
                      value={
                        newGoal.startDate?.toISOString().split("T")[0] || ""
                      }
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          startDate: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      End Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      required
                      min={newGoal.startDate?.toISOString().split("T")[0] || ""}
                      value={newGoal.endDate?.toISOString().split("T")[0] || ""}
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          endDate: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>
                    Milestones <span className="text-destructive">*</span>
                  </Label>
                  <div className="space-y-2">
                    {newGoal.milestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className="flex items-center gap-2"
                      >
                        <Input
                          value={milestone.title}
                          onChange={(e) => {
                            const updatedMilestones = [...newGoal.milestones];
                            updatedMilestones[index].title = e.target.value;
                            setNewGoal({
                              ...newGoal,
                              milestones: updatedMilestones,
                            });
                          }}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            const updatedMilestones = newGoal.milestones.filter(
                              (_, i) => i !== index
                            );
                            setNewGoal({
                              ...newGoal,
                              milestones: updatedMilestones,
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add a milestone"
                        value={newMilestone}
                        onChange={(e) => setNewMilestone(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddMilestone();
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleAddMilestone}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleCreateGoal}
                  disabled={
                    isCreating ||
                    !newGoal.title ||
                    !newGoal.category ||
                    !newGoal.timeframe ||
                    !newGoal.priority ||
                    !newGoal.startDate ||
                    !newGoal.endDate ||
                    newGoal.milestones.length === 0
                  }
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Goal"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateStats().totalGoals}
              </div>
              <Progress
                value={calculateStats().completionRate}
                className="mt-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Goals
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateStats().activeGoals}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {calculateStats().activeGoals} goals in progress
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateStats().completedGoals}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {calculateStats().completionRate.toFixed(0)}% completion rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateStats().upcomingGoals}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {calculateStats().upcomingGoals} goals planned
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="flex w-full gap-4 sm:w-auto">
          <Select
            value={selectedCategory}
            onValueChange={(value: GoalCategory) => setSelectedCategory(value)}
          >
            <SelectTrigger className="w-[50%] sm:w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedTimeframe}
            onValueChange={(value: GoalTimeframe) =>
              setSelectedTimeframe(value)
            }
          >
            <SelectTrigger className="w-[50%] sm:w-[180px]">
              <SelectValue placeholder="Select Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Timeframes</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="active" className="w-full sm:w-auto">
              Active Goals
            </TabsTrigger>
            <TabsTrigger value="completed" className="w-full sm:w-auto">
              Completed
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="w-full sm:w-auto">
              Upcoming
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGoals
                ?.filter((goal) => goal.status === "active")
                .map((goal) =>
                  renderGoalCard({
                    ...goal,
                    id: goal._id,
                    priority: goal.priority as GoalPriority,
                    category: goal.category as GoalCategory,
                    timeframe: goal.timeframe as GoalTimeframe,
                    status: goal.status as GoalStatus,
                    startDate: goal.startDate,
                    endDate: goal.endDate,
                  })
                )}
            </div>
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGoals
                ?.filter((goal) => goal.status === "completed")
                .map((goal) =>
                  renderGoalCard({
                    ...goal,
                    id: goal._id,
                    priority: goal.priority as GoalPriority,
                    category: goal.category as GoalCategory,
                    timeframe: goal.timeframe as GoalTimeframe,
                    status: goal.status as GoalStatus,
                    startDate: goal.startDate,
                    endDate: goal.endDate,
                  })
                )}
            </div>
          </TabsContent>
          <TabsContent value="upcoming" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGoals
                ?.filter((goal) => goal.status === "upcoming")
                .map((goal) => (
                  <div
                    key={goal._id}
                    className="cursor-pointer"
                    onClick={() =>
                      handleGoalClick({
                        ...goal,
                        id: goal._id,
                        priority: goal.priority as GoalPriority,
                        category: goal.category as GoalCategory,
                        timeframe: goal.timeframe as GoalTimeframe,
                        status: goal.status as GoalStatus,
                      })
                    }
                  >
                    {renderGoalCard({
                      ...goal,
                      id: goal._id,
                      priority: goal.priority as GoalPriority,
                      category: goal.category as GoalCategory,
                      timeframe: goal.timeframe as GoalTimeframe,
                      status: goal.status as GoalStatus,
                      startDate: goal.startDate,
                      endDate: goal.endDate,
                    })}
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
        <GoalDetails />
      </div>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Goal</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete {goalToDelete?.title}? This action
            cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setGoalToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGoal}
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editingGoal?.title || ""}
                onChange={(e) =>
                  setEditingGoal(
                    editingGoal
                      ? { ...editingGoal, title: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editingGoal?.description || ""}
                onChange={(e) =>
                  setEditingGoal(
                    editingGoal
                      ? { ...editingGoal, description: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={editingGoal?.category}
                onValueChange={(value: GoalCategory) =>
                  setEditingGoal(
                    editingGoal ? { ...editingGoal, category: value } : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Timeframe</Label>
              <Select
                value={editingGoal?.timeframe}
                onValueChange={(value: GoalTimeframe) =>
                  setEditingGoal(
                    editingGoal ? { ...editingGoal, timeframe: value } : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((timeframe) => (
                    <SelectItem key={timeframe.value} value={timeframe.value}>
                      {timeframe.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={editingGoal?.priority}
                onValueChange={(value: GoalPriority) =>
                  setEditingGoal(
                    editingGoal ? { ...editingGoal, priority: value } : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Dates</Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="start-date" className="text-sm">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    required
                    value={editingGoal?.startDate || ""}
                    onChange={(e) =>
                      setEditingGoal(
                        editingGoal
                          ? { ...editingGoal, startDate: e.target.value }
                          : null
                      )
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="end-date" className="text-sm">
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    required
                    min={editingGoal?.startDate || ""}
                    value={editingGoal?.endDate || ""}
                    onChange={(e) =>
                      setEditingGoal(
                        editingGoal
                          ? { ...editingGoal, endDate: e.target.value }
                          : null
                      )
                    }
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>
                Milestones <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-2">
                {editingGoal?.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-center gap-2">
                    <Input
                      value={milestone.title}
                      onChange={(e) => {
                        const updatedMilestones = [...editingGoal?.milestones];
                        updatedMilestones[index].title = e.target.value;
                        setEditingGoal({
                          ...editingGoal,
                          milestones: updatedMilestones,
                        });
                      }}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        const updatedMilestones =
                          editingGoal?.milestones.filter((_, i) => i !== index);
                        setEditingGoal({
                          ...editingGoal,
                          milestones: updatedMilestones,
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a milestone"
                    value={editingMilestone}
                    onChange={(e) => setEditingMilestone(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddEditingMilestone();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleAddEditingMilestone}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateGoal}
              disabled={
                isUpdating ||
                !editingGoal?.title ||
                !editingGoal?.category ||
                !editingGoal?.timeframe ||
                !editingGoal?.priority ||
                !editingGoal?.startDate ||
                !editingGoal?.endDate ||
                editingGoal.milestones.length === 0
              }
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
    </>
  );
}
