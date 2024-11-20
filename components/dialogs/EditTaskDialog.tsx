import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import TaskForm from "../TaskForm";
import { Task } from "@/lib/types";


interface EditTaskDialogProps {
  selectedTask: Task | null;
  showEditTaskDialog: boolean;
  setShowEditTaskDialog: (show: boolean) => void;
  fetchTasks: () => void;
}

export const EditTaskDialog = ({
  selectedTask,
  showEditTaskDialog,
  setShowEditTaskDialog,
  fetchTasks,
}: EditTaskDialogProps) => {
  return (
    <Dialog
      open={showEditTaskDialog && selectedTask !== null}
      onOpenChange={() => setShowEditTaskDialog(false)}
    >
      <DialogTrigger />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        {selectedTask && (
          <TaskForm
            task={selectedTask}
            refreshTasks={fetchTasks}
            closeDialog={() => setShowEditTaskDialog(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
