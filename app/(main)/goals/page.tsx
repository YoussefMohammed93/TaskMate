"use client";

import {
  GoalCategory,
  GoalTimeframe,
  Goal,
  priorityColors,
  GoalPriority,
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
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MOCK_GOALS: Goal[] = [
  {
    id: "1",
    title: "Complete Web Development Course",
    description: "Finish the full-stack development bootcamp",
    category: "personal",
    timeframe: "monthly",
    status: "active",
    priority: "high",
    progress: 65,
    startDate: "2024-02-01",
    endDate: "2024-03-01",
    milestones: [
      { id: "m1", title: "HTML & CSS Modules", completed: true },
      { id: "m2", title: "JavaScript Fundamentals", completed: true },
      { id: "m3", title: "React Framework", completed: false },
      { id: "m4", title: "Backend Development", completed: false },
    ],
  },
  {
    id: "2",
    title: "Run 5K Marathon",
    description: "Train and complete a 5K marathon",
    category: "health",
    timeframe: "weekly",
    status: "active",
    priority: "medium",
    progress: 40,
    startDate: "2024-02-10",
    endDate: "2024-02-24",
    milestones: [
      { id: "m1", title: "Complete 1K without stopping", completed: true },
      { id: "m2", title: "Regular 2K runs", completed: false },
      { id: "m3", title: "Practice 3K distance", completed: false },
    ],
  },
  {
    id: "3",
    title: "Save Emergency Fund",
    description: "Build a 6-month emergency fund",
    category: "financial",
    timeframe: "yearly",
    status: "active",
    priority: "high",
    progress: 30,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    milestones: [
      { id: "m1", title: "Save first $1000", completed: true },
      { id: "m2", title: "Reach 3 months expenses", completed: false },
      { id: "m3", title: "Reach 6 months expenses", completed: false },
    ],
  },
  {
    id: "4",
    title: "Learn Spanish",
    description: "Achieve B1 level in Spanish",
    category: "personal",
    timeframe: "monthly",
    status: "upcoming",
    priority: "medium",
    progress: 0,
    startDate: "2024-03-01",
    endDate: "2024-06-01",
    milestones: [
      { id: "m1", title: "Complete A1 level", completed: false },
      { id: "m2", title: "Complete A2 level", completed: false },
      { id: "m3", title: "Reach B1 level", completed: false },
    ],
  },
  {
    id: "5",
    title: "Project Management Certification",
    description: "Obtain PMP certification",
    category: "work",
    timeframe: "monthly",
    status: "completed",
    priority: "high",
    progress: 100,
    startDate: "2024-01-01",
    endDate: "2024-02-15",
    milestones: [
      { id: "m1", title: "Complete study materials", completed: true },
      { id: "m2", title: "Practice exams", completed: true },
      { id: "m3", title: "Pass certification", completed: true },
    ],
  },
  {
    id: "6",
    title: "Daily Meditation Practice",
    description: "Establish a consistent meditation routine",
    category: "health",
    timeframe: "daily",
    status: "active",
    priority: "low",
    progress: 75,
    startDate: "2024-02-01",
    endDate: "2024-02-29",
    milestones: [
      { id: "m1", title: "5 minutes daily", completed: true },
      { id: "m2", title: "10 minutes daily", completed: true },
      { id: "m3", title: "15 minutes daily", completed: false },
    ],
  },
  {
    id: "7",
    title: "Launch Side Business",
    description: "Start an online consulting business",
    category: "work",
    timeframe: "yearly",
    status: "upcoming",
    priority: "high",
    progress: 0,
    startDate: "2024-04-01",
    endDate: "2024-12-31",
    milestones: [
      { id: "m1", title: "Business plan", completed: false },
      { id: "m2", title: "Website launch", completed: false },
      { id: "m3", title: "First client", completed: false },
    ],
  },
  {
    id: "8",
    title: "Read 24 Books in 2024",
    description: "Complete reading challenge for the year",
    category: "personal",
    timeframe: "yearly",
    status: "active",
    priority: "medium",
    progress: 15,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    milestones: [
      { id: "m1", title: "Q1 - 6 books", completed: false },
      { id: "m2", title: "Q2 - 6 books", completed: false },
      { id: "m3", title: "Q3 - 6 books", completed: false },
      { id: "m4", title: "Q4 - 6 books", completed: false },
    ],
  },
];

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
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
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

  const calculateStats = () => {
    const total = goals.length;
    const completed = goals.filter((g) => g.status === "completed").length;
    const active = goals.filter((g) => g.status === "active").length;
    const upcoming = goals.filter((g) => g.status === "upcoming").length;
    return {
      totalGoals: total,
      completedGoals: completed,
      activeGoals: active,
      upcomingGoals: upcoming,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  };

  const filteredGoals = goals.filter((goal) => {
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
      className="cursor-pointer transition-colors hover:bg-muted/50"
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
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "capitalize",
                priorityColors[goal.priority].text,
                priorityColors[goal.priority].bg
              )}
            >
              {goal.priority}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {goal.category}
            </Badge>
          </div>
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
        <CardTitle className="text-lg mt-2">{goal.title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Due {new Date(goal.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {goal.milestones.filter((m) => m.completed).length}/
                {goal.milestones.length} milestones
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleCreateGoal = () => {
    if (
      !newGoal.title ||
      !newGoal.category ||
      !newGoal.timeframe ||
      !newGoal.priority
    ) {
      return;
    }

    const goal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      timeframe: newGoal.timeframe,
      priority: newGoal.priority,
      status: "active",
      progress: 0,
      startDate:
        newGoal.startDate?.toISOString().split("T")[0] ||
        new Date().toISOString().split("T")[0],
      endDate:
        newGoal.endDate?.toISOString().split("T")[0] ||
        new Date().toISOString().split("T")[0],
      milestones: newGoal.milestones,
    };

    setGoals([...goals, goal]);
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

  const handleDeleteGoal = () => {
    if (goalToDelete) {
      setGoals(goals.filter((goal) => goal.id !== goalToDelete.id));
      setIsDeleteDialogOpen(false);
      setGoalToDelete(null);
    }
  };

  const handleEditClick = (goal: Goal) => {
    setEditingGoal(goal);
    setIsEditDialogOpen(true);
    setIsGoalSheetOpen(false);
  };

  const handleUpdateGoal = () => {
    if (editingGoal) {
      setGoals(
        goals.map((goal) => (goal.id === editingGoal.id ? editingGoal : goal))
      );
      setIsEditDialogOpen(false);
      setEditingGoal(null);
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

  const handleRemoveMilestone = (milestoneId: string) => {
    if (editingGoal) {
      setEditingGoal({
        ...editingGoal,
        milestones: editingGoal.milestones.filter((m) => m.id !== milestoneId),
      });
    }
  };

  const handleToggleMilestone = (milestoneId: string) => {
    if (editingGoal) {
      setEditingGoal({
        ...editingGoal,
        milestones: editingGoal.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        ),
      });
    }
  };

  const GoalDetails = () => {
    if (!selectedGoal) return null;

    return (
      <Sheet open={isGoalSheetOpen} onOpenChange={setIsGoalSheetOpen}>
        <SheetContent
          side="right"
          className={cn(
            "overflow-y-auto sheet border-none",
            isMobile && "w-full max-w-none"
          )}
        >
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold">
              {selectedGoal.title}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
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
              <p className="text-muted-foreground">
                {selectedGoal.description}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Progress</h3>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Overall Progress</span>
                  <span>{selectedGoal.progress}%</span>
                </div>
                <Progress value={selectedGoal.progress} className="h-2" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p>{new Date(selectedGoal.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p>{new Date(selectedGoal.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Milestones</h3>
              <div className="space-y-2">
                {selectedGoal.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-2 bg-muted p-3 rounded-lg"
                  >
                    <Checkbox
                      checked={milestone.completed}
                      // onCheckedChange={(checked) => {
                      // }}
                    />
                    <span
                      className={cn(
                        milestone.completed &&
                          "line-through text-muted-foreground"
                      )}
                    >
                      {milestone.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleEditClick(selectedGoal)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleDeleteClick(selectedGoal)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

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
              <Button className="gap-2 dark:bg-muted/50" variant="outline">
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
                    <Label>Start Date</Label>
                    <Input
                      type="date"
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
                    <Label>End Date</Label>
                    <Input
                      type="date"
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
                  <Label>Milestones</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                      placeholder="Add a milestone"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddMilestone}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {newGoal.milestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className="flex items-center justify-between bg-muted p-2 rounded-md"
                      >
                        <span>{milestone.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setNewGoal({
                              ...newGoal,
                              milestones: newGoal.milestones.filter(
                                (_, i) => i !== index
                              ),
                            })
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
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
                    !newGoal.title ||
                    !newGoal.category ||
                    !newGoal.timeframe ||
                    !newGoal.priority
                  }
                >
                  Create Goal
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
        <div className="flex gap-4 mb-6">
          <Select
            value={selectedCategory}
            onValueChange={(value: GoalCategory) => setSelectedCategory(value)}
          >
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[180px]">
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
          <TabsList>
            <TabsTrigger value="active">Active Goals</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGoals
                .filter((goal) => goal.status === "active")
                .map(renderGoalCard)}
            </div>
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGoals
                .filter((goal) => goal.status === "completed")
                .map(renderGoalCard)}
            </div>
          </TabsContent>
          <TabsContent value="upcoming" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGoals
                .filter((goal) => goal.status === "upcoming")
                .map(renderGoalCard)}
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
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGoal}>
              Delete
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
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
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
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
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
              <Label>Milestones</Label>
              <div className="space-y-2">
                {editingGoal?.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-2 group"
                  >
                    <Checkbox
                      checked={milestone.completed}
                      onCheckedChange={() =>
                        handleToggleMilestone(milestone.id)
                      }
                    />
                    <span className="flex-1">{milestone.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveMilestone(milestone.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new milestone"
                    value={editingMilestone}
                    onChange={(e) => setEditingMilestone(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddEditingMilestone();
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="icon"
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
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingGoal(null);
                setEditingMilestone("");
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!editingGoal?.title.trim()}
              onClick={handleUpdateGoal}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
