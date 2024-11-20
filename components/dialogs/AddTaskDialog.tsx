import TaskForm from "../TaskForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface AddTaskDialogProps {
  showAddTaskDialog: boolean;
  setShowAddTaskDialog: React.Dispatch<React.SetStateAction<boolean>>;
  refreshTasks: () => void;
}

export const AddTaskDialog = ({
  showAddTaskDialog,
  setShowAddTaskDialog,
  refreshTasks,
}: AddTaskDialogProps) => {
  return (
    <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new task</DialogTitle>
        </DialogHeader>
        <TaskForm
          refreshTasks={() => {
            refreshTasks();
          }}
          closeDialog={() => setShowAddTaskDialog(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
