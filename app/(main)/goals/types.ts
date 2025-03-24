export type GoalCategory =
  | "all"
  | "personal"
  | "work"
  | "health"
  | "financial"
  | "shopping"
  | "education";
export type GoalTimeframe = "all" | "daily" | "weekly" | "monthly" | "yearly";
export type GoalStatus = "active" | "completed" | "upcoming";
export type GoalPriority = "low" | "medium" | "high";

export type PriorityColors = {
  [K in GoalPriority]: {
    text: `text-${string}-500`;
    bg: `bg-${string}-500/10`;
  };
};

export const priorityColors: PriorityColors = {
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

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  timeframe: GoalTimeframe;
  status: GoalStatus;
  priority: GoalPriority;
  progress: number;
  startDate: string;
  endDate: string;
  milestones: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  createdAt: string;
  updatedAt?: string;
}

export interface GoalStats {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  upcomingDeadlines: number;
  completionRate: number;
}
