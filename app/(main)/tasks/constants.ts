export const priorities = [
  { value: "high", label: "High", color: "text-red-500" },
  { value: "medium", label: "Medium", color: "text-yellow-500" },
  { value: "low", label: "Low", color: "text-green-500" },
] as const;

export const categories = [
  { name: "Work", color: "bg-blue-500" },
  { name: "Study", color: "bg-purple-500" },
  { name: "Personal", color: "bg-green-500" },
  { name: "Sport", color: "bg-red-500" },
  { name: "Programming", color: "bg-yellow-500" },
  { name: "University", color: "bg-orange-500" },
  { name: "Praying", color: "bg-cyan-500" },
  { name: "Reading", color: "bg-pink-500" },
] as const;

export const categoryColors = [
  { value: "bg-red-500", label: "Red" },
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-cyan-500", label: "Cyan" },
  { value: "bg-pink-500", label: "Pink" },
] as const;

export const defaultTags = [
  { id: "1", name: "Bug", color: "red" },
  { id: "2", name: "Feature", color: "blue" },
  { id: "3", name: "Documentation", color: "purple" },
  { id: "4", name: "Urgent", color: "orange" },
  { id: "5", name: "Enhancement", color: "green" },
] as const;

export type Category = (typeof categories)[number];
export type CategoryColor = (typeof categoryColors)[number]["value"];
export type Priority = (typeof priorities)[number]["value"];
