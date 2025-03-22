export type RecurrenceFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  category: string;
  completed?: boolean;
  subtasks?: Subtask[];
  tags: Tag[];
  recurrence?: RecurrencePattern | null;
  dueDate: Date;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface CustomCategory {
  name: string;
  color: string;
}

export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number;
  endDate?: Date | null;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  occurrences?: number | null;
}
