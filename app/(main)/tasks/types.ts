export interface Task {
  id?: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  dueDate: string;
  status: string;
  tags: string[];
  subtasks: string[];
  recurrence?: string;
  customCategory?: string;
} 

export type CategoryColor =
  | "bg-red-500"
  | "bg-blue-500"
  | "bg-green-500"
  | "bg-purple-500"
  | "bg-orange-500"
  | "bg-yellow-500";

export interface CustomCategory {
  name: string;
  color: CategoryColor;
}
