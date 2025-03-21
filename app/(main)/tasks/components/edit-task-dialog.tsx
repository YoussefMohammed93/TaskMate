import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Task, CustomCategory } from "../types";
import { Button } from "@/components/ui/button";

interface EditTaskDialogProps {
  task: Task;
  editedTask?: Task;
  setEditedTask?: (task: Task) => void;
  onSave?: (task: Task) => void;
  customCategories?: CustomCategory[];
  setCustomCategories?: React.Dispatch<React.SetStateAction<CustomCategory[]>>;
}

export function EditTaskDialog(
  {
    // task,
    // editedTask,
    // setEditedTask,
    // onSave,
  }: EditTaskDialogProps
) {
  return (
    <Dialog>
      <DialogContent className="sm:max-w-[625px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-task-name">Task Name</Label>
            <Input
              id="edit-task-name"
              // value={editedTask.title}
              // onChange={(e) =>
              //   setEditedTask({ ...editedTask, title: e.target.value })
              // }
            />
          </div>
          {/* Add other form fields here */}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => {}}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={() => {}}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
