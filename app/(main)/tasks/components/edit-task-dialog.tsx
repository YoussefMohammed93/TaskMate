import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { TagBadge } from "./tag-badge";
import { X, Plus } from "lucide-react";
import { Loader2 } from "lucide-react";
import { TagSelect } from "./tag-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { priorities, categories } from "../constants";
import RecurrenceSelector from "./recurrence-selector";
import { CustomCategory, RecurrencePattern, Task } from "../types";

interface EditTaskDialogProps {
  task: Task;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Task) => Promise<void>;
  customCategories: CustomCategory[];
  isEditing?: boolean;
}

export function EditTaskDialog({
  task,
  isOpen,
  onOpenChange,
  onSave,
  customCategories,
  isEditing = false,
}: EditTaskDialogProps) {
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const handleSave = async () => {
    await onSave(editedTask);
    onOpenChange(false);
  };

  const addNewSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask = {
        id: (editedTask.subtasks?.length || 0) + 1,
        title: newSubtaskTitle.trim(),
        completed: false,
      };
      setEditedTask({
        ...editedTask,
        subtasks: [...(editedTask.subtasks || []), newSubtask],
      });
      setNewSubtaskTitle("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[625px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-task-name">Task Name</Label>
            <Input
              id="edit-task-name"
              value={editedTask.title}
              onChange={(e) =>
                setEditedTask({ ...editedTask, title: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedTask.description}
              onChange={(e) =>
                setEditedTask({ ...editedTask, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={editedTask.priority}
                onValueChange={(value) =>
                  setEditedTask({ ...editedTask, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(
                    (priority: {
                      value: string;
                      label: string;
                      color: string;
                    }) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={editedTask.category}
                onValueChange={(value) =>
                  setEditedTask({ ...editedTask, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.name}
                      value={category.name.toLowerCase()}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn("w-3 h-3 rounded-full", category.color)}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                  {customCategories.map((category) => (
                    <SelectItem
                      key={category.name}
                      value={category.name.toLowerCase()}
                      className="bg-transparent"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full",
                            category.color.replace("/10", "")
                          )}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Subtasks</Label>
            <div className="space-y-2">
              {editedTask.subtasks?.map((subtask, index) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <Input
                    value={subtask.title}
                    onChange={(e) => {
                      const updatedSubtasks = [...(editedTask.subtasks || [])];
                      updatedSubtasks[index].title = e.target.value;
                      setEditedTask({
                        ...editedTask,
                        subtasks: updatedSubtasks,
                      });
                    }}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      const updatedSubtasks = editedTask.subtasks?.filter(
                        (_, i) => i !== index
                      );
                      setEditedTask({
                        ...editedTask,
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
              {editedTask.tags.map((tag) => (
                <TagBadge
                  key={tag.id}
                  tag={{
                    id: tag.id,
                    name: tag.name ?? "",
                    color: tag.color ?? "red",
                  }}
                  onRemove={() => {
                    setEditedTask({
                      ...editedTask,
                      tags: editedTask.tags.filter((t) => t.id !== tag.id),
                    });
                  }}
                />
              ))}
            </div>
            <TagSelect
              selectedTags={editedTask.tags.map((tag) => ({
                id: tag.id,
                name: tag.name ?? "",
                color: tag.color ?? "red",
              }))}
              onTagSelect={(tag) => {
                setEditedTask({
                  ...editedTask,
                  tags: [...editedTask.tags, tag],
                });
              }}
            />
          </div>
          <div className="grid gap-2">
            <RecurrenceSelector
              value={editedTask.recurrence ?? null}
              onChange={(pattern: RecurrencePattern | null) =>
                setEditedTask({
                  ...editedTask,
                  recurrence: pattern || undefined,
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isEditing}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isEditing}>
            {isEditing ? (
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
  );
}
