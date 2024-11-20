import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { Textarea } from "./ui/textarea";
import { useState, useEffect } from "react";
import { Plus, SquareArrowOutUpRight, Loader2 } from "lucide-react";

interface TaskFormProps {
  task?: {
    title: string;
    id: string;
    description: string;
    done: boolean;
    createdAt: string;
    updatedAt: string;
    category: string | null;
  } | null;
  refreshTasks: () => void;
  closeDialog: () => void;
}

const categories = [
  { label: "Worship", value: "worship", icon: "🙏" },
  { label: "Work", value: "work", icon: "🛠️" },
  { label: "Personal", value: "personal", icon: "🏠" },
  { label: "Learn", value: "learn", icon: "📚" },
  { label: "Sport", value: "sport", icon: "🏋️" },
  { label: "Read", value: "read", icon: "📖" },
];

const TaskForm = ({ task, refreshTasks, closeDialog }: TaskFormProps) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [category, setCategory] = useState(task?.category || "worship");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const body = { title, description, category };
    const method = task ? "PATCH" : "POST";

    setLoading(true);

    try {
      const response = await fetch("/api/tasks", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task?.id, ...body }),
      });

      if (!response.ok) {
        throw new Error("Failed to save the task");
      }

      toast.success(
        task ? "Task updated successfully!" : "Task added successfully!"
      );
      refreshTasks();
      closeDialog();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An error occurred while saving the task.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setCategory(task.category || "work");
    }
  }, [task]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2">Title</label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2"
        />
      </div>
      <div>
        <label className="block mb-2">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 resize-none"
        />
      </div>
      <div>
        <label className="block mb-2">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem
                key={cat.value}
                value={cat.value}
                className="cursor-pointer"
              >
                <span>
                  {cat.icon} {cat.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-5">
        <Button onClick={handleSubmit} className="w-full">
          {loading ? (
            <div className="flex justify-center items-center space-x-2">
              <Loader2 className="animate-spin size-4" />
              <span>{task ? "Updating..." : "Adding..."}</span>
            </div>
          ) : task ? (
            <span className="flex items-center gap-x-2">
              Update Task
              <SquareArrowOutUpRight className="size-4" />
            </span>
          ) : (
            <span className="flex items-center gap-x-2">
              Add Task
              <Plus className="size-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TaskForm;
